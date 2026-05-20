require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Configuração do transportador de email usando NodeMailer
 * Para produção, configure as credenciais no arquivo .env:
 * - EMAIL_USER: seu email (ex: seuemail@gmail.com)
 * - EMAIL_PASSWORD: senha de aplicativo do Gmail
 * * Para gerar senha de aplicativo do Gmail:
 * 1. Acesse: https://myaccount.google.com/apppasswords
 * 2. Selecione "Aplicativo": Outro (nome personalizado)
 * 3. Digite "CalmoMed API" e clique em Gerar
 * 4. Copie a senha gerada (16 caracteres) e adicione no .env
 */
const createTransporter = () => {
  // Verificar se as credenciais estão configuradas
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('AVISO: Credenciais de email não configuradas no .env');
  console.warn('O servidor continuará funcionando, mas emails NÃO serão enviados');
  console.warn('Configure EMAIL_USER e EMAIL_PASSWORD no .env para ativar emails');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      pool: true,
      maxConnections: 1,
      rateDelta: 1000,
      rateLimit: 5,
      connectionTimeout: 5000,
      greetingTimeout: 3000
    });

    transporter.verify()
      .then(() => {
  console.log('Servidor de email conectado e pronto para enviar mensagens');
      })
      .catch((error) => {
  console.warn('Aviso: Não foi possível conectar ao servidor de email');
  console.warn('Emails NÃO serão enviados até corrigir as configurações');
  console.warn('Verifique: EMAIL_USER e EMAIL_PASSWORD no .env');
        if (process.env.NODE_ENV === 'development') {
          console.warn('Erro detalhado:', error.message);
        }
      });

    return transporter;
  } catch (error) {
  console.error('Erro ao criar transportador de email:', error.message);
    return null;
  }
};

const transporter = createTransporter();

/**
 * Envia email de recuperação de senha com token JWT
 * @param {string} toEmail - Email do destinatário
 * @param {string} userName - Nome do usuário
 * @param {string} resetToken - Token JWT para recuperação
 * @returns {Promise<boolean>} - True se enviado com sucesso
 */
const sendPasswordResetEmail = async (toEmail, userName, resetToken) => {
  if (!transporter) {
  console.warn('Email não configurado - modo simulação ativado');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/Login?reset=${resetToken}`;
    
  console.log('\n=== EMAIL SIMULADO (Configuração Pendente) ===');
    console.log(`Para: ${toEmail}`);
    console.log(`Nome: ${userName}`);
    console.log(`Link de recuperação: ${resetLink}`);
    console.log('===============================================\n');
    
    return true;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/Login?reset=${resetToken}`;

  const mailOptions = {
    from: {
      name: 'CalmoMed - Sistema de Saúde',
      address: process.env.EMAIL_USER
    },
    to: toEmail,
    subject: ' Recuperação de Senha - CalmoMed',
    
    // Versão HTML atualizada com cores sólidas e link do Supabase
    html: `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          /* --- COR SÓLIDA (SEM GRADIENTE) --- */
          background: #2C7CC8; /* Azul do logo */
          color: white;
          padding: 30px 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #333;
          margin-bottom: 20px;
        }
        .message {
          color: #555;
          margin-bottom: 30px;
          font-size: 16px;
        }
        .button-container {
          text-align: center;
          margin: 35px 0;
        }
        .reset-button {
          display: inline-block;
          /* --- COR SÓLIDA (SEM GRADIENTE) --- */
          background: #4FCEA9; /* Verde do logo */
          color: white !important;
          text-decoration: none;
          padding: 16px 40px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          transition: transform 0.2s;
          /* Sombra ajustada para o tom de verde */
          box-shadow: 0 4px 12px rgba(79, 206, 169, 0.5);
        }
        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(79, 206, 169, 0.6);
        }
        .warning-box {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 20px;
          margin: 30px 0;
          border-radius: 4px;
        }
        .warning-box h3 {
          color: #856404;
          font-size: 16px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
        }
        .warning-box ul {
          color: #856404;
          margin-left: 20px;
          font-size: 14px;
        }
        .warning-box li {
          margin: 8px 0;
        }
        .alternative-link {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
          word-break: break-all;
        }
        .alternative-link p {
          color: #666;
          font-size: 13px;
          margin-bottom: 10px;
        }
        .alternative-link a {
          color: #2C7CC8; /* Azul do logo */
          font-size: 12px;
          text-decoration: none;
        }
        .footer {
          background: #f8f9fa;
          padding: 25px 30px;
          text-align: center;
          border-top: 1px solid #e9ecef;
        }
        .footer p {
          color: #6c757d;
          font-size: 13px;
          margin: 5px 0;
        }
        .footer-logo {
          color: #2C7CC8; /* Azul do logo */
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
        
          <img 
            src="https://xwcyarzovlpdcalbjiza.supabase.co/storage/v1/object/public/images/logo-.png" 
            alt="Logo CalmoMed" 
            style="width: 90px; height: 90px; border-radius: 50%; margin-bottom: 20px; border: 3px solid rgba(255,255,255,0.3);">
          
          <h1> Recuperação de Senha</h1>
          <p style="opacity: 0.9; font-size: 14px; margin-top: 10px;">CalmoMed - Sistema de Gerenciamento de Postos de Saúde</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            Olá, <strong>${userName}</strong>! 
          </div>
          
          <div class="message">
            <p style="margin-bottom: 15px;">
              Você solicitou a recuperação de senha da sua conta CalmoMed.
            </p>
            <p>
              Clique no botão abaixo para criar uma nova senha de forma segura:
            </p>
          </div>
          
          <div class="button-container">
            <a href="${resetLink}" class="reset-button">
              Redefinir Senha
            </a>
          </div>
          
          <div class="warning-box">
            <h3>Informações Importantes</h3>
            <ul>
              <li>Este link é válido por <strong>1 hora</strong></li>
              <li>Pode ser usado apenas <strong>uma vez</strong></li>
              <li>Não compartilhe este link com ninguém</li>
              <li>Se você não solicitou esta recuperação, ignore este email</li>
            </ul>
          </div>
          
          <div class="alternative-link">
            <p><strong>Não consegue clicar no botão?</strong></p>
            <p>Copie e cole o link abaixo no seu navegador:</p>
            <a href="${resetLink}">${resetLink}</a>
          </div>
          
          <div class="message" style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #e9ecef;">
            <p style="font-size: 14px; color: #666;">
              Se você tiver alguma dúvida ou precisar de ajuda, entre em contato com nosso suporte.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-logo">CalmoMed</div>
          <p>© ${new Date().getFullYear()} CalmoMed - Todos os direitos reservados</p>
          <p style="margin-top: 10px;">Este é um email automático, não responda.</p>
        </div>
      </div>
    </body>
    </html>
    `,
  
    // Versão texto puro (fallback)
    text: `
Recuperação de Senha - CalmoMed

Olá, ${userName}!

Você solicitou a recuperação de senha da sua conta CalmoMed.

Acesse o link abaixo para redefinir sua senha:
${resetLink}

IMPORTANTE:
- Este link é válido por 1 hora
- Pode ser usado apenas uma vez
- Não compartilhe este link com ninguém
- Se você não solicitou esta recuperação, ignore este email

© ${new Date().getFullYear()} CalmoMed - Sistema de Gerenciamento de Postos de Saúde
Este é um email automático, não responda.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(` Email de recuperação enviado para: ${toEmail}`);
    console.log(` Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(' Erro ao enviar email:', error);
    throw new Error(`Falha ao enviar email: ${error.message}`);
  }
};

/**
 * Envia email de boas-vindas após registro (opcional)
 * @param {string} toEmail - Email do destinatário
 * @param {string} userName - Nome do usuário
 * @returns {Promise<boolean>} - True se enviado com sucesso
 */
const sendWelcomeEmail = async (toEmail, userName) => {
  if (!transporter) {
  console.log('Email de boas-vindas simulado para:', toEmail);
    return false;
  }

  const mailOptions = {
    from: {
      name: 'CalmoMed - Sistema de Saúde',
      address: process.env.EMAIL_USER
    },
    to: toEmail,
  subject: 'Bem-vindo ao CalmoMed!',
    // MANTIDO O GRADIENTE NO EMAIL DE BOAS-VINDAS, POIS O PEDIDO FOI SÓ PARA O DE RECUPERAÇÃO
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo ao CalmoMed!</h1>
          </div>
          <div class="content">
            <p>Olá, <strong>${userName}</strong>!</p>
            <p>Sua conta foi criada com sucesso. Agora você pode:</p>
            <ul>
              <li>Visualizar postos de saúde próximos</li>
              <li>Verificar taxa de ocupação em tempo real</li>
              <li>📍 Encontrar o melhor posto para sua necessidade</li>
              <li>⏰ Consultar horários de funcionamento</li>
            </ul>
            <p style="margin-top: 20px;">Obrigado por fazer parte do CalmoMed!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} CalmoMed - Sistema de Gerenciamento de Postos de Saúde</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Bem-vindo ao CalmoMed, ${userName}!\n\nSua conta foi criada com sucesso.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de boas-vindas enviado para: ${toEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email de boas-vindas:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail
};