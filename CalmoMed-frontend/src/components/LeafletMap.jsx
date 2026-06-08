'use client';
import dynamic from 'next/dynamic';
import { Box, Spinner } from '@chakra-ui/react';

const LeafletMapComponent = dynamic(
  () => import('./LeafletMapClient'),
  {
    ssr: false,
    loading: () => (
      <Box
        h="500px"
        w="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.100"
        borderRadius="xl"
      >
        <Spinner size="lg" color="teal.500" />
      </Box>
    ),
  }
);

export default function LeafletMap(props) {
  return (
    <Box h="500px" w="100%" borderRadius="xl" overflow="hidden">
      <LeafletMapComponent {...props} />
    </Box>
  );
}
