import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
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
