# Refatoração do Dashboard - CalmoMed

## Resumo das Mudanças

O Dashboard foi completamente refatorado para usar dados reais do banco de dados através da API, substituindo os dados mockados.

## 🆕 ATUALIZAÇÃO: Filtros de Data Customizados

### Novos Recursos Adicionados

#### 1. **Filtros de Data Rápidos**
Botões para seleção rápida de períodos:
- **Hoje**: Dados do dia atual
- **Esta Semana**: Desde domingo até agora
- **Este Mês**: Desde o dia 1º do mês até agora
- **Este Ano**: Desde 1º de janeiro até agora

#### 2. **Seleção de Data Customizada**
- Campo de **Data Inicial** (input date)
- Campo de **Data Final** (input date)
- Botão **Aplicar** para confirmar o filtro
- Botão **Limpar** para remover o filtro customizado

#### 3. **Indicador Visual**
Quando um filtro de data está ativo, aparece uma mensagem:
```
✓ Filtrando de 01/11/2025 até 26/11/2025
```

### Como Funciona

#### Backend
Os endpoints agora aceitam parâmetros opcionais de data:

**GET /api/occupancy-reports/stats**
```
Query Parameters:
- period: 'hour' | 'day' | 'week' | 'month'
- postoId: ID do posto (opcional)
- startDate: Data inicial (ISO string) - NOVO ✨
- endDate: Data final (ISO string) - NOVO ✨
```

**GET /api/occupancy-reports/general-stats**
```
Query Parameters:
- startDate: Data inicial (ISO string) - NOVO ✨
- endDate: Data final (ISO string) - NOVO ✨
```

**Lógica de Datas:**
1. Se `startDate` e `endDate` forem fornecidos, usa essas datas
2. Se não, usa os períodos padrão (últimas 24h, 7 dias, etc)
3. O `endDate` é ajustado para 23:59:59 do dia selecionado

**Agrupamento Automático:**
O backend determina automaticamente como agrupar os dados baseado no intervalo:
- ≤ 1 dia → Agrupa por hora
- ≤ 7 dias → Agrupa por dia
- ≤ 60 dias → Agrupa por semana
- > 60 dias → Agrupa por mês

#### Frontend
- Novos estados: `useCustomDate`, `startDate`, `endDate`
- Funções de controle: `handleApplyDateFilter()`, `handleClearDateFilter()`, `handleQuickDate()`
- Disponível nos dois modos: **Lotação** e **Comparação**

### Exemplos de Uso

#### Exemplo 1: Ver dados de Novembro
1. Clique em "Este Mês"
2. O sistema automaticamente define:
   - Data Inicial: 01/11/2025
   - Data Final: 26/11/2025 (hoje)

#### Exemplo 2: Comparar duas semanas
1. Selecione Data Inicial: 01/11/2025
2. Selecione Data Final: 15/11/2025
3. Clique em "Aplicar"
4. O gráfico mostrará dados apenas desse período

#### Exemplo 3: Ver o ano todo
1. Clique em "Este Ano"
2. Dados desde 01/01/2025 até hoje

### Arquivos Modificados (Nova Atualização)

**Backend:**
- `/CalmoMedWebBack/src/controllers/occupancyReportController.js`
  - `getOccupancyStats()` - Aceita startDate/endDate
  - `getGeneralStats()` - Aceita startDate/endDate
  - Agrupamento automático por intervalo

**Frontend:**
- `/CalmoMed-frontend/src/services/api.js`
  - `getOccupancyStats()` - Aceita startDate/endDate
  - `getGeneralStats()` - Aceita startDate/endDate

- `/CalmoMed-frontend/src/components/Dashboard.js`
  - Novos imports: `Input`, `Stack`
  - Novos estados para datas
  - Novas funções de controle de data
  - UI de filtro de data (ambos os modos)

## ⚠️ Funcionalidades Removidas

### 1. Sistema de Avaliações (⭐ Rating)
**Motivo**: O banco de dados não possui dados de avaliações de usuários na tabela `occupancy_reports`.

**O que foi removido**:
- Gráfico de barras com avaliações por estrelas (1-5)
- Estatísticas de "Melhor Avaliado"
- Contador de "Postos Acima de 4⭐"
- Campos `rating` e `reviews` não estão sendo usados da tabela `postos`

**O que substituiu**:
- Modo "Comparação" que mostra a ocupação média de todos os postos nas últimas 24 horas
- Estatísticas de total de relatórios recebidos

### 2. Dados Percentuais de Lotação
**Motivo**: O banco armazena `people_count` (número absoluto de pessoas), não percentual de capacidade.

**O que mudou**:
- De: "75%" → Para: "75 pessoas"
- Remoção do campo `maxCapacity` do cálculo (não confiável/atualizado)
- Todas as métricas agora mostram número absoluto de pessoas

## ✅ Novas Funcionalidades

### 1. Backend - Novos Endpoints

#### `GET /api/occupancy-reports/stats`
Retorna estatísticas de ocupação agrupadas por período.

**Query Parameters**:
- `period`: 'hour' | 'day' | 'week' | 'month'
- `postoId`: ID do posto (opcional, omitir para todos)

**Resposta**:
```json
[
  {
    "period": "14",
    "averageOccupancy": 45,
    "reportCount": 12
  }
]
```

#### `GET /api/occupancy-reports/general-stats`
Retorna estatísticas gerais de todos os postos (últimas 24h).

**Resposta**:
```json
[
  {
    "postoId": 1,
    "postoName": "UBS Centro",
    "averageOccupancy": 42,
    "reportCount": 25,
    "maxOccupancy": 68,
    "minOccupancy": 12
  }
]
```

### 2. Frontend - Dashboard Atualizado

#### Modos de Visualização
1. **Lotação** (📊): Gráfico de linha mostrando evolução temporal
   - Filtros: hora, dia, semana, mês
   - Pode filtrar por posto específico ou visão geral

2. **Comparação** (📈): Gráfico de barras comparando todos os postos
   - Mostra ocupação média nas últimas 24 horas
   - Identifica posto mais ocupado

#### Cards de Estatísticas

**Modo Lotação**:
- Lotação Média
- Pico Máximo
- Menor Lotação
- Período Ativo

**Modo Comparação**:
- Ocupação Média Geral
- Posto Mais Ocupado
- Total de Postos Monitorados
- Total de Relatórios (24h)

## 🔧 Arquivos Modificados

### Backend
1. `/CalmoMedWebBack/src/controllers/occupancyReportController.js`
   - Adicionados: `getOccupancyStats()`, `getGeneralStats()`

2. `/CalmoMedWebBack/src/routes/occupancyReportRoute.js`
   - Novas rotas: `/stats`, `/general-stats`

### Frontend
1. `/CalmoMed-frontend/src/services/api.js`
   - Adicionados: `getOccupancyStats()`, `getGeneralStats()`

2. `/CalmoMed-frontend/src/components/Dashboard.js`
   - Refatoração completa
   - Remoção de todos os dados mockados
   - Integração com API real
   - Estados de loading e erro
   - Processamento dinâmico de dados

## 📊 Estrutura de Dados Utilizada

### Tabela: `occupancy_reports`
```sql
- id (uuid)
- user_id (uuid)
- posto_id (integer)
- people_count (integer)          ← Usado para estatísticas
- user_location (jsonb)
- distance_to_posto (numeric)
- created_at (timestamp)          ← Usado para agrupamento temporal
```

### Tabela: `postos`
```sql
- id (integer)
- name (varchar)                  ← Usado para labels
- address, latitude, longitude
- services, specialties
- rating, reviews                 ⚠️ NÃO USADO (dados insuficientes)
- opening_hours, contact
- crowding_info                   ⚠️ NÃO USADO (preferência por dados reais)
- created_at, updated_at
```

## 🚀 Como Testar

1. Certifique-se de que o backend está rodando
2. Certifique-se de que há dados em `occupancy_reports`
3. Acesse o Dashboard
4. Teste os filtros:
   - Alternar entre "Lotação" e "Comparação"
   - Mudar períodos (hora/dia/semana/mês)
   - Selecionar diferentes postos

## 💡 Melhorias Futuras Sugeridas

### Para usar avaliações novamente:
1. Criar tabela `posto_reviews`:
   ```sql
   CREATE TABLE posto_reviews (
     id uuid PRIMARY KEY,
     user_id uuid REFERENCES profiles(id),
     posto_id integer REFERENCES postos(id),
     rating integer CHECK (rating BETWEEN 1 AND 5),
     comment text,
     created_at timestamp
   );
   ```

2. Implementar endpoint de avaliações
3. Restaurar modo de visualização de avaliações

### Para usar percentuais:
1. Adicionar campo `current_capacity` em `postos` (mantido atualizado)
2. Calcular `occupancy_percentage = (people_count / current_capacity) * 100`
3. Atualizar gráficos para mostrar percentuais novamente

## 🐛 Troubleshooting

**Problema**: Dashboard mostra "Erro ao carregar dados"
- Verificar se backend está rodando
- Verificar variáveis de ambiente do Supabase
- Verificar se há dados em `occupancy_reports`

**Problema**: Gráfico não aparece
- Verificar console do navegador
- Verificar se Chart.js foi carregado
- Verificar se há dados no período selecionado

**Problema**: "0 pessoas" em todas as estatísticas
- Provavelmente não há dados no período filtrado
- Tentar mudar o filtro de tempo
- Verificar se há relatórios recentes no banco
