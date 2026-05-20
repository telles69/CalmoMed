# CalmoMed Backend

Backend para o sistema CalmoMed, utilizando Node.js, Express, Sequelize e PostgreSQL.

## Funcionalidades
- API REST para usuários, postos de saúde e relatórios de ocupação
- Estrutura modular (controllers, models, rotas, middlewares, utils)
- Integração com banco PostgreSQL via Sequelize

## Rodar o proj
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env` com as variáveis do banco e JWT.
3. Rode o servidor:
   ```bash
   npm run dev
   ```

## Estrutura de Pastas
```
src/
  controllers/
  models/
  routes/
  middlewares/
  utils/
  config/
  server.js
```

## Tecnologias
- Node.js
- Express
- Sequelize
- PostgreSQL


