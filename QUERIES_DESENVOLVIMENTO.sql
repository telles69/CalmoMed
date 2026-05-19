-- ==========================================
-- QUERIES DE DESENVOLVIMENTO - CalmoMed
-- Queries úteis para testes e debugging
-- ==========================================

-- ==========================================
-- TESTES DE AUTENTICAÇÃO
-- ==========================================

-- 1. Simular login: buscar usuário pelo email
SELECT id, name, email, role, password FROM profiles 
WHERE email = 'joao@example.com';

-- 2. Contar quantos usuários têm um email específico (verificar unicidade)
SELECT COUNT(*) FROM profiles WHERE email = 'joao@example.com';

-- 3. Buscar todos os admins
SELECT id, name, email, role FROM profiles WHERE role = 'admin';

-- 4. Listar usuários ordenados por data de cadastro
SELECT name, email, updated_at FROM profiles 
ORDER BY COALESCE(updated_at, created_at) DESC;


-- ==========================================
-- TESTES DE POSTOS
-- ==========================================

-- 1. Listar todos os postos com informações básicas
SELECT id, name, contact FROM postos ORDER BY name;

-- 2. Verificar se um posto existe
SELECT EXISTS(SELECT 1 FROM postos WHERE name = 'Posto de Saúde Centro');

-- 3. Contar quantos postos têm um contato registrado
SELECT COUNT(*) as postos_com_contato FROM postos WHERE contact IS NOT NULL;

-- 4. Listar postos em ordem de ID (para debug)
SELECT id::text, name FROM postos ORDER BY id;


-- ==========================================
-- TESTES DE OCUPAÇÃO (DASHBOARD)
-- ==========================================

-- 1. Ocupação em tempo real (último relatório de cada posto)
SELECT 
  p.id::text,
  p.name,
  orep.people_count,
  orep.created_at,
  EXTRACT(HOUR FROM (NOW() - orep.created_at)) as horas_atras
FROM postos p
LEFT JOIN LATERAL (
  SELECT people_count, created_at FROM occupancy_reports 
  WHERE posto_id = p.id 
  ORDER BY created_at DESC 
  LIMIT 1
) orep ON TRUE
ORDER BY p.name;

-- 2. Ocupação média por hora (últimas 24 horas)
SELECT 
  DATE_TRUNC('hour', created_at) as hora,
  COUNT(*) as relatorios,
  ROUND(AVG(people_count)::numeric, 2) as ocupacao_media
FROM occupancy_reports
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hora DESC;

-- 3. Postos mais e menos ocupados agora
SELECT 
  p.name,
  MAX(orep.people_count) as ocupacao_atual,
  MAX(orep.created_at) as ultima_atualizacao
FROM postos p
LEFT JOIN occupancy_reports orep ON p.id = orep.posto_id
WHERE orep.created_at >= NOW() - INTERVAL '1 hour'
GROUP BY p.id, p.name
ORDER BY ocupacao_atual DESC;

-- 4. Histórico de ocupação de um posto específico (últimas 24h)
SELECT 
  created_at::text as data_hora,
  people_count,
  distance_to_posto
FROM occupancy_reports
WHERE posto_id = 1  -- Trocar pelo ID do posto desejado
AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;


-- ==========================================
-- TESTES DE RELATORIOS ESPECÍFICOS
-- ==========================================

-- 1. Gerar relatório diário de ocupação por posto
SELECT 
  DATE(orep.created_at) as data,
  p.name as posto,
  COUNT(*) as relatorios,
  ROUND(AVG(orep.people_count)::numeric, 2) as media_ocupacao,
  MIN(orep.people_count) as minimo,
  MAX(orep.people_count) as maximo
FROM occupancy_reports orep
LEFT JOIN postos p ON orep.posto_id = p.id
WHERE orep.created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(orep.created_at), p.id, p.name
ORDER BY data DESC, p.name;

-- 2. Picos de ocupação (quando teve mais gente)
SELECT 
  p.name as posto,
  orep.people_count,
  orep.created_at,
  ROW_NUMBER() OVER (PARTITION BY orep.posto_id ORDER BY orep.people_count DESC) as rank_ocupacao
FROM occupancy_reports orep
LEFT JOIN postos p ON orep.posto_id = p.id
WHERE orep.created_at >= NOW() - INTERVAL '7 days'
ORDER BY rank_ocupacao
LIMIT 20;

-- 3. Percentual de ocupação média por posto (considerando capacidade de 50 pessoas)
SELECT 
  p.name,
  COUNT(orep.id) as total_relatorios,
  ROUND(AVG(orep.people_count)::numeric, 2) as ocupacao_media,
  ROUND((AVG(orep.people_count) / 50 * 100)::numeric, 2) as percentual_capacidade
FROM postos p
LEFT JOIN occupancy_reports orep ON p.id = orep.posto_id
WHERE orep.created_at >= NOW() - INTERVAL '7 days'
GROUP BY p.id, p.name
ORDER BY percentual_capacidade DESC;


-- ==========================================
-- TESTES DE PERFORMANCE E INTEGRIDADE
-- ==========================================

-- 1. Tabelas com mais dados
SELECT 
  'profiles' as tabela,
  COUNT(*) as registros
FROM profiles
UNION ALL
SELECT 
  'postos' as tabela,
  COUNT(*) as registros
FROM postos
UNION ALL
SELECT 
  'occupancy_reports' as tabela,
  COUNT(*) as registros
FROM occupancy_reports
ORDER BY registros DESC;

-- 2. Verificar Foreign Keys (relatórios órfãos)
SELECT 
  orep.id::text,
  orep.posto_id::text,
  'ORFO' as status
FROM occupancy_reports orep
WHERE NOT EXISTS (SELECT 1 FROM postos p WHERE p.id = orep.posto_id)
LIMIT 10;

-- 3. Range de datas nos dados
SELECT 
  'occupancy_reports' as tabela,
  MIN(created_at) as data_mais_antiga,
  MAX(created_at) as data_mais_recente,
  COUNT(*) as total_registros
FROM occupancy_reports
UNION ALL
SELECT 
  'profiles' as tabela,
  MIN(updated_at) as data_mais_antiga,
  MAX(updated_at) as data_mais_recente,
  COUNT(*) as total_registros
FROM profiles;


-- ==========================================
-- QUERIES PARA DEBUG API
-- ==========================================

-- 1. Simular GET /api/postos (com ocupação)
SELECT 
  p.id::text,
  p.name,
  p.contact,
  json_build_object(
    'reportedQueue', COALESCE(orep.people_count, 0),
    'occupancyPercentage', COALESCE(ROUND((orep.people_count::float / 50 * 100)::numeric, 0), 0),
    'lastUpdate', orep.created_at::text,
    'distance_to_posto', orep.distance_to_posto
  ) as crowding_info
FROM postos p
LEFT JOIN LATERAL (
  SELECT people_count, created_at, distance_to_posto
  FROM occupancy_reports 
  WHERE posto_id = p.id 
  ORDER BY created_at DESC 
  LIMIT 1
) orep ON TRUE
ORDER BY p.name;

-- 2. Simular GET /api/occupancy-reports/:postoId
SELECT 
  id::text,
  posto_id::text,
  people_count,
  created_at::text,
  distance_to_posto
FROM occupancy_reports
WHERE posto_id = 1  -- Trocar pelo ID desejado
ORDER BY created_at DESC
LIMIT 100;

-- 3. Simular GET /api/occupancy-stats?period=day
SELECT 
  json_build_object(
    'period', DATE(orep.created_at)::text,
    'periodType', 'day',
    'averageOccupancy', ROUND(SUM(orep.people_count)::numeric, 0),
    'reportCount', COUNT(*)
  ) as stats
FROM occupancy_reports orep
WHERE orep.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(orep.created_at)
ORDER BY DATE(orep.created_at) DESC;


-- ==========================================
-- QUERIES PARA TESTING/QA
-- ==========================================

-- 1. Verificar validação de email (duplicadas)
SELECT email, COUNT(*) as vezes FROM profiles 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 2. Verificar validação de CPF (duplicados)
SELECT cpf, COUNT(*) as vezes FROM profiles 
GROUP BY cpf 
HAVING COUNT(*) > 1 AND cpf IS NOT NULL;

-- 3. Listar todos os roles existentes
SELECT DISTINCT role FROM profiles ORDER BY role;

-- 4. Gaps de dados - Postos sem relatórios
SELECT p.id::text, p.name FROM postos p
WHERE NOT EXISTS (
  SELECT 1 FROM occupancy_reports orep 
  WHERE orep.posto_id = p.id
);

-- 5. Relatórios muito antigos (mais de 30 dias)
SELECT 
  p.name,
  MAX(orep.created_at) as ultimo_relatorio,
  ROUND(EXTRACT(DAY FROM (NOW() - MAX(orep.created_at))))::int as dias_sem_relatorio
FROM occupancy_reports orep
JOIN postos p ON orep.posto_id = p.id
GROUP BY p.id, p.name
HAVING MAX(orep.created_at) < NOW() - INTERVAL '30 days'
ORDER BY dias_sem_relatorio DESC;

