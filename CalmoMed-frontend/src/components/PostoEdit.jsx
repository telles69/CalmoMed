'use client';
import { useState, useEffect } from 'react';
import { Button, VStack, HStack, Text, Box, Input } from "@chakra-ui/react";
import { toaster, Toaster } from "@/components/ui/toaster";
import { postosService } from "@/services/api";
import * as OpenLocationCode from 'open-location-code';

let OpenLocationCodeClass;
if (typeof window !== 'undefined') {
  const OLC = require('open-location-code');
  OpenLocationCodeClass = OLC.OpenLocationCode;
}

export default function PostoEdit({ isOpen, onClose, posto, onSuccess }) {
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

  // Preencher formulário quando posto mudar
  useEffect(() => {
    if (posto && isOpen) {
      let contact = posto.contact || '';
      
      // Se contact for string que parece JSON, tentar fazer parse
      if (typeof contact === 'string' && contact.startsWith('{')) {
        try {
          const parsed = JSON.parse(contact);
          contact = parsed.phone || parsed.contact || contact;
        } catch (e) {
          // Se falhar o parse, manter como está
        }
      }
      
      // Se contact for um objeto ou array, extrair valor string
      if (typeof contact === 'object') {
        if (Array.isArray(contact)) {
          contact = contact[0] || '';
        } else if (contact.phone) {
          contact = contact.phone;
        } else {
          contact = '';
        }
      }
      
      setFormData({
        name: posto.name || posto.nome || '',
        address: posto.address || posto.endereco || '',
        plusCode: '',
        latitude: posto.latitude || '',
        longitude: posto.longitude || '',
        contact: contact,
        services: Array.isArray(posto.services) ? posto.services : [],
        specialties: Array.isArray(posto.specialties) ? posto.specialties : [],
        opening_hours: posto.opening_hours || '',
      });
    }
  }, [posto, isOpen]);

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

  const decodePlusCode = async () => {
    if (!formData.plusCode.trim()) return;

    try {
      setLoadingPlusCode(true);
      
      const codeMatch = formData.plusCode.match(/[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}/i);
      const cleanCode = codeMatch ? codeMatch[0].toUpperCase() : formData.plusCode.trim().toUpperCase();

      const olc = new OpenLocationCodeClass();
      let fullCode = cleanCode;

      if (olc.isShort(cleanCode)) {
        fullCode = olc.recoverNearest(cleanCode, -27.0945, -52.6166);
      }

      if (!olc.isValid(fullCode) || !olc.isFull(fullCode)) {
        throw new Error('Plus Code inválido ou incompleto');
      }

      const codeArea = olc.decode(fullCode);
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
      toaster.create({
        title: "Erro",
        description: error.message || "Não foi possível decodificar o Plus Code.",
        type: "error",
      });
    } finally {
      setLoadingPlusCode(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.contact) {
      toaster.create({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        type: "error",
      });
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toaster.create({
        title: "Erro",
        description: "Coordenadas inválidas.",
        type: "error",
      });
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toaster.create({
        title: "Erro",
        description: "Coordenadas inválidas.",
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

      await postosService.update(posto.id, postoData);

      toaster.create({
        title: "Sucesso!",
        description: "Posto atualizado com sucesso.",
        type: "success",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      toaster.create({
        title: "Erro",
        description: error.message || "Erro ao atualizar posto.",
        type: "error",
      });
    } finally {
      setLoading(false);
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
        zIndex="999"
        onClick={onClose}
      />

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
        <Box p={6} borderBottom="1px solid" borderColor="gray.700">
          <HStack justify="space-between" align="center">
            <Text fontSize="xl" fontWeight="bold">
              Editar Posto de Saúde
            </Text>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              color="gray.400"
              _hover={{ color: "white", bg: "gray.700" }}
            >
              ✕
            </Button>
          </HStack>
        </Box>

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
                Plus Code (Google) - Opcional
              </Text>
              <HStack spacing={2}>
                <Input
                  value={formData.plusCode}
                  onChange={(e) => handleChange('plusCode', e.target.value)}
                  placeholder="Ex: W9G5+CP"
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
                  onClick={decodePlusCode}
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
                  ✓ Coordenadas: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                </Text>
              </Box>
            )}

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

        <Box p={6} borderTop="1px solid" borderColor="gray.700" position="relative" zIndex="1002">
          <HStack spacing={3} justify="flex-end">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
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
              onClick={handleSubmit}
              disabled={loading}
              cursor="pointer"
              bg="teal.500"
              _hover={{ bg: "teal.600" }}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </HStack>
        </Box>
      </Box>
    </>
  );
}
