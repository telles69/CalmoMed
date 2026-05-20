'use client';
import { useState } from 'react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Input
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { occupancyService } from "@/services/api";

export default function ReportOccupancyModal({ isOpen, onClose, posto }) {
  const [peopleCount, setPeopleCount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!peopleCount || peopleCount < 0) {
      toaster.create({
        title: "Erro",
        description: "Por favor, informe um número válido de pessoas.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // Obter localização do usuário
      let userLocation = null;
      if (navigator.geolocation) {
        userLocation = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            () => resolve(null)
          );
        });
      }

      const reportData = {
        posto_id: posto.id,
        people_count: parseInt(peopleCount),
        user_location: userLocation ? {
          type: 'Point',
          coordinates: [userLocation.lng, userLocation.lat]
        } : null,
      };

      console.log('Enviando relatório:', reportData);

      await occupancyService.create(reportData);

      toaster.create({
        title: "Sucesso!",
        description: "Relatório de ocupação enviado com sucesso.",
        type: "success",
      });

      setPeopleCount('');
      onClose();
      
      // Recarregar a página para atualizar os dados
      window.location.reload();
    } catch (error) {
      console.error("Erro ao enviar relatório:", error);
      toaster.create({
        title: "Erro",
        description: error.message || "Erro ao enviar relatório de ocupação.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose} size="md">
      <DialogContent bg="gray.800" color="white">
        <DialogHeader>
          <DialogTitle>Reportar Ocupação</DialogTitle>
        </DialogHeader>
        <DialogCloseTrigger />

        <DialogBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={2}>
                {posto?.name}
              </Text>
              <Text fontSize="sm" color="gray.400">
                {posto?.address}
              </Text>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">
                Quantas pessoas você vê na fila/sala de espera? <Text as="span" color="red.400">*</Text>
              </Text>
              <Input
                type="number"
                min="0"
                value={peopleCount}
                onChange={(e) => setPeopleCount(e.target.value)}
                placeholder="Ex: 15"
                bg="gray.700"
                borderColor="gray.600"
                _hover={{ borderColor: "teal.500" }}
                _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)" }}
              />
            </Box>

            <Box p={3} bg="blue.900" borderRadius="md" borderLeft="4px solid" borderColor="blue.500">
              <Text fontSize="sm" color="blue.200">
                Sua localização será usada para calcular a distância até o posto e melhorar a precisão dos dados.
              </Text>
            </Box>
          </VStack>
        </DialogBody>

        <DialogFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleSubmit}
              loading={loading}
            >
              Enviar Relatório
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
