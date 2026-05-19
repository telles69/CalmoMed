-- ==========================================
-- QUERIES DE TESTE - CalmoMed
-- Banco de Dados: Supabase PostgreSQL
-- ==========================================

-- ==========================================
-- 1. QUERIES NA TABELA PROFILES (USUÁRIOS)
-- ==========================================

-- Listar todos os usuários
SELECT id, name, email, cpf, role, updated_at FROM profiles;

-- Buscar usuário por email
SELECT * FROM profiles WHERE email = 'user@example.com';

-- Buscar usuário por CPF
SELECT * FROM profiles WHERE cpf = '12345678900';

-- Contar total de usuários por role (tipo de usuário)
SELECT role, COUNT(*) as total_usuarios FROM profiles GROUP BY role;

-- Listar todos os usuários com role 'admin'
SELECT id, name, email FROM profiles WHERE role = 'admin';

-- Buscar usuários cadastrados nos últimos 7 dias
SELECT id, name, email, updated_at FROM profiles 
WHERE updated_at >= NOW() - INTERVAL '7 days'
ORDER BY updated_at DESC;

-- Verificar se um email existe
SELECT EXISTS(SELECT 1 FROM profiles WHERE email = 'novo@example.com');


-- ==========================================
-- 2. QUERIES NA TABELA POSTOS (POSTOS DE SAÚDE)
-- ==========================================

-- Listar todos os postos
SELECT * FROM postos;

-- Buscar posto por ID
SELECT * FROM postos WHERE id = 1;

-- Listar postos com ordenação por nome
SELECT id, name, contact FROM postos ORDER BY name ASC;

-- Contar total de postos cadastrados
SELECT COUNT(*) as total_postos FROM postos;

-- Buscar postos criados nos últimos 30 dias
SELECT * FROM postos WHERE created_at >= NOW() - INTERVAL '30 days';

-- Listar postos com informações de localização
SELECT id, name, contact FROM postos WHERE name IS NOT NULL;


-- ==========================================
-- 3. QUERIES NA TABELA OCCUPANCY_REPORTS (RELATÓRIOS DE OCUPAÇÃO)
-- ==========================================

-- Listar todos os relatórios de ocupação
SELECT * FROM occupancy_reports;

-- Buscar relatórios de um posto específico
SELECT * FROM occupancy_reports WHERE posto_id = 1 ORDER BY created_at DESC;

-- Contar total de relatórios
SELECT COUNT(*) as total_relatorios FROM occupancy_reports;

-- Buscar relatórios dos últimos 24 horas
SELECT * FROM occupancy_reports 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Ocupação média por posto nos últimos 7 dias
SELECT 
  posto_id,
  COUNT(*) as total_relatorios,
  ROUND(AVG(people_count)::numeric, 2) as ocupacao_media,
  MAX(people_count) as ocupacao_maxima,
  MIN(people_count) as ocupacao_minima
FROM occupancy_reports
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY posto_id
ORDER BY ocupacao_media DESC;

-- Relatórios mais recentes (últimas 10)
SELECT * FROM occupancy_reports 
ORDER BY created_at DESC 
LIMIT 10;

-- Ocupação por hora (agrupado por hora)
SELECT 
  DATE_TRUNC('hour', created_at) as hora,
  COUNT(*) as relatorios,
  ROUND(AVG(people_count)::numeric, 2) as ocupacao_media
FROM occupancy_reports
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hora DESC;


-- ==========================================
-- 4. QUERIES COM JOIN (RELACIONAMENTOS)
-- ==========================================

-- Listar postos com seu relatório de ocupação mais recente
SELECT 
  p.id,
  p.name,
  p.contact,
  orep.people_count,
  orep.created_at,
  orep.distance_to_posto
FROM postos p
LEFT JOIN occupancy_reports orep ON p.id = orep.posto_id
WHERE orep.created_at = (
  SELECT MAX(created_at) 
  FROM occupancy_reports 
  WHERE posto_id = p.id
)
ORDER BY p.name;

-- Postos com estatísticas completas
SELECT 
  p.id,
  p.name,
  COUNT(orep.id) as total_relatorios,
  ROUND(AVG(orep.people_count)::numeric, 2) as ocupacao_media,
  MAX(orep.people_count) as pico_ocupacao,
  MAX(orep.created_at) as ultimo_relatorio
FROM postos p
LEFT JOIN occupancy_reports orep ON p.id = orep.posto_id
GROUP BY p.id, p.name
ORDER BY ocupacao_media DESC;

-- Buscar postos e seus relatórios recentes (últimos 7 dias)
SELECT 
  p.name as nome_posto,
  COUNT(orep.id) as relatorios_7_dias,
  ROUND(AVG(orep.people_count)::numeric, 2) as ocupacao_media_7_dias
FROM postos p
LEFT JOIN occupancy_reports orep ON p.id = orep.posto_id
WHERE orep.created_at >= NOW() - INTERVAL '7 days'
GROUP BY p.id, p.name
ORDER BY ocupacao_media_7_dias DESC;


-- ==========================================
-- 5. QUERIES ANALÍTICAS
-- ==========================================

-- Dia com maior ocupação
SELECT 
  DATE(created_at) as data,
  COUNT(*) as relatorios,
  ROUND(AVG(people_count)::numeric, 2) as ocupacao_media,
  MAX(people_count) as pico
FROM occupancy_reports
GROUP BY DATE(created_at)
ORDER BY ocupacao_media DESC
LIMIT 5;

-- Hora do dia com maior ocupação (média)
SELECT 
  EXTRACT(HOUR FROM created_at) as hora_dia,
  COUNT(*) as relatorios,
  ROUND(AVG(people_count)::numeric, 2) as ocupacao_media
FROM occupancy_reports
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY ocupacao_media DESC;

-- Postos com maior variação de ocupação nos últimos 7 dias
SELECT 
  posto_id,
  COUNT(*) as relatorios,
  ROUND(AVG(people_count)::numeric, 2) as media,
  MAX(people_count) - MIN(people_count) as variacao
FROM occupancy_reports
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY posto_id
HAVING COUNT(*) > 0
ORDER BY variacao DESC;

-- Tendência de ocupação (últimos 30 dias)
SELECT 
  DATE_TRUNC('day', created_at) as dia,
  COUNT(*) as relatorios,
  ROUND(AVG(people_count)::numeric, 2) as ocupacao_media
FROM occupancy_reports
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY dia ASC;


-- ==========================================
-- 6. QUERIES DE LIMPEZA/MANUTENÇÃO
-- ==========================================

-- Contar registros duplicados na tabela occupancy_reports
SELECT 
  posto_id, 
  created_at,
  COUNT(*) as duplicatas
FROM occupancy_reports
GROUP BY posto_id, created_at
HAVING COUNT(*) > 1;

-- Encontrar relatórios antigos (mais de 1 ano)
SELECT COUNT(*) as relatorios_antigos FROM occupancy_reports
WHERE created_at < NOW() - INTERVAL '1 year';

-- Deletar relatórios com mais de 1 ano (CUIDADO - DESCOMENTAR COM CAUTELA)
-- DELETE FROM occupancy_reports WHERE created_at < NOW() - INTERVAL '1 year';


-- ==========================================
-- 7. QUERIES PARA DEBUG/VERIFICAÇÃO
-- ==========================================

-- Verificar integridade referencial: relatórios órfãos
SELECT or.id, or.posto_id 
FROM occupancy_reports or
LEFT JOIN postos p ON or.posto_id = p.id
WHERE p.id IS NULL;

-- Últimas ações por usuário (se houver tabela de logs ou auditoria)
-- SELECT user_id, action, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 20;

-- Estatísticas gerais do banco
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_usuarios,
  (SELECT COUNT(*) FROM postos) as total_postos,
  (SELECT COUNT(*) FROM occupancy_reports) as total_relatorios,
  (SELECT COUNT(DISTINCT posto_id) FROM occupancy_reports) as postos_com_relatorios;

-- Verificar tabelas e suas informações
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

