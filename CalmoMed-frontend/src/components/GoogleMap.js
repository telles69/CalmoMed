'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Box, Spinner, Text, VStack, HStack, Button } from '@chakra-ui/react';

export default function GoogleMap({ 
  center = { lat: -23.5505, lng: -46.6333 }, 
  height = "500px",
  markers = []
}) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const initMap = async () => {
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        setError('API Key do Google Maps não configurada');
        return;
      }

      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places', 'marker']
      });

      try {
        const { Map } = await loader.importLibrary('maps');
        const { AdvancedMarkerElement } = await loader.importLibrary('marker');
        
        const mapInstance = new Map(mapRef.current, {
          center,
          zoom,
          mapId: 'DEMO_MAP_ID',
          styles: [
            {
              "featureType": "all",
              "elementType": "geometry.fill",
              "stylers": [{"weight": "2.00"}]
            },
            {
              "featureType": "all",
              "elementType": "geometry.stroke",
              "stylers": [{"color": "#9c9c9c"}]
            },
            {
              "featureType": "all",
              "elementType": "labels.text",
              "stylers": [{"visibility": "on"}]
            }
          ]
        });

        setMap(mapInstance);
        setIsLoaded(true);

        
        markers.forEach((marker, index) => {
          const markerElement = new AdvancedMarkerElement({
            map: mapInstance,
            position: marker.position,
            title: marker.title,
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 5px 0; color: #2C7A7B;">${marker.title}</h3>
                <p style="margin: 0; color: #666;">${marker.description || 'Posto de Saúde'}</p>
                ${marker.address ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">${marker.address}</p>` : ''}
              </div>
            `
          });

          markerElement.addListener('click', () => {
            infoWindow.open(mapInstance, markerElement);
          });
        });

      } catch (err) {
        console.error('Erro ao carregar Google Maps:', err);
        setError('Erro ao carregar o mapa. Verifique sua conexão e API Key.');
      }
    };

    initMap();
  }, [center, zoom, markers]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          if (map) {
            map.setCenter(location);
            map.setZoom(15);
            
            new google.maps.marker.AdvancedMarkerElement({
              map: map,
              position: location,
              title: "Sua localização",
            });
          }
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setError('Erro ao obter sua localização');
        }
      );
    } else {
      setError('Geolocalização não é suportada neste navegador');
    }
  };

  if (error) {
    return (
      <Box 
        h={height} 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="gray.800"
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.600"
      >
        <VStack>
          <Text color="red.300" textAlign="center">{error}</Text>
          <Text color="gray.400" fontSize="sm" textAlign="center">
            Verifique se a API Key está configurada corretamente no arquivo .env.local
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box position="relative" h={height} borderRadius="lg" overflow="hidden">
      {!isLoaded && (
        <Box 
          position="absolute" 
          top="50%" 
          left="50%" 
          transform="translate(-50%, -50%)"
          zIndex="10"
          bg="rgba(0,0,0,0.7)"
          p={4}
          borderRadius="lg"
        >
          <VStack>
            <Spinner size="lg" color="teal.300" />
            <Text color="white" fontSize="sm">Carregando mapa...</Text>
          </VStack>
        </Box>
      )}
      
      {isLoaded && (
        <HStack 
          position="absolute" 
          top="10px" 
          left="10px" 
          zIndex="10"
          spacing={2}
        >
          <Button
            size="sm"
            colorScheme="teal"
            onClick={getCurrentLocation}
            bg="rgba(45, 122, 123, 0.9)"
            _hover={{ bg: "rgba(45, 122, 123, 1)" }}
          >
            Minha Localização
          </Button>
        </HStack>
      )}
      
      <Box ref={mapRef} h="100%" w="100%" />
    </Box>
  );
}
