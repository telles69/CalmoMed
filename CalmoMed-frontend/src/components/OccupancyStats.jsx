'use client';
import { Box, Grid, GridItem, Text, VStack, HStack } from "@chakra-ui/react";

export default function OccupancyStats({ postos }) {
  const calculateStats = () => {
    if (!postos || postos.length === 0) return {
      total: 0,
      withReports: 0,
      avgOccupancy: 0,
      totalPeople: 0
    };

    const withReports = postos.filter(p => p.crowding_info?.reportedQueue);
    const totalPeople = withReports.reduce((sum, p) => sum + (p.crowding_info?.reportedQueue || 0), 0);
    const avgOccupancy = withReports.length > 0 
      ? Math.round(withReports.reduce((sum, p) => sum + (p.crowding_info?.occupancyPercentage || 0), 0) / withReports.length)
      : 0;

    return {
      total: postos.length,
      withReports: withReports.length,
      avgOccupancy,
      totalPeople
    };
  };

  const stats = calculateStats();

  return (
    <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={6}>
      <GridItem>
        <Box
          bg="rgba(59, 130, 246, 0.1)"
          borderRadius="lg"
          p={4}
          border="1px solid"
          borderColor="blue.500"
        >
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color="blue.300">
              Total de Postos
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="blue.400">
              {stats.total}
            </Text>
          </VStack>
        </Box>
      </GridItem>

      <GridItem>
        <Box
          bg="rgba(34, 197, 94, 0.1)"
          borderRadius="lg"
          p={4}
          border="1px solid"
          borderColor="green.500"
        >
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color="green.300">
              Com Dados Recentes
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="green.400">
              {stats.withReports}
            </Text>
          </VStack>
        </Box>
      </GridItem>

      <GridItem>
        <Box
          bg="rgba(234, 179, 8, 0.1)"
          borderRadius="lg"
          p={4}
          border="1px solid"
          borderColor="yellow.500"
        >
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color="yellow.300">
              Ocupação Média
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="yellow.400">
              {stats.avgOccupancy}%
            </Text>
          </VStack>
        </Box>
      </GridItem>

      <GridItem>
        <Box
          bg="rgba(168, 85, 247, 0.1)"
          borderRadius="lg"
          p={4}
          border="1px solid"
          borderColor="purple.500"
        >
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color="purple.300">
              Pessoas em Filas
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="purple.400">
              {stats.totalPeople}
            </Text>
          </VStack>
        </Box>
      </GridItem>
    </Grid>
  );
}
