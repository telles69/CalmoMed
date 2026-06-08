'use client';
import { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import 'leaflet/dist/leaflet.css';

export default function LeafletMapClient({
  center = { lat: -27.0945, lng: -52.6166 },
  zoom = 13,
  height = '500px',
  markers = [],
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainer.current) return;
    if (initializedRef.current) return; // Evita reinicializar

    initializedRef.current = true;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Corrigir ícones
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      try {
        // Criar mapa
        const map = L.map(mapContainer.current).setView(
          [center.lat, center.lng],
          zoom
        );

        mapRef.current = map;

        // Adicionar tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Função para criar ícones
        const createLotacaoIcon = (lotacao) => {
          const colors = {
            baixa: '#10B981',
            média: '#F59E0B',
            alta: '#EF4444',
            crítica: '#7C3AED',
          };

          const color = colors[lotacao] || '#10B981';

          return L.divIcon({
            html: `
              <div style="
                background-color: ${color};
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                color: white;
                font-weight: bold;
                font-size: 14px;
                cursor: pointer;
              ">!</div>
            `,
            iconSize: [32, 32],
            popupAnchor: [0, -16],
          });
        };

        // Adicionar marcadores
        if (markers && markers.length > 0) {
          const bounds = L.latLngBounds(
            markers.map((m) => [m.position.lat, m.position.lng])
          );

          markers.forEach((marker) => {
            const lotacaoLabels = {
              baixa: 'Baixa',
              média: 'Média',
              alta: 'Alta',
              crítica: 'Crítica',
            };

            const popupContent = `
              <div style="padding: 8px; font-family: system-ui; font-size: 13px;">
                <div style="font-weight: bold; margin-bottom: 8px;">${marker.title}</div>
                <div style="font-size: 12px; margin-bottom: 6px; color: #666;">
                  📍 ${marker.address}
                </div>
                <div style="margin-bottom: 6px;">
                  <span style="
                    background-color: ${marker.lotacao === 'baixa' ? '#10B981' : marker.lotacao === 'média' ? '#F59E0B' : marker.lotacao === 'alta' ? '#EF4444' : '#7C3AED'};
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    display: inline-block;
                  ">
                    ${lotacaoLabels[marker.lotacao] || 'Desconhecida'}
                  </span>
                </div>
                <div style="font-size: 12px;">
                  <div>👥 Fila: ${marker.filaAtual}</div>
                  <div>⭐ ${marker.avaliacao.toFixed(1)}</div>
                </div>
              </div>
            `;

            L.marker([marker.position.lat, marker.position.lng], {
              icon: createLotacaoIcon(marker.lotacao),
            })
              .bindPopup(popupContent, { maxWidth: 280, minWidth: 200 })
              .addTo(map);
          });

          // Ajustar zoom
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (error) {
        console.error('Erro ao inicializar mapa:', error);
        initializedRef.current = false;
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error('Erro ao remover mapa:', e);
        }
        mapRef.current = null;
        initializedRef.current = false;
      }
    };
  }, []);

  return (
    <Box
      ref={mapContainer}
      h={height}
      w="100%"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
    />
  );
}
