# Queries de Teste - CalmoMed

## 📋 Visão Geral

Este documento contém um conjunto completo de queries SQL para testar e explorar o banco de dados PostgreSQL do CalmoMed (hospedado no Supabase).

## 🗂️ Estrutura das Tabelas

### 1. **profiles** (Usuários)
- `id` - UUID único do usuário
- `name` - Nome completo
- `email` - Email único
- `password` - Senha hasheada (bcrypt)
- `cpf` - CPF único
- `role` - Tipo de usuário (admin, user, etc)
- `updated_at` - Última atualização

### 2. **postos** (Postos de Saúde)
- `id` - UUID único do posto
- `name` - Nome do posto
- `contact` - Telefone de contato
- `created_at` - Data de criação
- Possivelmente: latitude, longitude, endereço, descrição

### 3. **occupancy_reports** (Relatórios de Ocupação)
- `id` - UUID único do relatório
- `posto_id` - FK para postos
- `people_count` - Número de pessoas
- `distance_to_posto` - Distância até o posto
- `created_at` - Data/hora do relatório

---

## 🚀 Como Usar as Queries

### Opção 1: Supabase SQL Editor
1. Acesse o dashboard do Supabase
2. Vá para **SQL Editor**
3. Copie e cole as queries deste arquivo
4. Clique em **Execute** (ou `Ctrl+Enter`)

### Opção 2: psql (linha de comando)
```bash
# Conectar ao banco
psql -h [host] -U [user] -d [database]

# Colar as queries
\i QUERIES_TESTE.sql
```

### Opção 3: DBeaver ou similar
1. Copie as queries
2. Cole na aba SQL
3. Execute com `Ctrl+Enter`

---

## 📊 Categorias de Queries

### 1️⃣ Queries na Tabela `profiles`
Para explorar dados de usuários:
- Listar todos os usuários
- Buscar por email ou CPF
- Estatísticas por role
- Usuários recentes

### 2️⃣ Queries na Tabela `postos`
Para explorar postos de saúde:
- Listar todos os postos
- Buscar por ID
- Contar postos cadastrados
- Postos recentes

### 3️⃣ Queries na Tabela `occupancy_reports`
Para explorar relatórios de ocupação:
- Ocupação por posto
- Histórico temporal (24h, 7 dias, etc)
- Picos de ocupação
- Médias e variações

### 4️⃣ Queries com JOIN
Para análises cruzadas:
- Postos com último relatório
- Estatísticas completas por posto
- Tendências de ocupação por período

### 5️⃣ Queries Analíticas
Para insights e business intelligence:
- Dias com maior ocupação
- Padrões por hora do dia
- Variação de ocupação
- Tendências

### 6️⃣ Queries de Manutenção
Para limpeza e verificação:
- Detectar duplicatas
- Registros antigos
- Integridade referencial

---

## 💡 Exemplos Práticos

### Exemplo 1: Qual é a ocupação média de cada posto nos últimos 7 dias?
```sql
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
```

### Exemplo 2: Qual é a hora do dia com maior ocupação em média?
```sql
SELECT 
  EXTRACT(HOUR FROM created_at) as hora_dia,
  COUNT(*) as relatorios,
  ROUND(AVG(people_count)::numeric, 2) as ocupacao_media
FROM occupancy_reports
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY ocupacao_media DESC;
```

### Exemplo 3: Listar postos com seu relatório mais recente
```sql
    SELECT 
    p.id,
    p.name,
    p.contact,
    or.people_count,
    or.created_at
    FROM postos p
    LEFT JOIN occupancy_reports or ON p.id = or.posto_id
    WHERE or.created_at = (
    SELECT MAX(created_at) 
    FROM occupancy_reports 
    WHERE posto_id = p.id
    )
    ORDER BY p.name;
```

---

## ⚠️ Cuidados Importantes

1. **Delete com CUIDADO**: As queries de DELETE estão comentadas. Descomente apenas se tem certeza!
   ```sql
   -- DELETE FROM occupancy_reports WHERE created_at < NOW() - INTERVAL '1 year';
   ```

2. **Backups**: Antes de fazer limpeza de dados, faça backup!

3. **Permissões**: Certifique-se de ter permissão para executar estas queries

4. **Performance**: Com muitos dados, queries não otimizadas podem ser lentas. Use LIMIT!

---

## 🔍 Debugging e Troubleshooting

### Problema: "Column not found"
- Verifique o nome exato da coluna (case-sensitive em PostgreSQL)
- Use `SELECT * FROM [tabela] LIMIT 1;` para ver todas as colunas

### Problema: "Table not found"
- Verifique se está conectado ao banco correto
- Alguns nomes de tabelas podem estar em schema diferente

### Problema: "Syntax error at or near 'or'"
**Causa:** `or` é uma palavra reservada do PostgreSQL (operador lógico)
**Solução:** Use alias diferentes para a tabela `occupancy_reports`, como:
- `orep` (occupancy reports)
- `reports`
- `occ`

**Exemplo correto:**
```sql
SELECT p.name, orep.people_count, orep.created_at
FROM postos p
LEFT JOIN occupancy_reports orep ON p.id = orep.posto_id;
```

**Exemplo INCORRETO:**
```sql
-- ❌ Errado - 'or' é palavra reservada
SELECT p.name, or.people_count, or.created_at
FROM postos p
LEFT JOIN occupancy_reports or ON p.id = or.posto_id;
```

**Alternativa com aspas:** Se realmente preferir usar `or`, coloque em aspas duplas:
```sql
SELECT p.name, "or".people_count, "or".created_at
FROM postos p
LEFT JOIN occupancy_reports "or" ON p.id = "or".posto_id;
```

### Problema: Query muito lenta
- Use `LIMIT` para restringir resultados
- Adicione `WHERE` para filtrar dados
- Verifique se existem índices nas colunas

---

## 📝 Notas Adicionais

- As datas estão em UTC (timezone Supabase padrão)
- CPFs devem estar no formato: `12345678900` (sem caracteres especiais)
- Emails devem ser únicos (violará constraint se duplicado)
- Todos os IDs são UUIDs gerados automaticamente

---

## 📂 Arquivo de Queries

Todas as queries SQL estão em: `QUERIES_TESTE.sql`

