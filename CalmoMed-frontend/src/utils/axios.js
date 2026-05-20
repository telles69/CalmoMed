import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 segundos
});

// Interceptor para adicionar token de autenticação (se existir)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout na requisição');
    } else if (error.response?.status === 401) {
      // Token expirado ou inválido
      console.error('Não autenticado');
    } else if (error.response?.status === 403) {
      console.error('Sem permissão');
    } else if (!error.response) {
      console.error('Erro de rede ou servidor offline');
    }
    return Promise.reject(error);
  }
);

export default instance;
