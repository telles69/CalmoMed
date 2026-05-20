'use client';
import { VStack, Input, Button, Text } from "@chakra-ui/react";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterInput({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !cpf || !password || !confirmPassword) {
      toaster.create({
        title: "Erro no cadastro",
        description: "Preencha todos os campos!",
        type: "error",
        duration: 4000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toaster.create({
        title: "Erro no cadastro",
        description: "As senhas não coincidem!",
        type: "error",
        duration: 4000,
      });
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, cpf);
      toaster.create({
        title: "Cadastro realizado com sucesso!",
        description: "Você já está logado.",
        type: "success",
        duration: 4000,
      });
      onRegister({ name, email, cpf });
    } catch (error) {
      toaster.create({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta. Tente novamente.",
        type: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <VStack spacing={3} align="stretch">
        <Text fontSize="sm" color="white"  fontWeight="medium">
          Nome Completo
        </Text>
        <Input
          type="text"
          placeholder="Digite seu nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          bg="white"
          border="1px solid"
          borderColor="gray.300"
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />
      </VStack>

      <VStack spacing={3} align="stretch">
        <Text fontSize="sm" color="white"  fontWeight="medium">
          Email
        </Text>
        <Input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          bg="white"
          border="1px solid"
          borderColor="gray.300"
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />
      </VStack>

      <VStack spacing={3} align="stretch">
        <Text fontSize="sm" color="white"  fontWeight="medium">
          CPF
        </Text>
        <Input
          type="text"
          placeholder="Digite seu CPF (apenas números)"
          value={cpf}
          onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
          maxLength={11}
          bg="white"
          border="1px solid"
          borderColor="gray.300"
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />
      </VStack>

      <VStack spacing={3} align="stretch">
        <Text fontSize="sm" color="white"  fontWeight="medium">
          Senha
        </Text>
        <Input
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          bg="white"
          border="1px solid"
          borderColor="gray.300"
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />
      </VStack>

      <VStack spacing={3} align="stretch">
        <Text fontSize="sm" color="white"  fontWeight="medium">
          Confirmar Senha
        </Text>
        <Input
          type="password"
          placeholder="Confirme sua senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          bg="white"
          border="1px solid"
          borderColor="gray.300"
          _focus={{ borderColor: "teal.500", boxShadow: "0 0 0 1px teal.500" }}
        />
      </VStack>

      <Button
        colorScheme="teal"
        size="lg"
        onClick={handleSubmit}
        disabled={!name || !email || !cpf || !password || !confirmPassword || loading}
        loading={loading}
        _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
      >
        {loading ? "Cadastrando..." : "Cadastrar"}
      </Button>
    </VStack>
  );
}