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
| `npm test`           | Roda os testes unitários                |
| `npm run test:e2e`   | Roda os testes e2e (MongoDB em memória) |
| `npm run seed`       | Cria índices, o admin e 10 produtos de exemplo |

O seed **substitui todos os produtos** da coleção pelos de exemplo (3 deles esgotados) e cria ou atualiza o admin com `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Use apenas em ambiente de desenvolvimento.

Os testes e2e sobem um MongoDB em memória (`mongodb-memory-server`) e nunca usam o banco do `.env`. A primeira execução baixa o binário do MongoDB, então demora um pouco mais.

> No Windows, rode os testes a partir de um caminho com a letra do drive em maiúsculo (`D:\...`, como no PowerShell). Se o terminal abrir em `d:\...`, o Vitest carrega o próprio runner duas vezes e todas as suítes falham com `Cannot read properties of undefined (reading 'config')`.

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
| `ADMIN_EMAIL`    | E-mail do admin criado pelo `npm run seed`                     | `admin@geanbebidas.com`         |
| `ADMIN_PASSWORD` | Senha do admin criado pelo `npm run seed`                      | uma senha forte                 |

No Atlas, mantenha o nome do banco (`gean-bebidas`) logo antes do `?` na URI. Sem ele o Mongo usa o banco `test`.

### Frontend (`frontend/.env`)

| Variável       | Descrição              | Exemplo                 |
| -------------- | ---------------------- | ----------------------- |
| `VITE_API_URL` | URL base da API        | `http://localhost:3000` |

## API

A documentação completa e interativa está no Swagger: **`http://localhost:3000/docs`** (JSON em `/docs-json`).
Para testar as rotas protegidas, faça login em `POST /auth/login`, copie o `token` e clique em **Authorize** no Swagger.

Rotas protegidas exigem o header `Authorization: Bearer <token>`. Sem token válido, respondem `401`.

| Método | Rota                          | Acesso    | Descrição                                                                 |
| ------ | ----------------------------- | --------- | ------------------------------------------------------------------------- |
| GET    | `/health`                     | Público   | Estado da API e da conexão com o banco                                    |
| GET    | `/products`                   | Público   | Lista só produtos `available`. Filtros: `?category=` e `?search=` (nome)  |
| GET    | `/products/:id`               | Público   | Detalhe de um produto `available` (esgotado retorna 404)                  |
| POST   | `/auth/login`                 | Público   | Recebe `{ email, password }` e retorna `{ token }`                        |
| GET    | `/auth/me`                    | Protegido | Retorna `{ id, email }` do admin autenticado                              |
| GET    | `/admin/products`             | Protegido | Lista todos os produtos. Filtros: `?category=`, `?status=` e `?search=`   |
| GET    | `/admin/products/:id`         | Protegido | Detalhe de qualquer produto por ID, inclusive esgotados                   |
| POST   | `/admin/products`             | Protegido | Cria produto                                                              |
| PUT    | `/admin/products/:id`         | Protegido | Atualiza produto                                                          |
| PATCH  | `/admin/products/:id/status`  | Protegido | Altera o status (`available` ou `out-of-stock`)                           |
| DELETE | `/admin/products/:id`         | Protegido | Remove produto                                                            |

Categorias válidas: `beers`, `spirits`, `soft-drinks`, `snacks`, `ice`.

## Fluxo de trabalho

- `main`: apenas a base estável do projeto.
- `develop`: integração do que está em desenvolvimento. Funcionalidades novas saem dela em branches `feature/*`.
- Commits seguem o padrão Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`...).

## Equipe

Gabriel, Guilherme e Lucas.
