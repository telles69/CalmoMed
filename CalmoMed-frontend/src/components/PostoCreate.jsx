'use client';
import { useState } from 'react';
import {
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Input,
  Grid,
  GridItem
} from "@chakra-ui/react";

import { postosService } from "@/services/api";
import { toaster, Toaster } from "@/components/ui/toaster";

// Importar biblioteca Plus Code do Google
let OpenLocationCodeClass;
if (typeof window !== 'undefined') {
  const OLC = require('open-location-code');
  OpenLocationCodeClass = OLC.OpenLocationCode;
}

export default function PostoCreate({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [loadingPlusCode, setLoadingPlusCode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    plusCode: '',
    latitude: '',
    longitude: '',
    contact: '',
    services: [],
    specialties: [],
    opening_hours: '',
  });

  const [newService, setNewService] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addService = () => {
    if (newService.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService('');
    }
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const decodePlusCode = async (plusCode) => {
    if (!plusCode.trim()) {
      setFormData(prev => ({
        ...prev,
        latitude: '',
        longitude: ''
      }));
      return;
    }

    try {
      setLoadingPlusCode(true);
      
      // Extrair apenas o código (remover texto adicional se houver)
      // Ex: "W9G5+CP Cristo Rei, Chapecó - SC" -> "W9G5+CP"
      const codeMatch = plusCode.match(/[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}/i);
      const cleanCode = codeMatch ? codeMatch[0].toUpperCase() : plusCode.trim().toUpperCase();

      // Criar instância do decodificador
      const olc = new OpenLocationCodeClass();

      let fullCode = cleanCode;

      // Se for um código curto (6 ou 7 caracteres), expandir com localização de Chapecó
      if (olc.isShort(cleanCode)) {
        // Chapecó, SC: -27.0945, -52.6166
        fullCode = olc.recoverNearest(cleanCode, -27.0945, -52.6166);
      }

      // Validar se é um Plus Code válido
      if (!olc.isValid(fullCode) || !olc.isFull(fullCode)) {
        throw new Error('Plus Code inválido ou incompleto');
      }

      // Decodificar usando a biblioteca oficial
      const codeArea = olc.decode(fullCode);
      
      // Pegar o centro da área
      const finalLat = codeArea.latitudeCenter;
      const finalLng = codeArea.longitudeCenter;
        
      setFormData(prev => ({
        ...prev,
        latitude: finalLat.toFixed(6),
        longitude: finalLng.toFixed(6)
      }));

      toaster.create({
        title: "Plus Code decodificado!",
        description: `Coordenadas: ${finalLat.toFixed(6)}, ${finalLng.toFixed(6)}`,
        type: "success",
      });
    } catch (error) {
      console.error('Erro ao decodificar Plus Code:', error);
      toaster.create({
        title: "Erro",
        description: error.message || "Não foi possível decodificar o Plus Code. Verifique o formato.",
        type: "error",
      });
      
      setFormData(prev => ({
        ...prev,
        latitude: '',
        longitude: ''
      }));
    } finally {
      setLoadingPlusCode(false);
    }
  };

  const handleClose = () => {
    // Limpar formulário ao fechar
    setFormData({
      name: '',
      address: '',
      plusCode: '',
      latitude: '',
      longitude: '',
      contact: '',
      services: [],
      specialties: [],
      opening_hours: '',
    });
    setNewService('');
    setNewSpecialty('');
    onClose();
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.name || !formData.address || !formData.contact) {
      toaster.create({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        type: "error",
      });
      return;
    }

    if (!formData.plusCode) {
      toaster.create({
        title: "Erro",
        description: "Por favor, insira o Plus Code da localização.",
        type: "error",
      });
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toaster.create({
        title: "Erro",
        description: "Plus Code não foi decodificado. Clique em 'Buscar Coords'.",
        type: "error",
      });
      return;
    }

    // Validar latitude e longitude
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      toaster.create({
        title: "Erro",
        description: "Latitude e longitude devem ser números válidos.",
        type: "error",
      });
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toaster.create({
        title: "Erro",
        description: "Coordenadas inválidas. Latitude: -90 a 90, Longitude: -180 a 180.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const postoData = {
        name: formData.name,
        address: formData.address,
        latitude: lat.toString(),
        longitude: lng.toString(),
        contact: formData.contact,
        services: formData.services,
        specialties: formData.specialties,
        opening_hours: formData.opening_hours.trim() || null,
      };

      const result = await postosService.create(postoData);

      toaster.create({
        title: "Sucesso!",
        description: "Posto de saúde criado com sucesso.",
        type: "success",
      });

      // Limpar formulário
      setFormData({
        name: '',
        address: '',
        plusCode: '',
        latitude: '',
        longitude: '',
        contact: '',
        services: [],
        specialties: [],
        opening_hours: '',
      });
      setNewService('');
      setNewSpecialty('');

      onClose();
      
      // Chamar callback de sucesso para atualizar lista
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      let errorMessage = "Erro ao criar posto de saúde.";
      
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        errorMessage = "Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:3001";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toaster.create({
        title: "Erro ao criar posto",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay de fundo */}
      <Box
        position="fixed"
        top="0"
        left="0"
        w="100vw"
        h="100vh"
        bg="rgba(0, 0, 0, 0.6)"
        zIndex="999"
        onClick={handleClose}
      />

      {/* Modal */}
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        bg="gray.800"
        color="white"
        borderRadius="xl"
        boxShadow="2xl"
        zIndex="1001"
        w="90%"
        maxW="600px"
        maxH="90vh"
        overflowY="auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box p={6} borderBottom="1px solid" borderColor="gray.700">
          <HStack justify="space-between" align="center">
            <Text fontSize="xl" fontWeight="bold">
              Adicionar Novo Posto de Saúde
            </Text>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClose}
              color="gray.400"
              _hover={{ color: "white", bg: "gray.700" }}
            >
              ✕
            </Button>
          </HStack>
        </Box>

        {/* Body */}
        <Box p={6}>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">
                Nome do Posto <Text as="span" color="red.400">*</Text>
              </Text>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: UBS Centro"
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                _placeholder={{ color: "gray.400" }}
                _hover={{ borderColor: "teal.500" }}
                _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)" }}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">
                Endereço Completo <Text as="span" color="red.400">*</Text>
              </Text>
              <Input
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Ex: Rua das Flores, 123 - Centro"
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                _placeholder={{ color: "gray.400" }}
                _hover={{ borderColor: "teal.500" }}
                _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)" }}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">
                Telefone de Contato <Text as="span" color="red.400">*</Text>
              </Text>
              <Input
                value={formData.contact}
                onChange={(e) => handleChange('contact', e.target.value)}
                placeholder="Ex: (49) 3321-1234"
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                _placeholder={{ color: "gray.400" }}
                _hover={{ borderColor: "teal.500" }}
                _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)" }}
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">
                Plus Code (Google) <Text as="span" color="red.400">*</Text>
              </Text>
              <HStack spacing={2}>
                <Input
                  value={formData.plusCode}
                  onChange={(e) => handleChange('plusCode', e.target.value)}
                  placeholder="Ex: W9G5+CP ou W9G5+CP Cristo Rei, Chapecó - SC"
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: "gray.400" }}
                  _hover={{ borderColor: "teal.500" }}
                  _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)" }}
                />
                <Button
                  colorScheme="teal"
                  size="md"
                  onClick={() => decodePlusCode(formData.plusCode)}
                  loading={loadingPlusCode}
                  disabled={loadingPlusCode || !formData.plusCode}
                  minW="140px"
                >
                  {loadingPlusCode ? 'Buscando...' : 'Buscar Coords'}
                </Button>
              </HStack>
            </Box>

            {formData.latitude && formData.longitude && (
              <Box p={3} bg="green.900" borderRadius="md" borderLeft="4px solid" borderColor="green.500">
                <Text fontSize="sm" color="green.200" fontWeight="medium">
                  ✓ Coordenadas obtidas: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                </Text>
              </Box>
            )}

            <Box p={3} bg="blue.900" borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="blue.200" fontWeight="medium">
                  📍 Como obter o Plus Code:
                </Text>
                <Text fontSize="xs" color="blue.300">
                  1. Abra o Google Maps e localize o posto de saúde
                </Text>
                <Text fontSize="xs" color="blue.300">
                  2. Clique no local com o botão direito
                </Text>
                <Text fontSize="xs" color="blue.300">
                  3. O Plus Code aparecerá nas informações (ex: W9G5+CP)
                </Text>
                <Text fontSize="xs" color="blue.300">
                  4. Cole aqui e clique em "Buscar Coords"
                </Text>
              </VStack>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">
                Serviços Disponíveis
              </Text>
              <HStack spacing={2} mb={2}>
                <Input
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addService()}
                  placeholder="Ex: Clínico Geral, Pediatria..."
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: "gray.400" }}
                  _hover={{ borderColor: "teal.500" }}
                  _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)" }}
                />
                <Button
                  colorScheme="teal"
                  size="md"
                  onClick={addService}
                  minW="100px"
                >
                  Adicionar
                </Button>
              </HStack>
              {formData.services.length > 0 && (
                <VStack align="stretch" spacing={2}>
                  {formData.services.map((service, index) => (
                    <HStack key={index} p={2} bg="gray.700" borderRadius="md">
                      <Text flex="1" fontSize="sm" color="white">• {service}</Text>
                      <Button
                        size="sm"
                        variant="ghost"
                        color="red.400"
                        onClick={() => removeService(index)}
                        _hover={{ bg: "red.900" }}
                      >
                        ✕
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">
                Especialidades Médicas
              </Text>
              <HStack spacing={2} mb={2}>
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                  placeholder="Ex: Cardiologia, Dermatologia..."
                  bg="gray.700"
                  borderColor="gray.600"
                  color="white"
                  _placeholder={{ color: "gray.400" }}
                  _hover={{ borderColor: "teal.500" }}
                  _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)" }}
                />
                <Button
                  colorScheme="teal"
                  size="md"
                  onClick={addSpecialty}
                  minW="100px"
                >
                  Adicionar
                </Button>
              </HStack>
              {formData.specialties.length > 0 && (
                <VStack align="stretch" spacing={2}>
                  {formData.specialties.map((specialty, index) => (
                    <HStack key={index} p={2} bg="gray.700" borderRadius="md">
                      <Text flex="1" fontSize="sm" color="white">• {specialty}</Text>
                      <Button
                        size="sm"
                        variant="ghost"
                        color="red.400"
                        onClick={() => removeSpecialty(index)}
                        _hover={{ bg: "red.900" }}
                      >
                        ✕
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">
                Horário de Funcionamento
              </Text>
              <Input
                value={formData.opening_hours}
                onChange={(e) => handleChange('opening_hours', e.target.value)}
                placeholder="Ex: Segunda a Sexta: 7h-17h, Sábado: 7h-12h"
                bg="gray.700"
                borderColor="gray.600"
                color="white"
                _placeholder={{ color: "gray.400" }}
                _hover={{ borderColor: "teal.500" }}
                _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)" }}
              />
            </Box>
          </VStack>
        </Box>

        {/* Footer */}
        <Box p={6} borderTop="1px solid" borderColor="gray.700" position="relative" zIndex="1002">
          <HStack spacing={3} justify="flex-end">
            <Button 
              type="button"
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              borderColor="gray.500"
              color="white"
              cursor="pointer"
              _hover={{ bg: "gray.700", borderColor: "gray.400" }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              colorScheme="teal"
              onClick={(e) => {
                e.stopPropagation();
                handleSubmit();
              }}
              cursor="pointer"
              bg="teal.500"
              _hover={{ bg: "teal.600" }}
            >
              {loading ? 'Criando...' : 'Adicionar'}
            </Button>
          </HStack>
        </Box>
      </Box>
    </>
  );
}
