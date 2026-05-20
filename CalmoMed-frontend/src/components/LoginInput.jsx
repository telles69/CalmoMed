'use client';
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Input,
  Button,
  Stack,
  Text,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginInput({ onLogin }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const { login } = useAuth();
  const searchParams = useSearchParams();

  // Verificar se há um token de reset na URL
  useEffect(() => {
    const tokenFromUrl = searchParams?.get('reset');
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setIsResetMode(true);
      setDialogOpen(true);
      toaster.create({
        title: "Link de recuperação detectado",
        description: "Digite sua nova senha para completar a recuperação.",
        type: "info",
      });
    }
  }, [searchParams]);

  const applyChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const applyLogin = async () => {
    const { email, password } = formData;
    if (!email || !password) {
      toaster.create({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios!",
        type: "error",
      });

      
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toaster.create({
        title: "Sucesso",
        description: "Login realizado com sucesso!",
        type: "success",
      });
      onLogin(formData);
    } catch (error) {
      toaster.create({
        title: "Erro",
        description: error.message || "Email ou senha inválidos!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendRecoverEmail = async () => {
    if (!recoverEmail) {
      toaster.create({
        title: "Erro",
        description: "Digite seu e-mail para recuperar a senha.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const { authService } = await import('@/services/api');
      const response = await authService.forgotPassword(recoverEmail);
      
        // Modo produção - email foi enviado
        toaster.create({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada. O link é válido por 1 hora.",
          type: "success",
          duration: 6000
        });
        
        // Fechar o modal após enviar o email
        setDialogOpen(false);
      
      
      setRecoverEmail("");
    } catch (error) {
      toaster.create({
        title: "Erro",
        description: error.message || "Erro ao enviar email de recuperação.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword) {
      toaster.create({
        title: "Erro",
        description: "Digite sua nova senha.",
        type: "error",
      });
      return;
    }

    if (newPassword.length < 6) {
      toaster.create({
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres.",
        type: "error",
      });
      return;
    }

    if (!resetToken) {
      toaster.create({
        title: "Erro",
        description: "Token de recuperação não encontrado. Solicite um novo link.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const { authService } = await import('@/services/api');
      await authService.resetPassword(resetToken, newPassword);
      
      toaster.create({
        title: "Sucesso!",
        description: "Senha alterada com sucesso! Faça login com sua nova senha.",
        type: "success",
      });
      
      // Limpar estado e fechar modal
      setResetToken("");
      setNewPassword("");
      setIsResetMode(false);
      setDialogOpen(false);
      
      // Limpar URL
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', '/Login');
      }
    } catch (error) {
      toaster.create({
        title: "Erro",
        description: error.message || (error.expired ? "Link expirado. Solicite um novo." : "Erro ao alterar senha."),
        type: "error",
      });
      
      // Se o token expirou, limpar e voltar ao modo de solicitação
      if (error.expired || error.invalid) {
        setResetToken("");
        setIsResetMode(false);
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/Login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const openDialog = () => {
    setRecoverEmail("");
    setNewPassword("");
    setIsResetMode(false);
    setDialogOpen(true);
  };

  return (
    <>
      <Stack spacing={4}>
        <Input
          name="email"
          placeholder="E-mail"
          onChange={applyChange}
          onKeyPress={(e) => e.key === 'Enter' && applyLogin()}
          borderColor="white"
          color="white"
          _placeholder={{ color: "white" }}
        />
        <Input
          name="password"
          type="password"
          placeholder="Senha"
          onChange={applyChange}
          onKeyPress={(e) => e.key === 'Enter' && applyLogin()}
          borderColor="white"
          color="white"
          _placeholder={{ color: "white" }}
        />
        <Button
          color={"teal.300"}
          variant="link"
          onClick={openDialog}
        >
          Esqueci minha senha
        </Button>
        <Button 
          onClick={applyLogin} 
          colorScheme="blue"
          loading={loading}
          disabled={loading}
          
        >
          
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </Stack>

      <Dialog.Root open={dialogOpen} onOpenChange={(e) => {
        setDialogOpen(e.open);
        if (!e.open) {
          // Ao fechar, limpar o modo de reset se não houver token válido
          if (!resetToken) {
            setIsResetMode(false);
          }
        }
      }}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              style={{
                background: "white",
                borderRadius: 8,
                padding: 24,
                minWidth: 400,
                maxWidth: 500,
                position: "fixed",
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 1300,
                
              }} >
              <Dialog.Header>
                <Dialog.Title style={{ color: "#258f78ff", fontWeight: "bold", fontSize: "20px" }}>
                  {isResetMode ? " Redefinir Senha" : " Recuperar Senha"}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text mb={4} style={{ color: "#000000ff", fontSize: "15px" }}>
                  {isResetMode
                    ? "Digite sua nova senha para completar a recuperação."
                    : "Digite seu e-mail para receber o link de recuperação."}
                </Text>
                <Stack spacing={3}>
                  {isResetMode ? (
                    <>
                      <Input
                        placeholder="Nova senha (mínimo 6 caracteres)"
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        borderColor="#667eea"
                        _focus={{ borderColor: "#667eea", boxShadow: "0 0 0 1px #667eea" }}
                        size="lg"
                      />
                      <Button 
                        colorScheme="purple" 
                        onClick={changePassword}
                        loading={loading}
                        disabled={loading || !newPassword}
                        size="lg"
                      >
                        {loading ? "Alterando..." : "Alterar Senha"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        placeholder="Digite seu e-mail"
                        type="email"
                        value={recoverEmail}
                        onChange={e => setRecoverEmail(e.target.value)}
                        borderColor="#000000ff"
                        _focus={{ borderColor: "#000000ff", boxShadow: "0 0 0 1px #667eea" }}
                        size="lg"
                      />
                      <Button 
                        colorScheme="purple" 
                        onClick={sendRecoverEmail}
                        loading={loading}
                        disabled={loading || !recoverEmail}
                        size="lg"
                      >
                        {loading ? "Enviando..." : "Enviar Link"}
                      </Button>
                    </>
                  )}
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setDialogOpen(false);
                    if (isResetMode && typeof window !== 'undefined') {
                      window.history.replaceState({}, '', '/Login');
                      setResetToken("");
                      setIsResetMode(false);
                    }
                  }} 
                  color="gray.600"
                >
                  Cancelar
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
