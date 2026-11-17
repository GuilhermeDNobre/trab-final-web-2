# Gean Bebidas

Plataforma web de catálogo e pedidos online para o depósito Gean Bebidas. Projeto final da disciplina Desenvolvimento Web 2.

O cliente navega pelo catálogo, filtra por categoria, busca por nome, monta o carrinho e finaliza o pedido pelo WhatsApp da loja. O lojista gerencia os produtos por um painel administrativo protegido por login.

## Stack

| Camada   | Tecnologias                                            |
| -------- | ------------------------------------------------------ |
| Frontend | React, TypeScript, Vite, Axios (mobile-first)          |
| Backend  | Node.js, NestJS (Express), TypeScript, Mongoose        |
| Banco    | MongoDB (MongoDB Atlas)                                |
| Auth     | JWT + bcrypt                                           |
| Docs     | Swagger (OpenAPI), disponível em `/docs`               |
| Deploy   | API no Render ou Railway, frontend na Vercel           |

## Estrutura

```
gean-bebidas/
├── backend/            # API REST (NestJS + Mongoose)
├── frontend/           # SPA (Vite + React + TypeScript)
├── docker-compose.yml  # MongoDB local + API
└── .github/workflows/  # CI (lint e build)
```

## Como rodar

Pré-requisito: Node.js 22 ou superior.

### Backend

```bash
cd backend
cp .env.example .env   # preencha MONGODB_URI e JWT_SECRET
npm install
npm run start:dev      # http://localhost:3000
```

A documentação interativa da API (Swagger) fica em `http://localhost:3000/docs`.

Scripts disponíveis:

| Script               | O que faz                               |
| -------------------- | --------------------------------------- |
| `npm run start:dev`  | Sobe a API com recarga automática       |
| `npm run build`      | Compila o TypeScript para `dist/`       |
| `npm run start:prod` | Roda a versão compilada                 |
| `npm run lint`       | Verifica o código com o oxlint          |
| `npm test`           | Roda os testes                          |

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

### Com Docker

Sobe um MongoDB local e a API juntos, sem precisar do Atlas:

```bash
docker compose up --build
```

A API fica em `http://localhost:3000` e o banco em `mongodb://localhost:27017/gean-bebidas`.

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável         | Descrição                                                      | Exemplo                         |
| ---------------- | -------------------------------------------------------------- | ------------------------------- |
| `MONGODB_URI`    | String de conexão do MongoDB (Atlas ou local)                  | `mongodb+srv://...`             |
| `JWT_SECRET`     | Segredo usado para assinar os tokens                           | uma string longa e aleatória    |
| `JWT_EXPIRES_IN` | Validade do token                                              | `1d`                            |
| `PORT`           | Porta da API                                                   | `3000`                          |
| `CORS_ORIGIN`    | Origem permitida do frontend                                   | `http://localhost:5173`         |

No Atlas, mantenha o nome do banco (`gean-bebidas`) logo antes do `?` na URI. Sem ele o Mongo usa o banco `test`.

### Frontend (`frontend/.env`)

| Variável       | Descrição              | Exemplo                 |
| -------------- | ---------------------- | ----------------------- |
| `VITE_API_URL` | URL base da API        | `http://localhost:3000` |

## Fluxo de trabalho

- `main`: apenas a base estável do projeto.
- `develop`: integração do que está em desenvolvimento. Funcionalidades novas saem dela em branches `feature/*`.
- Commits seguem o padrão Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`...).

## Equipe

Gabriel, Guilherme e Lucas.
