import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export const produtosRouter = Router()

const schema = z.object({
  codigo: z.string().min(1),
  nome: z.string().min(1),
  preco: z.number().min(0).default(0),
  categoria: z.string().optional(),
  estoqueMinimo: z.number().int().optional(),
})

// Listar todos com saldo
produtosRouter.get('/', async (req, res) => {
  const produtos = await prisma.produto.findMany({ orderBy: { nome: 'asc' } })
  const result = await Promise.all(
    produtos.map(async (p) => {
      const entradas = await prisma.movimentacao.aggregate({
        where: { produtoId: p.id, tipo: 'ENTRADA' },
        _sum: { quantidade: true },
      })
      const saidas = await prisma.movimentacao.aggregate({
        where: { produtoId: p.id, tipo: 'SAIDA' },
        _sum: { quantidade: true },
      })
      const totalEntradas = entradas._sum.quantidade ?? 0
      const totalSaidas = saidas._sum.quantidade ?? 0
      const saldo = totalEntradas - totalSaidas
      return { ...p, totalEntradas, totalSaidas, saldo, valorEstoque: saldo * p.preco }
    })
  )
  res.json(result)
})

// Buscar por código de barras
produtosRouter.get('/busca/:codigo', async (req, res) => {
  const produto = await prisma.produto.findUnique({ where: { codigo: req.params.codigo } })
  if (!produto) return res.status(404).json({ error: 'Produto não encontrado' })
  res.json(produto)
})

// Cadastrar
produtosRouter.post('/', async (req, res) => {
  const data = schema.safeParse(req.body)
  if (!data.success) return res.status(400).json({ error: data.error.flatten() })
  try {
    const produto = await prisma.produto.create({ data: data.data })
    res.status(201).json(produto)
  } catch {
    res.status(409).json({ error: 'Código de barras já cadastrado' })
  }
})

// Editar
produtosRouter.put('/:id', async (req, res) => {
  const data = schema.partial().safeParse(req.body)
  if (!data.success) return res.status(400).json({ error: data.error.flatten() })
  try {
    const produto = await prisma.produto.update({ where: { id: Number(req.params.id) }, data: data.data })
    res.json(produto)
  } catch {
    res.status(404).json({ error: 'Produto não encontrado' })
  }
})

// Excluir
produtosRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.produto.delete({ where: { id: Number(req.params.id) } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error: 'Produto não encontrado' })
  }
})
