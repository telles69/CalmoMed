import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';

export function Provider({ children }) {
  return (
    <ChakraProvider>
      <ThemeProvider attribute="class">
        <Toaster />
        {children}
      </ThemeProvider>
    </ChakraProvider>
  );
}
