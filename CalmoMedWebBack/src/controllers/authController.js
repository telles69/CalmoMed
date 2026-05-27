require("dotenv").config()
const { createClient } = require("@supabase/supabase-js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { generateToken } = require("../utils/jwt")
const {
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require("../utils/nodemailer")

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const JWT_SECRET = process.env.JWT_SECRET
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Login com email e senha
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email e senha são obrigatórios" })
    }

    // Buscar usuário pelo email
    const { data: users, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .limit(1)

    if (error) throw error

    if (!users || users.length === 0) {
      return res.status(401).json({ message: "Email ou senha inválidos" })
    }

    const user = users[0]

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.log(`Falha de login para email: ${email} - senha incorreta`)
      return res.status(401).json({ message: "Email ou senha inválidos" })
    }

    // Gerar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Retornar dados do usuário (sem a senha)
    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      message: "Login realizado com sucesso",
      token,
      user: userWithoutPassword,
    })
  } catch (err) {
    console.error("Erro no login:", err)
    res
      .status(500)
      .json({ message: "Erro ao realizar login", error: err.message })
  }
}

// Registro de novo usuário
const register = async (req, res) => {
  try {
    const { name, email, password, cpf, role = "user" } = req.body

    // Validações
    if (!name || !email || !password || !cpf) {
      return res.status(400).json({
        message: "Nome, email, senha e CPF são obrigatórios",
      })
    }

    // Verificar se email já existe
    const { data: existingUsers, error: checkError } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)

    if (checkError) throw checkError

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ message: "Email já cadastrado" })
    }

    // Verificar se CPF já existe
    const { data: existingCpf, error: cpfError } = await supabase
      .from("profiles")
      .select("cpf")
      .eq("cpf", cpf)

    if (cpfError) throw cpfError

    if (existingCpf && existingCpf.length > 0) {
      return res.status(400).json({ message: "CPF já cadastrado" })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Inserir novo usuário
    const { data: newUser, error: insertError } = await supabase
      .from("profiles")
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          cpf,
          role,
        },
      ])
      .select()
      .single()

    if (insertError) throw insertError

    // Gerar token JWT
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    })

    // Retornar dados do usuário (sem a senha)
    const { password: _, ...userWithoutPassword } = newUser

    // Enviar email de boas-vindas (não bloqueante)
    sendWelcomeEmail(newUser.email, newUser.name).catch((err) => {
      console.error("Erro ao enviar email de boas-vindas:", err)
    })

    res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      token,
      user: userWithoutPassword,
    })
  } catch (err) {
    console.error("Erro no registro:", err)
    res
      .status(500)
      .json({ message: "Erro ao cadastrar usuário", error: err.message })
  }
}

// Obter dados do usuário autenticado
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id // Vem do middleware de autenticação

    const { data: user, error } = await supabase
      .from("profiles")
      .select("id, name, email, cpf, role, updated_at")
      .eq("id", userId)
      .single()

    if (error) throw error

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    res.status(200).json(user)
  } catch (err) {
    console.error("Erro ao buscar perfil:", err)
    res
      .status(500)
      .json({ message: "Erro ao buscar perfil", error: err.message })
  }
}

// Solicitar recuperação de senha (envia email com token JWT)
const forgotPassword = async (req, res) => {
  try {
    console.log("Iniciando processo de recuperação de senha...")
    const { email } = req.body
    console.log("Email recebido:", email)

    if (!email) {
      console.log("Email não fornecido")
      return res.status(400).json({ message: "Email é obrigatório" })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("Email inválido:", email)
      return res.status(400).json({ message: "Email inválido" })
    }

    // Buscar usuário pelo email
    console.log("Buscando usuário no banco de dados...")
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, name, email")
      .eq("email", email)
      .limit(1)

    if (error) {
      console.error("Erro ao buscar usuário:", error)
      throw error
    }

    console.log("Consulta ao banco executada. Resultados:", users?.length || 0)

    // Por segurança, sempre retornamos sucesso mesmo se o email não existir
    // Isso evita que atacantes descubram quais emails estão cadastrados
    if (!users || users.length === 0) {
      console.log(
        `Tentativa de recuperação para email não cadastrado: ${email}`,
      )
      return res.status(200).json({
        message:
          "Se o email existir na nossa base de dados, você receberá um link de recuperação em breve.",
      })
    }

    const user = users[0]

    // Gerar token JWT para recuperação de senha (válido por 1 hora)
    const resetToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        purpose: "password-reset",
      },
      JWT_SECRET,
      { expiresIn: "1h" },
    )

    // Enviar email com o link de recuperação
    console.log("Tentando enviar email de recuperação...")
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken)
      console.log(`Email enviado com sucesso para: ${email}`)
      console.log(`Processo de recuperação iniciado para: ${email}`)
      console.log(`Token JWT gerado (válido por 1 hora)`)
    } catch (emailError) {
      console.error("ERRO ao enviar email:", emailError)
      console.error("Stack trace:", emailError.stack)
      // Lançar o erro para que seja capturado no catch principal
      throw new Error(`Falha ao enviar email: ${emailError.message}`)
    }

    // Em desenvolvimento, sempre mostrar o token para facilitar testes
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
    const resetLink = `${frontendUrl}/Login?reset=${resetToken}`

    if (process.env.NODE_ENV !== "production") {
      console.log("\n=== TOKEN DE RECUPERAÇÃO (DESENVOLVIMENTO) ===")
      console.log(`Email: ${email}`)
      console.log(`Link completo: ${resetLink}`)
      console.log(`⏰ Válido por: 1 hora`)
      console.log("================================================\n")
    }

    res.status(200).json({
      message:
        "Se o email existir na nossa base de dados, você receberá um link de recuperação em breve.",
      // APENAS EM DESENVOLVIMENTO - retornar o link
      ...(process.env.NODE_ENV !== "production" && {
        dev_reset_link: resetLink,
        dev_token: resetToken,
      }),
    })
  } catch (err) {
    console.error("Erro ao solicitar recuperação:", err)
    res
      .status(500)
      .json({ message: "Erro ao processar solicitação", error: err.message })
  }
}

// Redefinir senha usando token JWT
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token e nova senha são obrigatórios" })
    }

    // Validar tamanho mínimo da senha
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "A senha deve ter no mínimo 6 caracteres" })
    }

    // Verificar e decodificar o token
    let decoded
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Link de recuperação expirado. Solicite um novo link.",
          expired: true,
        })
      }
      return res.status(401).json({
        message: "Link de recuperação inválido. Solicite um novo link.",
        invalid: true,
      })
    }

    // Verificar se o token é para recuperação de senha
    if (decoded.purpose !== "password-reset") {
      return res
        .status(401)
        .json({ message: "Token inválido para esta operação" })
    }

    // Buscar usuário para garantir que ainda existe
    const { data: users, error: userError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("id", decoded.userId)
      .eq("email", decoded.email)
      .limit(1)

    if (userError) throw userError

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    const user = users[0]

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Atualizar senha no banco
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .eq("email", user.email)

    if (updateError) throw updateError

    console.log(`Senha redefinida com sucesso para: ${user.email}`)

    res.status(200).json({
      message:
        "Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.",
      success: true,
    })
  } catch (err) {
    console.error("Erro ao redefinir senha:", err)
    res.status(500).json({
      message: "Erro ao redefinir senha",
      error:
        process.env.NODE_ENV !== "production"
          ? err.message
          : "Erro interno do servidor",
    })
  }
}

module.exports = { login, register, getProfile, forgotPassword, resetPassword }
