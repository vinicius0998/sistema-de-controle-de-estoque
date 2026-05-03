# Sistema de Controle de Estoque

Sistema web genérico de controle de estoque com suporte a leitura de código de barras USB.

## Stack

- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui (Vite)
- **Backend:** Node.js + Express + TypeScript
- **Banco de Dados:** SQLite via Prisma ORM

## Como Rodar

### Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Backend na porta **3001**.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend na porta **5173**.

## Funcionalidades

- Cadastro de Produtos (com código de barras)
- Cadastro de Funcionários (com matrícula/crachá)
- Entrada e Saída de Materiais (fluxo otimizado para leitor USB)
- Dashboard de Estoque com alertas visuais
- Histórico de Movimentações com exportação CSV
- Relatório por Funcionário
- Configurações da Empresa (nome, logo, estoque mínimo)

## Atalhos de Teclado (Tela de Movimentação)

| Tecla | Ação |
|-------|------|
| F1 | Modo Entrada |
| F2 | Modo Saída |
| Enter | Confirmar Registro |
| Esc | Limpar Campos |
