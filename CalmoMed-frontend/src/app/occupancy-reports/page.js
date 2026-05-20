'use client';
import { Box, VStack, Text, Spinner, Badge, HStack, Grid, GridItem } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { occupancyService } from "@/services/api";
import { toaster } from "@/components/ui/toaster";

export default function OccupancyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await occupancyService.getAll();
      setReports(data);
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
      toaster.create({
        title: "Erro",
        description: error.message || "Erro ao carregar relatórios",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getOccupancyLevel = (count) => {
    if (count >= 50) return { text: 'Crítica', color: 'red' };
    if (count >= 30) return { text: 'Alta', color: 'orange' };
    if (count >= 15) return { text: 'Média', color: 'yellow' };
    return { text: 'Baixa', color: 'green' };
  };

  if (loading) {
    return (
      <Box w="100%" h="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.900">
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" />
          <Text color="white" fontSize="lg">
            Carregando relatórios...
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box w="100%" minH="100vh" bg="gray.900" p={8}>
      <VStack spacing={6} align="stretch" maxW="1400px" mx="auto">
        <Box>
          <Text fontSize="3xl" fontWeight="bold" color="white" mb={2}>
            Relatórios de Ocupação
          </Text>
          <Text color="gray.400" fontSize="lg">
            Total de {reports.length} relatórios registrados
          </Text>
        </Box>

        <VStack spacing={3} align="stretch">
          {reports.map((report) => {
            const level = getOccupancyLevel(report.people_count);
            return (
              <Box
                key={report.id}
                bg="gray.800"
                borderRadius="lg"
                p={4}
                border="1px solid"
                borderColor="gray.700"
                _hover={{ bg: "gray.750", borderColor: "teal.500" }}
                transition="all 0.2s"
              >
                <Grid templateColumns="repeat(6, 1fr)" gap={4} alignItems="center">
                  <GridItem>
                    <Text fontSize="xs" color="gray.500" mb={1}>ID</Text>
                    <Text color="gray.300" fontSize="sm" fontFamily="mono">
                      {report.id.substring(0, 8)}...
                    </Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="xs" color="gray.500" mb={1}>Posto</Text>
                    <Text color="gray.300" fontWeight="medium">{report.posto_id}</Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="xs" color="gray.500" mb={1}>Pessoas</Text>
                    <Text color="white" fontWeight="bold" fontSize="xl">
                      {report.people_count}
                    </Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="xs" color="gray.500" mb={1}>Nível</Text>
                    <Badge colorScheme={level.color} px={3} py={1} borderRadius="full">
                      {level.text}
                    </Badge>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="xs" color="gray.500" mb={1}>Distância</Text>
                    <Text color="gray.400">
                      {report.distance_to_posto ? `${Math.round(report.distance_to_posto)}m` : 'N/A'}
                    </Text>
                  </GridItem>
                  <GridItem>
                    <Text fontSize="xs" color="gray.500" mb={1}>Data</Text>
                    <Text color="gray.400" fontSize="sm">
                      {new Date(report.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </GridItem>
                </Grid>
              </Box>
            );
          })}
        </VStack>
      </VStack>
    </Box>
  );
}
