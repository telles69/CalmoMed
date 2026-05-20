'use client';
import { 
  Badge, 
  Text, 
  Button, 
  HStack, 
  VStack, 
  Box,
  Grid,
  GridItem
} from "@chakra-ui/react";
import { toaster, Toaster } from "@/components/ui/toaster";

export default function PostoDetailsModal({ isOpen, onClose, posto }) {

  if (!posto) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'baixa': return 'green';
      case 'média': return 'yellow';
      case 'alta': return 'orange';
      case 'crítica': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'baixa': return 'Baixa Lotação';
      case 'média': return 'Média Lotação';
      case 'alta': return 'Alta Lotação';
      case 'crítica': return 'Lotação Crítica';
      default: return 'Status Desconhecido';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Box
        position="fixed"
        top="0"
        left="0"
        w="100vw"
        h="100vh"
        bg="rgba(0, 0, 0, 0.6)"
        zIndex="1000"
        onClick={onClose}
      />
      
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="90%"
        maxW="600px"
        maxH="90vh"
        bg="gray.800"
        borderRadius="xl"
        boxShadow="2xl"
        zIndex="1001"
        overflow="hidden"
      >
        <Box p={6} borderBottom="1px solid" borderColor="gray.700">
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between" align="flex-start">
              <Text fontSize="xl" fontWeight="bold" color="white">
                {posto.name || posto.nome}
              </Text>
              <HStack spacing={2}>
                <Badge 
                  colorScheme={getStatusColor(posto.lotacao)} 
                  fontSize="sm"
                  px={3} 
                  py={1}
                  borderRadius="md"
                >
                  {getStatusText(posto.lotacao)}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  color="gray.400"
                  _hover={{ bg: "gray.700", color: "white" }}
                >
                  ✕
                </Button>
              </HStack>
            </HStack>
          </VStack>
        </Box>

        <Box p={6} overflowY="auto" maxH="60vh">
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.300" mb={2}>
                Endereço
              </Text>
              <Text fontSize="md" color="gray.400">
                {posto.address || posto.endereco}
              </Text>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.300" mb={2}>
                Contato
              </Text>
              <Text fontSize="md" color="gray.400">
                {typeof posto.contact === 'string' && posto.contact.startsWith('{') 
                  ? JSON.parse(posto.contact).phone 
                  : posto.contact}
              </Text>
            </Box>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <Box bg="gray.700" p={3} borderRadius="md">
                  <Text fontSize="sm" color="gray.400" mb={1}>Pessoas na Fila</Text>
                  <Text fontSize="2xl" color="blue.400" fontWeight="bold">
                    {posto.crowding_info?.reportedQueue || 0}
                  </Text>
                </Box>
              </GridItem>
              <GridItem>
                <Box bg="gray.700" p={3} borderRadius="md">
                  <Text fontSize="sm" color="gray.400" mb={1}>Taxa de Ocupação</Text>
                  <Text fontSize="2xl" color="orange.400" fontWeight="bold">
                    {posto.crowding_info?.occupancyPercentage || 0}%
                  </Text>
                </Box>
              </GridItem>
              <GridItem>
                <Box bg="gray.700" p={3} borderRadius="md">
                  <Text fontSize="sm" color="gray.400" mb={1}>Última Atualização</Text>
                  <Text fontSize="sm" color="purple.400" fontWeight="bold">
                    {posto.crowding_info?.lastUpdate 
                      ? new Date(posto.crowding_info.lastUpdate).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Sem dados'}
                  </Text>
                </Box>
              </GridItem>
              <GridItem>
                <Box bg="gray.700" p={3} borderRadius="md">
                  <Text fontSize="sm" color="gray.400" mb={1}>Avaliação</Text>
                  <Text fontSize="2xl" color="yellow.400" fontWeight="bold">
                    {posto.rating ? posto.rating.toFixed(1) : 'N/A'} 
                  </Text>
                </Box>
              </GridItem>
            </Grid>

            {posto.specialties && Array.isArray(posto.specialties) && posto.specialties.length > 0 && (
              <Box bg="gray.700" p={4} borderRadius="md">
                <Text fontSize="sm" fontWeight="semibold" color="gray.300" mb={2}>
                  Especialidades Disponíveis
                </Text>
                <VStack align="stretch" spacing={1}>
                  {posto.specialties.map((spec, index) => (
                    <Text key={index} fontSize="sm" color="gray.400">
                      • {spec}
                    </Text>
                  ))}
                </VStack>
              </Box>
            )}

            {posto.services && Array.isArray(posto.services) && posto.services.length > 0 && (
              <Box bg="gray.700" p={4} borderRadius="md">
                <Text fontSize="sm" fontWeight="semibold" color="gray.300" mb={2}>
                  Serviços Disponíveis
                </Text>
                <VStack align="stretch" spacing={1}>
                  {posto.services.map((servico, index) => (
                    <Text key={index} fontSize="sm" color="gray.400">
                      • {servico}
                    </Text>
                  ))}
                </VStack>
              </Box>
            )}

            {posto.opening_hours && (
              <Box bg="gray.700" p={4} borderRadius="md">
                <Text fontSize="sm" fontWeight="semibold" color="gray.300" mb={2}>
                  Horário de Funcionamento
                </Text>
                <Text fontSize="sm" color="gray.400">
                  {posto.opening_hours}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>

        <Box p={6} borderTop="1px solid" borderColor="gray.700">
          <HStack justify="flex-end">
            <Button onClick={onClose} colorScheme="teal">
              Fechar
            </Button>
          </HStack>
        </Box>
      </Box>
    </>
  );
}
