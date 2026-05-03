import axios from 'axios'

// Em produção (Vercel), usa a variável de ambiente VITE_API_URL apontando para o Railway.
// Em desenvolvimento local, usa o proxy do Vite (/api → localhost:3001).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
})

export interface Produto {
  id: number; codigo: string; nome: string; preco: number;
  categoria?: string; estoqueMinimo?: number;
  totalEntradas?: number; totalSaidas?: number; saldo?: number;
  valorEstoque?: number; alerta?: boolean; estoqueMinimoPadrao?: number;
}

export interface Funcionario {
  id: number; matricula: string; nome: string; setor?: string;
}

export interface Movimentacao {
  id: number; tipo: 'ENTRADA' | 'SAIDA'; quantidade: number;
  valorTotal: number; data: string;
  produto: Produto; funcionario?: Funcionario;
}

export interface Configuracao {
  id: number; nomeEmpresa: string; logoPath?: string; estoqueMinimo: number;
}
