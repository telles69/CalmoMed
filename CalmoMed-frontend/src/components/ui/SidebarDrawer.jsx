"use client"

import React from 'react';
import Link from 'next/link';
import { Button, CloseButton, Drawer, Portal, VStack, Box, Text, Heading } from "@chakra-ui/react";

const SidebarDrawer = () => {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <Button 
          position="fixed" 
          top="4" 
          left="10" 
          zIndex="1000"
          variant="outline" 
          size="sm"
          aria-label="Open menu"
        >
          Menu
        </Button>
      </Drawer.Trigger>
      
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Menu Principal</Drawer.Title>
              <Text fontSize="sm" color="gray.500">CalmoMed</Text>
            </Drawer.Header>
            
            <Drawer.Body>
              <VStack align="stretch" gap="3" mt="4">
                <Link href="/Lobby" passHref>
                  <Button 
                    w="100%" 
                    justifyContent="flex-start" 
                    colorScheme="teal"
                    variant="solid"
                  >
                    Mapa
                  </Button>
                </Link>

                <Link href="/Postos" passHref>
                  <Button 
                    w="100%" 
                    justifyContent="flex-start"
                    variant="ghost"
                  >
                    Postos
                  </Button>
                </Link>

                <Link href="/Notificacoes" passHref>
                  <Button 
                    w="100%" 
                    justifyContent="flex-start"
                    variant="ghost"
                  >
                    Notificações
                  </Button>
                </Link>
              </VStack>
            </Drawer.Body>
            
            <Drawer.Footer>
              <Text fontSize="xs" color="gray.600">
                © {new Date().getFullYear()} CalmoMed
              </Text>
            </Drawer.Footer>
            
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default SidebarDrawer;
