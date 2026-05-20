'use client';
import { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedMarker, setHighlightedMarker] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [postos, setPostos] = useState([]);

  const searchPosto = (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setHighlightedMarker(null);
      return;
    }

    const termLower = term.toLowerCase();
    
    // Primeiro tenta busca exata pelo nome
    let foundPosto = postos.find(posto => 
      posto.name?.toLowerCase() === termLower
    );
    
    // Se não encontrou, busca parcial (contém o termo)
    if (!foundPosto) {
      foundPosto = postos.find(posto => 
        posto.name?.toLowerCase().includes(termLower) ||
        posto.id?.toString().toLowerCase() === termLower ||
        posto.address?.toLowerCase().includes(termLower)
      );
    }

    if (foundPosto && mapInstance) {
      console.log('Posto encontrado:', foundPosto);
      
      const position = {
        lat: parseFloat(foundPosto.latitude),
        lng: parseFloat(foundPosto.longitude)
      };
      
      // Animar pan + zoom suavemente
      mapInstance.panTo(position);
      setTimeout(() => {
        mapInstance.setZoom(16);
      }, 500);
      
      setHighlightedMarker(foundPosto.id);
      
      setTimeout(() => {
        setHighlightedMarker(null);
      }, 3000);
    } else {
      console.log('Posto não encontrado. Termo:', term, 'Postos disponíveis:', postos);
    }
  };

  return (
    <SearchContext.Provider value={{
      searchTerm,
      setSearchTerm,
      highlightedMarker,
      setHighlightedMarker,
      mapInstance,
      setMapInstance,
      postos,
      setPostos,
      searchPosto
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
