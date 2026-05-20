#!/usr/bin/env node

/**
 * Script de teste para verificar se o nodemailer está funcionando
 * Execute: node test_email.js
 */

require('dotenv').config();
const { sendPasswordResetEmail } = require('./src/utils/nodemailer');

const testEmail = async () => {
  console.log('\n=== TESTE DE EMAIL NODEMAILER ===\n');

  // Verificar configurações
  console.log('Verificando configurações do .env...\n');
  
  if (!process.env.EMAIL_USER) {
  console.error('EMAIL_USER não configurado no .env');
    process.exit(1);
  }
  
  if (!process.env.EMAIL_PASSWORD) {
  console.error('EMAIL_PASSWORD não configurado no .env');
    process.exit(1);
  }
  
  if (process.env.EMAIL_PASSWORD === 'COLE_AQUI_A_SENHA_DE_APP_GERADA') {
  console.error('EMAIL_PASSWORD ainda não foi configurado!');
  console.error('Acesse: https://myaccount.google.com/apppasswords');
  console.error('Gere uma senha de app e cole no arquivo .env');
    process.exit(1);
  }

  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD: ********** (configurado)\n');

  // Email de teste
  const testEmailAddress = process.env.EMAIL_USER; // Envia para o próprio email
  const testUserName = 'Teste CalmoMed';
  const testToken = 'TOKEN_DE_TESTE_123456789';

  console.log('Enviando email de teste para:', testEmailAddress);
  console.log('⏳ Aguarde...\n');

  try {
    await sendPasswordResetEmail(testEmailAddress, testUserName, testToken);
    
  console.log('\n============================================');
  console.log('EMAIL ENVIADO COM SUCESSO!');
  console.log('============================================\n');
  console.log('Verifique sua caixa de entrada em:');
    console.log(`   ${testEmailAddress}\n`);
  console.log('Se não receber em alguns minutos:');
    console.log('   1. Verifique a pasta de SPAM');
    console.log('   2. Aguarde até 2 minutos');
    console.log('   3. Verifique se a senha de app está correta\n');
    
    process.exit(0);
  } catch (error) {
  console.error('\n============================================');
  console.error('ERRO AO ENVIAR EMAIL!');
  console.error('============================================\n');
  console.error('Detalhes do erro:', error.message);
  console.error('\nPossíveis soluções:\n');
    
    if (error.message.includes('Invalid login')) {
      console.error('   1. Você está usando uma SENHA DE APP (não sua senha normal)?');
      console.error('   2. A senha de app está correta no .env?');
      console.error('   3. Não há espaços na senha?');
      console.error('   4. A verificação em 2 etapas está ativada no Gmail?\n');
  console.error('   Gere uma nova senha: https://myaccount.google.com/apppasswords\n');
    } else if (error.message.includes('ECONNECTION') || error.message.includes('ETIMEDOUT')) {
      console.error('   1. Verifique sua conexão com a internet');
      console.error('   2. Verifique se o firewall não está bloqueando');
      console.error('   3. Tente novamente em alguns segundos\n');
    } else {
      console.error('   1. Verifique se o EMAIL_USER está correto');
      console.error('   2. Verifique se o EMAIL_PASSWORD está correto');
      console.error('   3. Tente gerar uma nova senha de app\n');
    }
    
    process.exit(1);
  }
};

// Executar teste
testEmail();
