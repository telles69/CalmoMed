'use client';
import { Box, VStack, HStack, Heading, Button, Text, Spinner } from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import FixBar from "@/components/FixBar";
import Sidebar from "@/components/Sidebar";
import GoogleMap from "@/components/GoogleMap";
import PostosList from "@/components/PostosList";
import OccupancyStats from "@/components/OccupancyStats";
import PostoCreate from "@/components/PostoCreate";
import UserProfile from "@/components/UserProfile";
import { SearchProvider, useSearch } from "@/contexts/SearchContext";
import { postosService } from "@/services/api";
import { toaster, Toaster } from "@/components/ui/toaster";
import Dashboard from "@/components/Dashboard";

function LobbyContent() {
  const [sidebarSection, setSidebarSection] = useState("mapa");
  const [postos, setPostos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const { setPostos: setSearchPostos } = useSearch();

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setSidebarSection(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchPostos();
  }, []);

  const fetchPostos = async () => {
    try {
      setLoading(true);
      const data = await postosService.getAll();
      setPostos(data);
      setSearchPostos(data); // Atualizar contexto de busca
    } catch (error) {
      console.error("Erro ao buscar postos:", error);
      toaster.create({
        title: "Erro",
        description: error.message || "Erro ao carregar postos de saúde",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const markers = useMemo(() => {
    return postos.map((posto) => {
      const occupancy = posto.crowding_info?.occupancyPercentage || 0;
      let lotacao = "baixa";
      if (occupancy >= 90) lotacao = "crítica";
      else if (occupancy >= 70) lotacao = "alta";
      else if (occupancy >= 40) lotacao = "média";

      return {
        id: posto.id,
        title: posto.name,
        position: {
          lat: parseFloat(posto.latitude),
          lng: parseFloat(posto.longitude),
        },
        address: posto.address,
        lotacao,
        filaAtual: posto.crowding_info?.reportedQueue || 0,
        avaliacao: posto.rating || 0,
      };
    });
  }, [postos]);

  return (
    <>
      <FixBar />
      <Sidebar 
        activeSection={sidebarSection} 
        onSectionChange={setSidebarSection}
      />

      <Box
        w="100%"
        h="100%"
        background="rgba(30, 48, 63, 1)"
        pl="70px"
        pt="80px"
      >
        <Box h="100%" display="flex" flexDirection="column" p={6}>
            {loading ? (
              <VStack spacing={4} align="center" justify="center" h="100%">
                <Spinner size="xl" color="teal.500" />
                <Text color="white" fontSize="lg">
                  Carregando postos de saúde...
                </Text>
              </VStack>
            ) : (
              <>
                {sidebarSection === "mapa" && (
                  <VStack spacing={4} align="stretch" h="100%">
                    <Box>
                      <Text color="gray.300" fontSize="lg" mb={4}>
                        Visualize a localização das Unidades de Saúde de sua Região
                      </Text>
                      <OccupancyStats postos={postos} />
                    </Box>

                    <Box flex="1" borderRadius="xl" overflow="hidden">
                      <GoogleMap
                        center={{ lat: -27.0945, lng: -52.6166 }}
                        zoom={13}
                        height="100%"
                        markers={markers}
                      />
                    </Box>
                  </VStack>
                )}

                {sidebarSection === "unidades" && (
                  <VStack spacing={4} align="stretch" h="100%">
                    <Box>
                      <HStack justify="space-between" align="center" mb={2}>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="3xl" fontWeight="bold" color="white">
                            Lista de Unidades
                          </Text>
                          <Text color="gray.300" fontSize="lg">
                            Encontrados {postos.length} postos de saúde
                          </Text>
                        </VStack>
                        <Button 
                          colorPalette="teal" variant="solid"
                          size="lg"
                          onClick={() => setIsCreateModalOpen(true)}
                        >
                          + Adicionar Unidade
                        </Button>     
                      </HStack> 
                    </Box>

                    <Box flex="1" overflowY="auto">
                      <PostosList postos={postos} onUpdate={fetchPostos} />
                    </Box>
                  </VStack>
                )}

                {sidebarSection === "perfil" && (
                  <Box h="100%" overflowY="auto">
                    <UserProfile />
                  </Box>
                )}

                {sidebarSection === "dashboard" && (
                  <VStack spacing={4} align="stretch" h="100%">
                    
                      <Dashboard />
                    
                  </VStack>
                )}
                
              </>
            )}
          </Box>
        </Box>

      <PostoCreate
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchPostos}
      />
      <Toaster />
    </>
  );
}

export default function LobbyPage() {
  return (
    <SearchProvider>
      <LobbyContent />
    </SearchProvider>
  );
}
