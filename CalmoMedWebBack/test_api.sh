#!/bin/bash

# Script de teste da API CalmoMed

echo "🧪 Testando API CalmoMed..."
echo ""

BASE_URL="http://localhost:3001"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Teste 1: Health Check
echo "📍 Teste 1: Verificando se o servidor está rodando..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/postos")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Servidor está rodando!${NC}"
else
    echo -e "${RED}❌ Servidor não está respondendo (HTTP $response)${NC}"
    exit 1
fi
echo ""

# Teste 2: Registro de usuário
echo "📍 Teste 2: Registrando novo usuário..."
TIMESTAMP=$(date +%s)
TEST_EMAIL="teste_$TIMESTAMP@example.com"
TEST_CPF="$TIMESTAMP"

register_response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Usuário Teste\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"senha123\",
    \"cpf\": \"$TEST_CPF\"
  }")

if echo "$register_response" | grep -q "token"; then
    echo -e "${GREEN}✅ Registro bem-sucedido!${NC}"
    TOKEN=$(echo "$register_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "🔑 Token JWT recebido"
else
    echo -e "${RED}❌ Falha no registro${NC}"
    echo "$register_response"
fi
echo ""

# Teste 3: Login
echo "📍 Teste 3: Fazendo login..."
login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"senha123\"
  }")

if echo "$login_response" | grep -q "token"; then
    echo -e "${GREEN}✅ Login bem-sucedido!${NC}"
    TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${RED}❌ Falha no login${NC}"
    echo "$login_response"
fi
echo ""

# Teste 4: Buscar perfil
echo "📍 Teste 4: Buscando perfil do usuário..."
profile_response=$(curl -s -X GET "$BASE_URL/api/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

if echo "$profile_response" | grep -q "email"; then
    echo -e "${GREEN}✅ Perfil recuperado com sucesso!${NC}"
else
    echo -e "${RED}❌ Falha ao buscar perfil${NC}"
    echo "$profile_response"
fi
echo ""

# Teste 5: Solicitar recuperação de senha
echo "📍 Teste 5: Solicitando recuperação de senha..."
forgot_response=$(curl -s -X POST "$BASE_URL/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\"
  }")

if echo "$forgot_response" | grep -q "dev_token"; then
    echo -e "${GREEN}✅ Token de recuperação gerado!${NC}"
    RESET_TOKEN=$(echo "$forgot_response" | grep -o '"dev_token":"[^"]*' | cut -d'"' -f4)
    echo "🔑 Token: ${RESET_TOKEN:0:50}..."
else
    echo -e "${YELLOW}⚠️  Resposta recebida (email pode não estar configurado)${NC}"
    echo "$forgot_response"
fi
echo ""

# Teste 6: Redefinir senha
if [ ! -z "$RESET_TOKEN" ]; then
    echo "📍 Teste 6: Redefinindo senha..."
    reset_response=$(curl -s -X POST "$BASE_URL/api/auth/reset-password" \
      -H "Content-Type: application/json" \
      -d "{
        \"token\": \"$RESET_TOKEN\",
        \"newPassword\": \"novaSenha123\"
      }")

    if echo "$reset_response" | grep -q "sucesso"; then
        echo -e "${GREEN}✅ Senha redefinida com sucesso!${NC}"
    else
        echo -e "${RED}❌ Falha ao redefinir senha${NC}"
        echo "$reset_response"
    fi
    echo ""

    # Teste 7: Login com nova senha
    echo "📍 Teste 7: Fazendo login com nova senha..."
    new_login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"novaSenha123\"
      }")

    if echo "$new_login_response" | grep -q "token"; then
        echo -e "${GREEN}✅ Login com nova senha bem-sucedido!${NC}"
    else
        echo -e "${RED}❌ Falha no login com nova senha${NC}"
        echo "$new_login_response"
    fi
    echo ""
fi

# Teste 8: Listar postos
echo "📍 Teste 8: Listando postos de saúde..."
postos_response=$(curl -s -X GET "$BASE_URL/api/postos")

if echo "$postos_response" | grep -q "name" || echo "$postos_response" | grep -q "\[\]"; then
    count=$(echo "$postos_response" | grep -o "\"id\"" | wc -l)
    echo -e "${GREEN}✅ Postos listados com sucesso!${NC}"
    echo "📊 Total de postos encontrados: $count"
else
    echo -e "${RED}❌ Falha ao listar postos${NC}"
    echo "$postos_response"
fi
echo ""

echo "========================================="
echo -e "${GREEN}✅ Todos os testes foram executados!${NC}"
echo "========================================="
echo ""
echo "📝 Notas:"
echo "- Se o email não estiver configurado, o sistema funcionará em modo simulação"
echo "- Tokens de recuperação serão exibidos no console do servidor"
echo "- Configure EMAIL_USER e EMAIL_PASSWORD no .env para emails reais"
echo ""
