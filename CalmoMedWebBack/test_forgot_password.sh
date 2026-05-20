#!/bin/bash

echo "🧪 Testando endpoint de recuperação de senha..."
echo ""

# Teste 1: Email válido
echo "📧 Teste 1: Enviando para bernardopegoraro63@gmail.com"
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"bernardopegoraro63@gmail.com"}' \
  -w "\n\n📊 Status Code: %{http_code}\n" \
  -s

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Teste 2: Email não cadastrado (deve retornar sucesso por segurança)
echo "📧 Teste 2: Email não cadastrado"
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"naoexiste@teste.com"}' \
  -w "\n\n📊 Status Code: %{http_code}\n" \
  -s

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Teste 3: Email inválido
echo "📧 Teste 3: Email inválido"
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"emailinvalido"}' \
  -w "\n\n📊 Status Code: %{http_code}\n" \
  -s

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Teste 4: Sem email
echo "📧 Teste 4: Sem email"
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\n\n📊 Status Code: %{http_code}\n" \
  -s

echo ""
echo "✅ Testes concluídos!"
