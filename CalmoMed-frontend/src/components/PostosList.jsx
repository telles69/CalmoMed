'use client';
import { VStack, Input, Text, Box, Grid, Badge, HStack } from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import PostoCard from './PostoCard';

export default function PostosList({ postos = [], onUpdate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLotacao, setFilterLotacao] = useState('');

  // Calcular lotação baseado em crowding_info
  const getPostoWithLotacao = (posto) => {
    const occupancy = posto.crowding_info?.occupancyPercentage || 0;
    let lotacao = 'baixa';
    
    if (occupancy >= 90) lotacao = 'crítica';
    else if (occupancy >= 70) lotacao = 'alta';
    else if (occupancy >= 40) lotacao = 'média';
    
    return {
      ...posto,
      nome: posto.name,
      endereco: posto.address,
      lotacao,
      tipo: 'UBS'
    };
  };

  const postosWithLotacao = useMemo(() => {
    return postos.map(getPostoWithLotacao);
  }, [postos]);

  const filteredPostos = useMemo(() => {
    return postosWithLotacao.filter(posto => {
      const matchesSearch = posto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           posto.endereco?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLotacao = filterLotacao === '' || posto.lotacao === filterLotacao;
      return matchesSearch && matchesLotacao;
    });
  }, [postosWithLotacao, searchTerm, filterLotacao]);

  const getStatsCount = (status) => {
    return postosWithLotacao.filter(posto => posto.lotacao === status).length;
  };

  if (!postos || postos.length === 0) {
    return (
      <Box textAlign='center' color='white' py={10}>
        <Text fontSize='xl'>Nenhum posto encontrado</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align='stretch' h='100%'>
      <Box mb={5}>
        <Text fontSize='2xl' fontWeight='bold' color='white' mb={3}>
           Postos de Saúde - Chapecó/SC
        </Text>
        
        <HStack spacing={3} mb={4}>
          <Badge colorScheme='green' px={3} py={2} borderRadius='full' fontSize='sm'>
            Baixa: {getStatsCount('baixa')}
          </Badge>
          <Badge colorScheme='yellow' px={3} py={2} borderRadius='full' fontSize='sm'>
            Média: {getStatsCount('média')}
          </Badge>
          <Badge colorScheme='orange' px={3} py={2} borderRadius='full' fontSize='sm'>
            Alta: {getStatsCount('alta')}
          </Badge>
          <Badge colorScheme='red' px={3} py={2} borderRadius='full' fontSize='sm'>
            Crítica: {getStatsCount('crítica')}
          </Badge>
        </HStack>
      </Box>

      <VStack spacing={4} align='stretch' mb={5}>
        <Input
          placeholder='Buscar posto...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          bg='rgba(255, 255, 255, 0.08)'
          border='1px solid rgba(255, 255, 255, 0.15)'
          color='white'
          size='md'
          h='45px'
          borderRadius='xl'
          _placeholder={{ color: 'gray.400' }}
          _focus={{ 
            borderColor: 'teal.300',
            bg: 'rgba(255, 255, 255, 0.12)'
          }}
        />
        
        <HStack spacing={6} flexWrap='wrap'>
          <HStack spacing={2}>
            <Text fontSize='sm' color='gray.400' fontWeight='semibold'>Lotação:</Text>
            <Badge 
              as='button'
              colorScheme='teal' 
              px={3} 
              py={1} 
              borderRadius='full' 
              fontSize='sm'
              cursor='pointer'
              onClick={() => setFilterLotacao('')}
              opacity={filterLotacao === '' ? 1 : 0.6}
            >
              Todos
            </Badge>
            <Badge 
              as='button'
              colorScheme='green' 
              px={3} 
              py={1} 
              borderRadius='full' 
              fontSize='sm'
              cursor='pointer'
              onClick={() => setFilterLotacao('baixa')}
              opacity={filterLotacao === 'baixa' ? 1 : 0.6}
            >
              Baixa
            </Badge>
            <Badge 
              as='button'
              colorScheme='yellow' 
              px={3} 
              py={1} 
              borderRadius='full' 
              fontSize='sm'
              cursor='pointer'
              onClick={() => setFilterLotacao('média')}
              opacity={filterLotacao === 'média' ? 1 : 0.6}
            >
              Média
            </Badge>
            <Badge 
              as='button'
              colorScheme='orange' 
              px={3} 
              py={1} 
              borderRadius='full' 
              fontSize='sm'
              cursor='pointer'
              onClick={() => setFilterLotacao('alta')}
              opacity={filterLotacao === 'alta' ? 1 : 0.6}
            >
              Alta
            </Badge>
            <Badge 
              as='button'
              colorScheme='red' 
              px={3} 
              py={1} 
              borderRadius='full' 
              fontSize='sm'
              cursor='pointer'
              onClick={() => setFilterLotacao('crítica')}
              opacity={filterLotacao === 'crítica' ? 1 : 0.6}
            >
              Crítica
            </Badge>
          </HStack>
        </HStack>
      </VStack>

      <Box flex='1' overflowY='auto'>
        {filteredPostos.length === 0 ? (
          <Text color='gray.400' textAlign='center' py={10}>
            Nenhum posto encontrado com os filtros aplicados.
          </Text>
        ) : (
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap={4}
            pb={4}
          >
            {filteredPostos.map((posto) => (
              <PostoCard key={posto.id} posto={posto} onUpdate={onUpdate} />
            ))}
          </Grid>
        )}
      </Box>
    </VStack>
  );
}
