'use client';
import { Box, Flex, Input, Text, Button, VStack } from "@chakra-ui/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FaSearch, FaUserCircle, FaCog } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSearch } from "@/contexts/SearchContext";

export default function FixBar() {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { searchPosto, postos } = useSearch();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSuggestions = postos.filter(posto =>
    posto.name?.toLowerCase().includes(localSearchTerm.toLowerCase()) && localSearchTerm.length > 0
  );

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      searchPosto(localSearchTerm);
      setShowSuggestions(false);
    }
  };

  const searchClickInput = () => {
    searchPosto(localSearchTerm);
    setShowSuggestions(false);
  };

  const suggestionClickInput = (suggestion) => {
    setLocalSearchTerm(suggestion);
    searchPosto(suggestion);
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    setLocalSearchTerm(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  return (
    <Box 
      w="100%" 
      position="fixed" 
      top="0" 
      left="0" 
      zIndex="1001"
      bg="rgba(93, 167, 167, 1)"
      boxShadow="0 2px 10px rgba(0, 0, 0, 0.3)"
    >
      <Flex
        w="100%"
        py={3}
        px={6}
        align="center"
        justify="space-between"
        h="80px"
      >
        <Flex align="center" gap={3}>
          <Image
            src="/images/logo-.png"
            alt="Logo"
            width={60}
            height={60}
          />
          
        </Flex>
        <Box position="relative" w="100%" maxW="500px" mx={6}>
          <Input
            borderRadius="full"
            value={localSearchTerm}
            onChange={handleInputChange}
            onKeyPress={handleSearch}
            onFocus={() => setShowSuggestions(localSearchTerm.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            pl={12}
            pr={12}
            h="40px"
            fontSize="md"
            placeholder="Buscar postos de saúde..."
            _placeholder={{ color: "rgba(255, 255, 255, 0.7)" }}
            bg="rgba(255, 255, 255, 0.15)"
            border="1px solid rgba(255, 255, 255, 0.3)"
            color="white"
            _focus={{
              bg: "rgba(255, 255, 255, 0.2)",
              borderColor: "teal.300",
              outline: "none"
            }}
          />
          <Box position="absolute" left={4} top="50%" transform="translateY(-50%)">
            <FaSearch color="rgba(255, 255, 255, 0.7)" size={16} />
          </Box>
          <Button
            position="absolute"
            right={2}
            top="50%"
            transform="translateY(-50%)"
            size="sm"
            variant="ghost"
            color="white"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            onClick={searchClickInput}
            px={2}
          >
            
          </Button>
          
          {mounted && showSuggestions && filteredSuggestions.length > 0 && (
            <Box
              position="absolute"
              top="100%"
              left="0"
              right="0"
              bg="white"
              borderRadius="md"
              boxShadow="lg"
              zIndex="1002"
              mt={1}
              maxH="200px"
              overflowY="auto"
            >
              {filteredSuggestions.map((suggestion) => (
                <Box
                  key={suggestion.id}
                  p={3}
                  cursor="pointer"
                  color="gray.800"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => suggestionClickInput(suggestion.name)}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                >
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium">{suggestion.name}</Text>
                    <Text fontSize="xs" color="gray.600">{suggestion.address}</Text>
                  </VStack>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        
        <Flex align="center" gap={4}>
          {/* <Button
            variant="ghost"
            color="white"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            leftIcon={<FaCog />}
            size="sm"
          >
            Configurações
          </Button> */}
          <Button
            variant="ghost"
            color="white"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            leftIcon={<FaUserCircle />}
            size="sm"
            onClick={() => router.push('/Login')}
          >
            Sair
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
