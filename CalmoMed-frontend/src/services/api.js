import axios from '../utils/axios';

const TOKEN_KEY = 'calmomed_token';
const USER_KEY = 'calmomed_user';

// Serviço de Autenticação
export const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Armazenar token e usuário no localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Adicionar token ao header padrão do axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, user };
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao fazer login' };
    }
  },

  // Registro
  async register(name, email, password, cpf) {
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        cpf,
        role: 'user'
      });
      const { token, user } = response.data;
      
      // Armazenar token e usuário no localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Adicionar token ao header padrão do axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, user };
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao cadastrar' };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete axios.defaults.headers.common['Authorization'];
  },

  // Obter token armazenado
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Obter usuário armazenado
  getUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar se está autenticado
  isAuthenticated() {
    return !!this.getToken();
  },

  // Obter perfil do usuário
  async getProfile() {
    try {
      const response = await axios.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar perfil' };
    }
  },

  // Inicializar token no axios (chamar ao carregar app)
  initializeAuth() {
    const token = this.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  // Solicitar recuperação de senha (envia link com token por email)
  async forgotPassword(email) {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao solicitar recuperação de senha' };
    }
  },

  // Redefinir senha com token JWT
  async resetPassword(token, newPassword) {
    try {
      const response = await axios.post('/api/auth/reset-password', { 
        token, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao redefinir senha' };
    }
  }
};

// Serviço de Postos
export const postosService = {
  // Listar todos os postos
  async getAll() {
    try {
      const response = await axios.get('/api/postos');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar postos' };
    }
  },

  // Buscar posto por ID
  async getById(id) {
    try {
      const response = await axios.get(`/api/postos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar posto' };
    }
  },

  // Criar novo posto (admin)
  async create(postoData) {
    try {
      const response = await axios.post('/api/postos', postoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao criar posto' };
    }
  },

  // Atualizar posto (admin)
  async update(id, postoData) {
    try {
      const response = await axios.patch(`/api/postos/${id}`, postoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao atualizar posto' };
    }
  },

  // Deletar posto (admin)
  async delete(id) {
    try {
      const response = await axios.delete(`/api/postos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao deletar posto' };
    }
  }
};

// Serviço de Relatórios de Ocupação
export const occupancyService = {
  // Criar relatório de ocupação
  async create(reportData) {
    try {
      const response = await axios.post('/api/occupancy-reports', reportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao criar relatório' };
    }
  },

  // Listar relatórios
  async getAll() {
    try {
      const response = await axios.get('/api/occupancy-reports');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar relatórios' };
    }
  },

  // Buscar relatórios por posto
  async getByPosto(postoId) {
    try {
      const response = await axios.get(`/api/occupancy-reports/posto/${postoId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar relatórios do posto' };
    }
  },

  // Buscar estatísticas de ocupação por período
  async getOccupancyStats(period = 'hour', postoId = null, startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams({ period });
      if (postoId && postoId !== 'geral') {
        params.append('postoId', postoId);
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      const response = await axios.get(`/api/occupancy-reports/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar estatísticas' };
    }
  },

  // Buscar estatísticas gerais de todos os postos
  async getGeneralStats(startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams();
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      const queryString = params.toString();
      const url = queryString 
        ? `/api/occupancy-reports/general-stats?${queryString}`
        : '/api/occupancy-reports/general-stats';
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erro ao buscar estatísticas gerais' };
    }
  }
};

export default axios;
