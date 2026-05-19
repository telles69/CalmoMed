-- ==========================================
-- QUERIES DE INSERÇÃO - Dados de Teste
-- CalmoMed - Supabase PostgreSQL
-- ==========================================
-- Use estas queries para popular o banco com dados de teste

-- ==========================================
-- 1. INSERTAR USUÁRIOS DE TESTE
-- ==========================================

-- Insertar um usuário de teste
-- Nota: A senha abaixo é 'password123' hasheada com bcrypt (10 rounds)
INSERT INTO profiles (name, email, cpf, password, role) VALUES
('João Silva', 'joao@example.com', '12345678901', '$2a$10$O/h.gHiMu.jw/XhBBXqSKuY2CQqK9hC3RH5C8QKqR3kBKyWyG8jzS', 'admin'),
('Maria Santos', 'maria@example.com', '98765432109', '$2a$10$O/h.gHiMu.jw/XhBBXqSKuY2CQqK9hC3RH5C8QKqR3kBKyWyG8jzS', 'user'),
('Pedro Costa', 'pedro@example.com', '55555555555', '$2a$10$O/h.gHiMu.jw/XhBBXqSKuY2CQqK9hC3RH5C8QKqR3kBKyWyG8jzS', 'user');

-- ==========================================
-- 2. INSERTAR POSTOS DE TESTE
-- ==========================================

INSERT INTO postos (name, contact) VALUES
('Posto de Saúde Centro', '11 3333-1111'),
('Posto de Saúde Vila Nova', '11 3333-2222'),
('Posto de Saúde Jardins', '11 3333-3333'),
('Posto de Saúde Zona Leste', '11 3333-4444'),
('Posto de Saúde Zona Oeste', '11 3333-5555');

-- ==========================================
-- 3. INSERTAR RELATÓRIOS DE OCUPAÇÃO DE TESTE
-- ==========================================

-- Nota: Substitua os UUIDs reais dos postos se forem diferentes

-- Relatórios dos últimos 7 dias (muitos dados para análise)
INSERT INTO occupancy_reports (posto_id, people_count, distance_to_posto) VALUES
-- Dia 1 - Centro
(1, 15, 0.5),
(1, 18, 0.6),
(1, 22, 0.7),
(1, 25, 0.8),
(1, 28, 0.9),
(1, 30, 1.0),
(1, 32, 1.1),
(1, 35, 1.2),
(1, 38, 1.3),
(1, 40, 1.4),
(1, 38, 1.3),
(1, 35, 1.2),
(1, 30, 1.0),
(1, 25, 0.8),
(1, 20, 0.6),
(1, 15, 0.5),

-- Dia 2 - Vila Nova
(2, 10, 0.3),
(2, 12, 0.4),
(2, 15, 0.5),
(2, 18, 0.6),
(2, 22, 0.7),
(2, 25, 0.8),
(2, 28, 0.9),
(2, 30, 1.0),
(2, 28, 0.9),
(2, 25, 0.8),
(2, 22, 0.7),
(2, 18, 0.6),
(2, 15, 0.5),
(2, 12, 0.4),

-- Dia 3 - Jardins
(3, 20, 0.4),
(3, 22, 0.5),
(3, 25, 0.6),
(3, 28, 0.7),
(3, 32, 0.8),
(3, 35, 0.9),
(3, 38, 1.0),
(3, 40, 1.1),
(3, 42, 1.2),
(3, 40, 1.1),
(3, 38, 1.0),
(3, 35, 0.9),
(3, 32, 0.8),
(3, 28, 0.7),
(3, 25, 0.6),

-- Dia 4 - Zona Leste
(4, 8, 0.2),
(4, 10, 0.3),
(4, 12, 0.4),
(4, 15, 0.5),
(4, 18, 0.6),
(4, 20, 0.7),
(4, 22, 0.8),
(4, 24, 0.9),
(4, 22, 0.8),
(4, 20, 0.7),
(4, 18, 0.6),
(4, 15, 0.5),
(4, 12, 0.4),

-- Dia 5 - Zona Oeste
(5, 12, 0.35),
(5, 14, 0.45),
(5, 17, 0.55),
(5, 20, 0.65),
(5, 23, 0.75),
(5, 26, 0.85),
(5, 29, 0.95),
(5, 31, 1.05),
(5, 29, 0.95),
(5, 26, 0.85),
(5, 23, 0.75),
(5, 20, 0.65),
(5, 17, 0.55),
(5, 14, 0.45);

-- ==========================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ==========================================

-- Ver quantos usuários foram inseridos
SELECT COUNT(*) as total_usuarios FROM profiles;

-- Ver quantos postos foram inseridos
SELECT COUNT(*) as total_postos FROM postos;

-- Ver quantos relatórios foram inseridos
SELECT COUNT(*) as total_relatorios FROM occupancy_reports;

-- Ver ocupação média por posto
SELECT 
  p.name,
  COUNT(or.id) as relatorios,
  ROUND(AVG(or.people_count)::numeric, 2) as ocupacao_media
FROM postos p
LEFT JOIN occupancy_reports or ON p.id = or.posto_id
GROUP BY p.id, p.name
ORDER BY ocupacao_media DESC;

