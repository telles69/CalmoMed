'use client';
import { Box, VStack, Text, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { FaMapMarkedAlt, FaHospital, FaUser } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { LuChartNoAxesCombined } from "react-icons/lu";

export default function Sidebar({ activeSection, onSectionChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    {
      id: "mapa",
      label: "Mapa",
      icon: FaMapMarkedAlt,
    },
    {
      id: "unidades",
      label: "Unidades",
      icon: FaHospital,
    },
    {
      id: "perfil",
      label: "Meu Perfil",
      icon: FaUser,
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LuChartNoAxesCombined,
    },
  ];

  return (
    <Box
      position="fixed"
      left="0"
      top="80px"
      h="calc(100vh - 80px)"
      w={isExpanded ? "240px" : "70px"}
      bg="rgba(21, 74, 90, 1)"
      transition="width 0.3s ease"
      zIndex="999"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      boxShadow="2px 0 10px rgba(0, 0, 0, 0.3)"
    >
      <VStack spacing={0} align="stretch" pt={4}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Flex
              key={item.id}
              align="center"
              px={4}
              py={4}
              cursor="pointer"
              bg={isActive ? "rgba(255, 255, 255, 0.15)" : "transparent"}
              borderLeft={isActive ? "4px solid" : "4px solid transparent"}
              borderColor={isActive ? "teal.300" : "transparent"}
              _hover={{
                bg: "rgba(255, 255, 255, 0.1)",
              }}
              transition="all 0.2s ease"
              onClick={() => onSectionChange(item.id)}
            >
              <Flex
                align="center"
                justify="center"
                minW="38px"
                h="38px"
              >
                <Icon size={24} color="white" />
              </Flex>
              
              {isExpanded && (
                <Text
                  ml={4}
                  color="white"
                  fontSize="md"
                  fontWeight={isActive ? "semibold" : "normal"}
                  whiteSpace="nowrap"
                >
                  {item.label}
                </Text>
              )}
            </Flex>
          );
        })}
      </VStack>

      {/* Indicador de expansão */}
      <Box
        position="absolute"
        bottom="20px"
        left="50%"
        transform="translateX(-50%)"
        color="rgba(255, 255, 255, 0.5)"
        fontSize="xs"
        textAlign="center"
      >
        {!isExpanded && (
          <Text fontSize="10px" writingMode="vertical-rl">
            Menu
          </Text>
        )}
      </Box>
    </Box>
  );
}
