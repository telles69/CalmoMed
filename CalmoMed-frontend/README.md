# Projeto Postos

## Sobre o Projeto

Este é um projeto frontend para visualização de informações sobre postos de saúde, construído com Next.js, React e Chakra UI.

## Como rodar o projeto localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão recomendada: LTS)
- npm (vem com o Node.js) ou [Yarn](https://yarnpkg.com/)

### Instalação

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd projeto-postos
   ```
2. Instale as dependências do projeto:
   ```bash
   npm install
   # ou
   yarn install
   ```

### Rodando o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

Por padrão, o projeto roda em [http://localhost:3000](http://localhost:3000). Se a porta 3000 estiver ocupada, o Next.js usará outra porta disponível (ex: 41517). O terminal mostrará a URL correta após rodar o comando acima.

Se quiser forçar uma porta específica, rode:
```bash
PORT=3000 npm run dev
```

### Dependências principais

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Chakra UI](https://chakra-ui.com/)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [react-icons](https://react-icons.github.io/react-icons/) (necessário para os ícones)

### Estrutura de Pastas

- `src/app/`: Páginas da aplicação (App Router do Next.js)
- `src/components/`: Componentes React reutilizáveis
  - `src/components/ui/`: Componentes de UI específicos
- `public/`: Arquivos estáticos
- `jsconfig.json`: Configurações do JavaScript para o editor

### Dicas
- Se encontrar erro de porta ocupada, feche outros servidores locais ou use outra porta.
- Se aparecer erro de dependência, rode `npm install` novamente.

