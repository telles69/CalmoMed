'use client';
import { Box, VStack, Text, SimpleGrid, HStack, Button, ButtonGroup, Spinner, Input, Stack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { occupancyService, postosService } from "@/services/api";

const Dashboard = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [isClient, setIsClient] = useState(false);
  
  // Estados para controlar os filtros
  const [chartType, setChartType] = useState('lotacao');
  const [timeFilter, setTimeFilter] = useState('hour');
  const [selectedPosto, setSelectedPosto] = useState('geral');
  const [ratingsData, setRatingsData] = useState([]);
  
  // Estados para filtros de data
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  
  // Estados para dados da API
  const [postos, setPostos] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [generalStats, setGeneralStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);

  // Garante que só renderiza no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carregar lista de postos
  useEffect(() => {
    const fetchPostos = async () => {
      try {
        const data = await postosService.getAll();
        setPostos(data);
        
        // Extrair dados de ratings para o gráfico de avaliação
        const ratings = data
          .filter(posto => posto.rating !== null && posto.rating !== undefined)
          .map(posto => ({
            postoId: posto.id,
            postoName: posto.name,
            rating: posto.rating
          }));
        setRatingsData(ratings);
      } catch (err) {
        console.error('Erro ao carregar postos:', err);
        setError('Erro ao carregar postos');
      }
    };

    fetchPostos();
  }, []);

  // Carregar dados de ocupação quando os filtros mudarem
  useEffect(() => {
    const fetchOccupancyData = async () => {
      if (!isClient) return;
      
      // Loading inicial vs loading do gráfico
      const isInitialLoad = occupancyData.length === 0;
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setChartLoading(true);
      }
      
      try {
        // Usar datas aplicadas (não as temporárias)
        const customStart = useCustomDate && appliedStartDate ? appliedStartDate : null;
        const customEnd = useCustomDate && appliedEndDate ? appliedEndDate : null;
        
        const stats = await occupancyService.getOccupancyStats(
          timeFilter, 
          selectedPosto, 
          customStart, 
          customEnd
        );
        setOccupancyData(stats);
        
        // Buscar estatísticas gerais se estiver no modo comparação
        if (chartType === 'comparacao') {
          const genStats = await occupancyService.getGeneralStats(customStart, customEnd);
          setGeneralStats(genStats);
        }
        
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados de ocupação');
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        } else {
          setChartLoading(false);
        }
      }
    };

    fetchOccupancyData();
  }, [isClient, timeFilter, selectedPosto, chartType, appliedStartDate, appliedEndDate]);

  // Opções de filtro de tempo
  const timeOptions = [
    { value: 'hour', label: 'Por Hora' },
    { value: 'day', label: 'Por Dia' },
    { value: 'week', label: 'Por Semana' },
    { value: 'month', label: 'Por Mês' }
  ];

  // Função para traduzir período para português
  const getPeriodoEmPortugues = (period) => {
    const traducoes = {
      'hour': 'HORA',
      'day': 'DIA',
      'week': 'SEMANA',
      'month': 'MÊS'
    };
    return traducoes[period] || period.toUpperCase();
  };

  // Função para formatar labels baseado no período
  const getLabelsForPeriod = (periodType, dataKeys) => {
    return dataKeys.map(key => {
      try {  
        console.log('Formatting label for key:', key, 'with periodType:', periodType);
        switch (periodType) {
          case 'hour':
            // key formato: "2025-11-26T14"
            const [datePart, hourPart] = key.split('T');
            const [year, month, day] = datePart.split('-');
            return `${day}/${month} ${hourPart}:00`;
            
          case 'day':
            // key formato: "2025-11-26"
            const [y, m, d] = key.split('-');
            const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
            const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            return `${d}/${m} (${days[date.getDay()]})`;
            
          case 'week':
            // key formato: "2025-W47"
            const [yearW, weekNum] = key.split('-W');
            return `Semana ${weekNum}/${yearW}`;
            
          case 'month':
            // key formato: "2025-11"
            const [yearM, monthM] = key.split('-');
            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            return `${months[parseInt(monthM) - 1]}/${yearM}`;
            
          default:
            return key;
        }
      } catch (error) {
        console.error('Erro ao formatar label:', key, error);
        return key;
      }
    });
  };

  // Função para aplicar filtro de data customizado
  const handleApplyDateFilter = () => {
    if (startDate && endDate) {
      setAppliedStartDate(startDate);
      setAppliedEndDate(endDate);
      setUseCustomDate(true);
    }
  };

  // Função para limpar filtro de data
  const handleClearDateFilter = () => {
    setUseCustomDate(false);
    setStartDate('');
    setEndDate('');
    setAppliedStartDate('');
    setAppliedEndDate('');
  };

  // Função para definir data rápida (hoje, esta semana, este mês, este ano)
  const handleQuickDate = (type) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (type) {
      case 'today':
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date();
        break;
      case 'week':
        start = new Date(today.setDate(today.getDate() - today.getDay()));
        start.setHours(0, 0, 0, 0);
        end = new Date();
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date();
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date();
        break;
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    setAppliedStartDate(startStr);
    setAppliedEndDate(endStr);
    setUseCustomDate(true);
  };

  // Função para gerar dados de lotação baseados nos filtros
  const getLotacaoData = () => {
    if (!occupancyData || occupancyData.length === 0) {
      return { labels: [], data: [] };
    }

    // Dados já vêm ordenados do backend
    const periods = occupancyData.map(item => item.period);
    const periodType = occupancyData[0]?.periodType || timeFilter;
    
    console.log('🔍 getLotacaoData - periodType:', periodType, 'timeFilter:', timeFilter, 'data:', occupancyData[0]);
    
    const labels = getLabelsForPeriod(periodType, periods);
    const data = occupancyData.map(item => item.averageOccupancy);

    return { labels, data };
  };

  // Função para gerar dados de estatísticas gerais
  const getGeneralStatsData = () => {
    if (!generalStats || generalStats.length === 0) {
      return { labels: [], data: [] };
    }

    const labels = generalStats.map(stat => stat.postoName);
    const data = generalStats.map(stat => stat.averageOccupancy);
    
    return { labels, data };
  };

  // Função para gerar dados de avaliações (ratings)
  const getRatingsData = () => {
    if (!ratingsData || ratingsData.length === 0) {
      return { labels: [], data: [] };
    }

    const labels = ratingsData.map(item => item.postoName);
    const data = ratingsData.map(item => item.rating);
    
    return { labels, data };
  };

  useEffect(() => {
    if (!isClient || !chartRef.current || loading) return;

    // Importa Chart.js dinamicamente apenas no cliente
    import('chart.js/auto').then((ChartModule) => {
      const Chart = ChartModule.default;
      
      const ctx = chartRef.current.getContext('2d');
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      let chartData, config;

      if (chartType === 'lotacao') {
        const { labels, data } = getLotacaoData();
        
        if (labels.length === 0) {
          return; // Não renderiza se não houver dados
        }

        // Determinar título baseado no período e filtro de data
        let titleText = 'Lotação dos Postos';
        if (useCustomDate && appliedStartDate && appliedEndDate) {
          const start = new Date(appliedStartDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          const end = new Date(appliedEndDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          titleText += ` - ${start} a ${end}`;
        } else {
          const periodLabels = {
            'hour': 'Últimas 24 Horas',
            'day': 'Última Semana',
            'week': 'Últimas 4 Semanas',
            'month': 'Últimos 6 Meses'
          };
          titleText += ` - ${periodLabels[timeFilter] || 'Período Customizado'}`;
        }
        
        chartData = {
          labels,
          datasets: [{
            label: selectedPosto === 'geral' 
              ? 'Ocupação Total do Sistema (pessoas)' 
              : `Lotação Média - ${postos.find(p => p.id === parseInt(selectedPosto))?.name || 'Posto'} (pessoas)`,
            data,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointRadius: 6,
          }]
        };

        config = {
          type: 'line',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: titleText,
                color: 'white',
                font: { size: 18, weight: 'bold' },
                padding: 20
              },
              legend: {
                labels: { color: 'white', font: { size: 14 } }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { 
                  color: 'white',
                  callback: function(value) { return value + ' pessoas'; }
                },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                title: {
                  display: true,
                  text: 'Número de Pessoas',
                  color: 'white'
                }
              },
              x: {
                ticks: { 
                  color: 'white',
                  maxRotation: labels.length > 10 ? 45 : 0,
                  minRotation: labels.length > 10 ? 45 : 0,
                  font: {
                    size: labels.length > 20 ? 9 : 11
                  }
                },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
              }
            }
          }
        };
      } else if (chartType === 'comparacao') {
        const { labels, data } = getGeneralStatsData();
        
        if (labels.length === 0) {
          return; // Não renderiza se não houver dados
        }

        // Determinar título do gráfico de comparação
        let titleText = 'Ocupação Média dos Postos de Saúde';
        if (useCustomDate && appliedStartDate && appliedEndDate) {
          const start = new Date(appliedStartDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          const end = new Date(appliedEndDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          titleText += ` - ${start} a ${end}`;
        } else {
          titleText += ' (Últimas 24h)';
        }
        
        chartData = {
          labels,
          datasets: [{
            label: 'Ocupação Média (pessoas)',
            data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 205, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(199, 199, 199, 0.8)',
              'rgba(83, 102, 255, 0.8)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 205, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(199, 199, 199, 1)',
              'rgba(83, 102, 255, 1)'
            ],
            borderWidth: 2,
            borderRadius: 8,
          }]
        };

        config = {
          type: 'bar',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: titleText,
                color: 'white',
                font: { size: 18, weight: 'bold' },
                padding: 20
              },
              legend: {
                labels: { color: 'white', font: { size: 14 } }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { 
                  color: 'white',
                  callback: function(value) { return value + ' pessoas'; }
                },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                title: {
                  display: true,
                  text: 'Número Médio de Pessoas',
                  color: 'white'
                }
              },
              x: {
                ticks: { 
                  color: 'white',
                  maxRotation: 45
                },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
              }
            }
          }
        };
      } else if (chartType === 'avaliacao') {
        const { labels, data } = getRatingsData();
        
        if (labels.length === 0) {
          return; // Não renderiza se não houver dados
        }

        chartData = {
          labels,
          datasets: [{
            label: 'Avaliação (estrelas)',
            data,
            backgroundColor: [
              'rgba(255, 193, 7, 0.8)',
              'rgba(255, 152, 0, 0.8)',
              'rgba(255, 235, 59, 0.8)',
              'rgba(251, 192, 45, 0.8)',
              'rgba(255, 160, 0, 0.8)',
              'rgba(255, 179, 0, 0.8)',
              'rgba(255, 214, 0, 0.8)',
              'rgba(255, 202, 40, 0.8)'
            ],
            borderColor: [
              'rgba(255, 193, 7, 1)',
              'rgba(255, 152, 0, 1)',
              'rgba(255, 235, 59, 1)',
              'rgba(251, 192, 45, 1)',
              'rgba(255, 160, 0, 1)',
              'rgba(255, 179, 0, 1)',
              'rgba(255, 214, 0, 1)',
              'rgba(255, 202, 40, 1)'
            ],
            borderWidth: 2,
            borderRadius: 8,
          }]
        };

        config = {
          type: 'bar',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Avaliação dos Postos de Saúde',
                color: 'white',
                font: { size: 18, weight: 'bold' },
                padding: 20
              },
              legend: {
                labels: { color: 'white', font: { size: 14 } }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 5,
                ticks: { 
                  color: 'white',
                  stepSize: 0.5,
                  callback: function(value) { return value;}
                },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                title: {
                  display: true,
                  text: 'Avaliação (0-5 estrelas)',
                  color: 'white'
                }
              },
              x: {
                ticks: { 
                  color: 'white',
                  maxRotation: 45
                },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
              }
            }
          }
        };
      }

      chartInstance.current = new Chart(ctx, config);
    }).catch(error => {
      console.error('Erro ao carregar Chart.js:', error);
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [isClient, chartType, timeFilter, selectedPosto, occupancyData, generalStats, ratingsData, loading]);

  // Função para calcular estatísticas
  const getStatistics = () => {
    if (chartType === 'lotacao') {
      const { data } = getLotacaoData();
      
      if (!data || data.length === 0) {
        return {
          media: '0',
          max: '0',
          min: '0',
          posto: selectedPosto === 'geral' ? 'Todos os Postos' : postos.find(p => p.id === parseInt(selectedPosto))?.name || 'Posto'
        };
      }
      
      const media = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(1);
      const max = Math.max(...data);
      const min = Math.min(...data);
      
      return {
        media: `${media}`,
        max: `${max}`,
        min: `${min}`,
        posto: selectedPosto === 'geral' ? 'Todos os Postos' : postos.find(p => p.id === parseInt(selectedPosto))?.name || 'Posto'
      };
    } else if (chartType === 'comparacao') {
      if (!generalStats || generalStats.length === 0) {
        return {
          media: '0',
          melhor: 'N/A',
          total: 0,
          totalReports: 0
        };
      }
      
      const occupancies = generalStats.map(stat => stat.averageOccupancy);
      const media = (occupancies.reduce((a, b) => a + b, 0) / occupancies.length).toFixed(1);
      const maxIndex = occupancies.indexOf(Math.max(...occupancies));
      const melhor = generalStats[maxIndex]?.postoName || 'N/A';
      const totalReports = generalStats.reduce((acc, stat) => acc + stat.reportCount, 0);
      
      return {
        media: `${media}`,
        melhor,
        total: generalStats.length,
        totalReports
      };
    } else if (chartType === 'avaliacao') {
      if (!ratingsData || ratingsData.length === 0) {
        return {
          mediaAvaliacao: '0.0',
          melhorAvaliado: 'N/A',
          piorAvaliado: 'N/A',
          totalAvaliados: 0
        };
      }
      
      const ratings = ratingsData.map(item => item.rating);
      const media = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
      const maxIndex = ratings.indexOf(Math.max(...ratings));
      const minIndex = ratings.indexOf(Math.min(...ratings));
      const melhorAvaliado = ratingsData[maxIndex]?.postoName || 'N/A';
      const piorAvaliado = ratingsData[minIndex]?.postoName || 'N/A';
      
      return {
        mediaAvaliacao: media,
        melhorAvaliado,
        piorAvaliado,
        totalAvaliados: ratingsData.length
      };
    }
  };

  // Só renderiza se estiver no cliente
  if (!isClient) {
    return (
      <VStack spacing={6} align="stretch" h="100%">
        <Box>
          <Text fontSize="3xl" fontWeight="bold" color="white" mb={2}>
            Carregando Dashboard...
          </Text>
          <Text color="gray.300" fontSize="lg">
            Preparando gráficos e estatísticas...
          </Text>
        </Box>
      </VStack>
    );
  }

  if (loading) {
    return (
      <VStack spacing={6} h="100%" justify="center" align="center">
        <Spinner size="xl" color="teal.500" />
        <Text color="white" fontSize="lg">Carregando dados...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack spacing={6} align="stretch" h="100%">
        <Box>
          <Text fontSize="3xl" fontWeight="bold" color="red.400" mb={2}>
            Erro ao Carregar Dashboard
          </Text>
          <Text color="gray.300" fontSize="lg">
            {error}
          </Text>
          <Button 
            mt={4} 
            colorScheme="teal" 
            onClick={() => window.location.reload()}
          >
            Recarregar
          </Button>
        </Box>
      </VStack>
    );
  }

  const stats = getStatistics();

  return (
    <VStack spacing={6} align="stretch" h="100%">
      <Box>
        <Text fontSize="3xl" fontWeight="bold" color="white" mb={2}>
          Dashboard Analítico
        </Text>
        <Text color="gray.300" fontSize="lg">
          Visualize estatísticas e métricas dos postos de saúde de Chapecó.
        </Text>
      </Box>

      {/* Controles de Filtro */}
      <Box bg="rgba(21, 74, 90, 0.8)" p={4} borderRadius="xl" border="1px solid" borderColor="teal.600">
        <VStack spacing={4}>
          {/* Tipo de Análise */}
          <Box w="100%">
            <Text color="gray.300" fontSize="sm" mb={3}>Tipo de Análise:</Text>
            <ButtonGroup size="sm" isAttached>
              <Button
              variant="outline" 
              color="teal.300" 
              borderColor="teal.300"
              _hover={{ bg: "teal.300", color: "gray.800" }}
              onClick={() => setChartType('lotacao')}
              >
               📈 Lotação
              </Button>
              <Button
                variant="outline" 
              color="teal.300" 
              borderColor="teal.300"
              _hover={{ bg: "teal.300", color: "gray.800" }}
                onClick={() => setChartType('comparacao')}
              >
                📊 Comparação
              </Button>
              <Button
               variant="outline" 
              color="teal.300" 
              borderColor="teal.300"
              _hover={{ bg: "teal.300", color: "gray.800" }}
                onClick={() => setChartType('avaliacao')}
              >
                ⭐ Avaliação
              </Button>
            </ButtonGroup>
          </Box>

          {/* Filtros de Lotação */}
          {chartType === 'lotacao' && (
            <>
              {/* Filtro de Data Customizado */}
              <Box w="100%" borderTop="1px solid" borderColor="teal.700" pt={4}>
                <Text color="gray.300" fontSize="sm" mb={3}> Filtro de Data:</Text>
                
                {/* Botões de Data Rápida */}
                <HStack spacing={2} flexWrap="wrap" mb={3}>
                  <Button
                    size="xs"
                    colorScheme="purple"
                    variant="outline"
                    onClick={() => handleQuickDate('today')}
                    color="white"
                  >
                    Hoje
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="purple"
                    variant="outline"
                    onClick={() => handleQuickDate('week')}
                    color="white"
                  >
                    Esta Semana
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="purple"
                    variant="outline"
                    onClick={() => handleQuickDate('month')}
                    color="white"
                  >
                    Este Mês
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="purple"
                    variant="outline"
                    onClick={() => handleQuickDate('year')}
                    color="white"
                  >
                    Este Ano
                  </Button>
                </HStack>

                {/* Seleção de Data Customizada */}
                <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
                  <Box flex={1}>
                    <Text color="gray.400" fontSize="xs" mb={1}>Data Inicial:</Text>
                    <Input
                      type="date"
                      size="sm"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      bg="rgba(0,0,0,0.3)"
                      color="white"
                      borderColor="teal.600"
                      _hover={{ borderColor: 'teal.500' }}
                      _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal' }}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text color="gray.400" fontSize="xs" mb={1}>Data Final:</Text>
                    <Input
                      type="date"
                      size="sm"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      bg="rgba(0,0,0,0.3)"
                      color="white"
                      borderColor="teal.600"
                      _hover={{ borderColor: 'teal.500' }}
                      _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal' }}
                    />
                  </Box>
                </Stack>

                {/* Botões de Ação */}
                <HStack spacing={2} mt={3}>
                  <Button
                    variant="outline" 
              color="teal.300" 
              borderColor="teal.300"
              _hover={{ bg: "teal.300", color: "gray.800" }}
                    onClick={handleApplyDateFilter}
                    isDisabled={!startDate || !endDate}
                    flex={1}
                  >
                    Aplicar Filtro
                  </Button>
                  {useCustomDate && (
                    <Button
                      size="sm"
                      variant="outline" 
              color="teal.300" 
              borderColor="teal.300"
              _hover={{ bg: "teal.300", color: "gray.800" }}
                      onClick={handleClearDateFilter}
                      flex={1}
                    >
                      Limpar Filtro
                    </Button>
                  )}
                </HStack>

                {useCustomDate && appliedStartDate && appliedEndDate && (
                  <Text color="teal.300" fontSize="xs" mt={2}>
                    ✓ Filtrando de {new Date(appliedStartDate).toLocaleDateString('pt-BR')} até {new Date(appliedEndDate).toLocaleDateString('pt-BR')}
                  </Text>
                )}
              </Box>

              {/* Filtro de Período */}
              <Box w="100%" borderTop="1px solid" borderColor="teal.700" pt={4}>
                <Text color="gray.300" fontSize="sm" mb={3}>Período:</Text>
                <HStack spacing={2} flexWrap="wrap">
                  {timeOptions.map(option => (
                    <Button
                      key={option.value}
                      size="sm"
                      colorScheme={timeFilter === option.value ? 'blue' : 'gray'}
                      variant={timeFilter === option.value ? 'solid' : 'outline'}
                      onClick={() => setTimeFilter(option.value)}
                      color="white"
                      minW="80px"
                    >
                      {option.label}
                    </Button>
                  ))}
                </HStack>
              </Box>

              {/* Filtro de Posto */}
              <Box w="100%">
                <Text color="gray.300" fontSize="sm" mb={3}>Posto de Saúde:</Text>
                <VStack spacing={3} align="stretch">
                  {/* Visão Geral */}
                  <Button
                    size="sm"
                    colorScheme={selectedPosto === 'geral' ? 'green' : 'gray'}
                    variant={selectedPosto === 'geral' ? 'solid' : 'outline'}
                    onClick={() => setSelectedPosto('geral')}
                    color="white"
                    justifyContent="flex-start"
                  >
                    Visão Geral (Todos os Postos)
                  </Button>
                  
                  {/* Lista de Postos */}
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2}>
                    {postos.map(posto => (
                      <Button
                        key={posto.id}
                        size="sm"
                        colorScheme={selectedPosto === posto.id.toString() ? 'cyan' : 'gray'}
                        variant={selectedPosto === posto.id.toString() ? 'solid' : 'outline'}
                        onClick={() => setSelectedPosto(posto.id.toString())}
                        color="white"
                        fontSize="xs"
                        px={3}
                        py={2}
                        minH="35px"
                        whiteSpace="normal"
                        textAlign="center"
                      >
                       {posto.name}
                      </Button>
                    ))}
                  </SimpleGrid>
                </VStack>
              </Box>
            </>
          )}

          {/* Filtros de Comparação */}
          {chartType === 'comparacao' && (
            <Box w="100%">
              <Text color="gray.300" fontSize="sm" mb={3}> Filtro de Data:</Text>
              
              {/* Botões de Data Rápida */}
              <HStack spacing={2} flexWrap="wrap" mb={3}>
                <Button
                  size="xs"
                  colorScheme="purple"
                  variant="outline"
                  onClick={() => handleQuickDate('today')}
                  color="white"
                >
                  Hoje
                </Button>
                <Button
                  size="xs"
                  colorScheme="purple"
                  variant="outline"
                  onClick={() => handleQuickDate('week')}
                  color="white"
                >
                  Esta Semana
                </Button>
                <Button
                  size="xs"
                  colorScheme="purple"
                  variant="outline"
                  onClick={() => handleQuickDate('month')}
                  color="white"
                >
                  Este Mês
                </Button>
                <Button
                  size="xs"
                  colorScheme="purple"
                  variant="outline"
                  onClick={() => handleQuickDate('year')}
                  color="white"
                >
                  Este Ano
                </Button>
              </HStack>

              {/* Seleção de Data Customizada */}
              <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
                <Box flex={1}>
                  <Text color="gray.400" fontSize="xs" mb={1}>Data Inicial:</Text>
                  <Input
                    type="date"
                    size="sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    bg="rgba(0,0,0,0.3)"
                    color="white"
                    borderColor="teal.600"
                    _hover={{ borderColor: 'teal.500' }}
                    _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal' }}
                  />
                </Box>
                <Box flex={1}>
                  <Text color="gray.400" fontSize="xs" mb={1}>Data Final:</Text>
                  <Input
                    type="date"
                    size="sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    bg="rgba(0,0,0,0.3)"
                    color="white"
                    borderColor="teal.600"
                    _hover={{ borderColor: 'teal.500' }}
                    _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px teal' }}
                  />
                </Box>
              </Stack>

              {/* Botões de Ação */}
              <HStack spacing={2} mt={3}>
                <Button
                  size="sm"
                  colorScheme="teal"
                  onClick={handleApplyDateFilter}
                  isDisabled={!startDate || !endDate}
                  flex={1}
                >
                  Aplicar Filtro
                </Button>
                {useCustomDate && (
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={handleClearDateFilter}
                    flex={1}
                    color="black"
                  >
                    Limpar Filtro
                  </Button>
                )}
              </HStack>

              {useCustomDate && appliedStartDate && appliedEndDate && (
                <Text color="teal.300" fontSize="xs" mt={2}>
                  ✓ Filtrando de {new Date(appliedStartDate).toLocaleDateString('pt-BR')} até {new Date(appliedEndDate).toLocaleDateString('pt-BR')}
                </Text>
              )}
            </Box>
          )}
        </VStack>
      </Box>

      {/* Estatísticas Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {chartType === 'lotacao' ? (
          <>
            <Box bg="rgba(21, 74, 90, 0.8)" p={4} borderRadius="xl" border="1px solid" borderColor="teal.500" textAlign="center">
              <Text color="gray.300" fontSize="sm" mb={2}>
                {selectedPosto === 'geral' ? 'Ocupação Média Total' : 'Lotação Média'}
              </Text>
              <Text color="white" fontSize="2xl" fontWeight="bold" mb={1}>{stats.media} pessoas</Text>
              <Text color="teal.300" fontSize="xs">{stats.posto}</Text>
            </Box>
            <Box bg="rgba(21, 74, 90, 0.8)" p={4} borderRadius="xl" border="1px solid" borderColor="red.500" textAlign="center">
              <Text color="gray.300" fontSize="sm" mb={2}>
                {selectedPosto === 'geral' ? 'Pico Máximo Total' : 'Pico Máximo'}
              </Text>
              <Text color="white" fontSize="2xl" fontWeight="bold" mb={1}>{stats.max} pessoas</Text>
              <Text color="red.300" fontSize="xs">
                {selectedPosto === 'geral' ? 'Sistema completo' : 'Maior lotação'}
              </Text>
            </Box>
            <Box bg="rgba(21, 74, 90, 0.8)" p={4} borderRadius="xl" border="1px solid" borderColor="green.500" textAlign="center">
              <Text color="gray.300" fontSize="sm" mb={2}>
                {selectedPosto === 'geral' ? 'Menor Ocupação Total' : 'Menor Lotação'}
              </Text>
              <Text color="white" fontSize="2xl" fontWeight="bold" mb={1}>{stats.min} pessoas</Text>
              <Text color="green.300" fontSize="xs">
                {selectedPosto === 'geral' ? 'Sistema completo' : 'Melhor momento'}
              </Text>
            </Box>
            <Box bg="rgba(21, 74, 90, 0.8)" p={4} borderRadius="xl" border="1px solid" borderColor="blue.500" textAlign="center">
              <Text color="gray.300" fontSize="sm" mb={2}>Período</Text>
              <Text color="white" fontSize="2xl" fontWeight="bold" mb={1}>{getPeriodoEmPortugues(timeFilter)}</Text>
              <Text color="blue.300" fontSize="xs">Filtro ativo</Text>
            </Box>
          </>
        ) : chartType === 'comparacao' ? (
          <>
            <Box bg="rgba(21, 74, 90, 0.8)" p={4} borderRadius="xl" border="1px solid" borderColor="yellow.500" textAlign="center">
              <Text color="gray.300" fontSize="sm" mb={2}>Ocupação Média</Text>
              <Text color="white" fontSize="2xl" fontWeight="bold" mb={1}>{stats.media} pessoas</Text>
              <Text color="yellow.300" fontSize="xs">Geral dos postos</Text>
            </Box>
            <Box bg="rgba(21, 74, 90, 0.8)" p={4} borderRadius="xl" border="1px solid" borderColor="green.500" textAlign="center">
              <Text color="gray.300" fontSize="sm" mb={2}>Mais Ocupado</Text>
              <Text color="white" fontSize="lg" fontWeight="bold" mb={1}>{stats.melhor}</Text>
              <Text color="green.300" fontSize="xs">Maior ocupação</Text>
            </Box>
            <Box bg="rgba(21, 74, 90, 0.8)" p={4} borderRadius="xl" border="1px solid" borderColor="blue.500" textAlign="center">
              <Text color="gray.300" fontSize="sm" mb={2}>Total de Postos</Text>
              <Text color="white" fontSize="2xl" fontWeight="bold" mb={1}>{stats.total}</Text>
              <Text color="blue.300" fontSize="xs">Monitorados</Text>
            </Box>
            <Box bg="rgba(21, 74, 90, 0.8)" p={4} borderRadius="xl" border="1px solid" borderColor="purple.500" textAlign="center">
              <Text color="gray.300" fontSize="sm" mb={2}>Relatórios</Text>
              <Text color="white" fontSize="2xl" fontWeight="bold" mb={1}>{stats.totalReports}</Text>
              <Text color="purple.300" fontSize="xs">Últimas 24h</Text>
            </Box>
          </>
        ) : (
          <>
            <Box bg="rgba(21, 74, 90, 0.8)" p={4} borderRadius="xl" border="1px solid" borderColor="yellow.500" textAlign="center">
              <Text color="gray.300" fontSize="sm" mb={2}>Avaliação Média</Text>
              <Text color="white" fontSize="2xl" fontWeight="bold" mb={1}>{stats.mediaAvaliacao} ⭐</Text>
              <Text color="yellow.300" fontSize="xs">Geral dos postos</Text>
            </Box>
            <Box bg="rgba(21, 74, 90, 0.8)" p={4} borderRadius="xl" border="1px solid" borderColor="green.500" textAlign="center">
              <Text color="gray.300" fontSize="sm" mb={2}>Melhor Avaliado</Text>
              <Text color="white" fontSize="lg" fontWeight="bold" mb={1}>{stats.melhorAvaliado}</Text>
              <Text color="green.300" fontSize="xs">Maior nota</Text>
            </Box>
            <Box bg="rgba(21, 74, 90, 0.8)" p={4} borderRadius="xl" border="1px solid" borderColor="red.500" textAlign="center">
              <Text color="gray.300" fontSize="sm" mb={2}>Pior Avaliado</Text>
              <Text color="white" fontSize="lg" fontWeight="bold" mb={1}>{stats.piorAvaliado}</Text>
              <Text color="red.300" fontSize="xs">Menor nota</Text>
            </Box>
            <Box bg="rgba(21, 74, 90, 0.8)" p={4} borderRadius="xl" border="1px solid" borderColor="blue.500" textAlign="center">
              <Text color="gray.300" fontSize="sm" mb={2}>Postos Avaliados</Text>
              <Text color="white" fontSize="2xl" fontWeight="bold" mb={1}>{stats.totalAvaliados}</Text>
              <Text color="blue.300" fontSize="xs">Com ratings</Text>
            </Box>
          </>
        )}
      </SimpleGrid>

      {/* Gráfico */}
      <Box
        bg="rgba(21, 74, 90, 0.6)"
        borderRadius="xl"
        p={6}
        border="1px solid"
        borderColor="teal.600"
        h="450px"
        position="relative"
      >
        {chartLoading && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="rgba(0, 0, 0, 0.5)"
            borderRadius="xl"
            zIndex="10"
          >
            <VStack spacing={3}>
              <Spinner size="xl" color="teal.500" thickness="4px" />
              <Text color="white" fontSize="lg" fontWeight="bold">
                Atualizando gráfico...
              </Text>
            </VStack>
          </Box>
        )}
        <canvas ref={chartRef} style={{ width: '100%', height: '100%' }}></canvas>
      </Box>
    </VStack>
  );
};

export default Dashboard;