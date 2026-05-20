'use client';
import { Box, VStack, HStack, Text, Button, Avatar, Badge, Grid, GridItem } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaIdCard, FaCalendar, FaCrown } from "react-icons/fa";
import { authService } from "@/services/api";
import { toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Primeiro tenta pegar do localStorage
      const localUser = authService.getUser();
      
      if (localUser) {
        setUser(localUser);
      }

      // Tenta atualizar com dados do servidor
      try {
        const profileData = await authService.getProfile();
        setUser(profileData);
        // Atualiza localStorage com dados mais recentes
        localStorage.setItem('calmomed_user', JSON.stringify(profileData));
      } catch (error) {
        // Se falhar, usa dados do localStorage
        if (!localUser) {
          throw error;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      toaster.create({
        title: "Erro",
        description: "Não foi possível carregar os dados do usuário.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toaster.create({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
      type: "success",
    });
    router.push('/Login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleLabel = (role) => {
    return role === 'admin' ? 'Administrador' : 'Usuário';
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'orange' : 'teal';
  };

  if (loading) {
    return (
      <VStack spacing={4} align="center" justify="center" h="100%">
        <Text color="white" fontSize="lg">
          Carregando perfil...
        </Text>
      </VStack>
    );
  }

  if (!user) {
    return (
      <VStack spacing={4} align="center" justify="center" h="100%">
        <Text color="white" fontSize="lg">
          Nenhum usuário logado
        </Text>
        <Button colorScheme="teal" onClick={() => router.push('/Login')}>
          Fazer Login
        </Button>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch" h="100%">
      {/* Header do Perfil */}
      <Box>
        <Text fontSize="3xl" fontWeight="bold" color="white" mb={2}>
          Meu Perfil
        </Text>
        <Text color="gray.300" fontSize="lg">
          Informações da sua conta
        </Text>
      </Box>

      {/* Card Principal do Perfil */}
      <Box 
        bg="gray.800" 
        borderRadius="xl" 
        p={6}
        boxShadow="2xl"
        borderWidth="1px"
        borderColor="gray.700"
      >
        <VStack spacing={6} align="stretch">
          {/* Avatar e Nome */}
          <HStack spacing={4} align="center">
            <Avatar.Root 
              size="xl"
              bg={getRoleColor(user.role) + '.500'}
              color="white"
            >
              <Avatar.Fallback>{user.name?.charAt(0).toUpperCase()}</Avatar.Fallback>
            </Avatar.Root>
            <VStack align="start" spacing={1} flex="1">
              <HStack>
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  {user.name}
                </Text>
                {user.role === 'admin' && (
                  <Badge colorScheme={getRoleColor(user.role)} fontSize="sm" px={2} py={1}>
                    <HStack spacing={1}>
                      <FaCrown size={12} />
                      <Text>{getRoleLabel(user.role)}</Text>
                    </HStack>
                  </Badge>
                )}
              </HStack>
              {user.role !== 'admin' && (
                <Badge colorScheme={getRoleColor(user.role)} fontSize="sm" px={2} py={1}>
                  {getRoleLabel(user.role)}
                </Badge>
              )}
            </VStack>
          </HStack>

          {/* Informações Detalhadas */}
          <Grid templateColumns="repeat(1, 1fr)" gap={4} mt={4}>
            <GridItem>
              <Box 
                bg="gray.700" 
                p={4} 
                borderRadius="md"
                borderLeft="4px solid"
                borderColor="teal.500"
              >
                <HStack spacing={3}>
                  <Box color="teal.400">
                    <FaEnvelope size={20} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="gray.400" fontWeight="semibold">
                      E-mail
                    </Text>
                    <Text fontSize="md" color="white">
                      {user.email}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </GridItem>

            <GridItem>
              <Box 
                bg="gray.700" 
                p={4} 
                borderRadius="md"
                borderLeft="4px solid"
                borderColor="blue.500"
              >
                <HStack spacing={3}>
                  <Box color="blue.400">
                    <FaIdCard size={20} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="gray.400" fontWeight="semibold">
                      CPF
                    </Text>
                    <Text fontSize="md" color="white">
                      {user.cpf}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </GridItem>

            <GridItem>
              <Box 
                bg="gray.700" 
                p={4} 
                borderRadius="md"
                borderLeft="4px solid"
                borderColor="purple.500"
              >
                <HStack spacing={3}>
                  <Box color="purple.400">
                    <FaCalendar size={20} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="gray.400" fontWeight="semibold">
                      Última atualização
                    </Text>
                    <Text fontSize="md" color="white">
                      {formatDate(user.updated_at)}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </GridItem>

            {user.last_login && (
              <GridItem>
                <Box 
                  bg="gray.700" 
                  p={4} 
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="green.500"
                >
                  <HStack spacing={3}>
                    <Box color="green.400">
                      <FaCalendar size={20} />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" color="gray.400" fontWeight="semibold">
                        Último acesso
                      </Text>
                      <Text fontSize="md" color="white">
                        {formatDate(user.last_login)}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </GridItem>
            )}
          </Grid>

          {/* Estatísticas (se houver) */}
          {user.favorite_postos && Array.isArray(user.favorite_postos) && user.favorite_postos.length > 0 && (
            <Box 
              bg="gray.700" 
              p={4} 
              borderRadius="md"
              mt={2}
            >
              <Text fontSize="sm" fontWeight="semibold" color="gray.300" mb={2}>
                Postos Favoritos
              </Text>
              <Text fontSize="2xl" color="yellow.400" fontWeight="bold">
                {user.favorite_postos.length}
              </Text>
            </Box>
          )}
        </VStack>
      </Box>

      {/* Botão de Logout */}
      <Box>
        <Button
          colorScheme="red"
          size="lg"
          w="100%"
          onClick={handleLogout}
        >
          Sair da Conta
        </Button>
      </Box>
    </VStack>
  );
}
