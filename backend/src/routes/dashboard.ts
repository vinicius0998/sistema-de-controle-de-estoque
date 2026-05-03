import { Router } from 'express'
import { prisma } from '../lib/prisma'

export const dashboardRouter = Router()

dashboardRouter.get('/estoque', async (_req, res) => {
  const config = await prisma.configuracao.findUnique({ where: { id: 1 } })
  const estoqueMinimoPadrao = config?.estoqueMinimo ?? 5
  const produtos = await prisma.produto.findMany({ orderBy: { nome: 'asc' } })
  const result = await Promise.all(
    produtos.map(async (p) => {
      const entradas = await prisma.movimentacao.aggregate({ where: { produtoId: p.id, tipo: 'ENTRADA' }, _sum: { quantidade: true } })
      const saidas = await prisma.movimentacao.aggregate({ where: { produtoId: p.id, tipo: 'SAIDA' }, _sum: { quantidade: true } })
      const totalEntradas = entradas._sum.quantidade ?? 0
      const totalSaidas = saidas._sum.quantidade ?? 0
      const saldo = totalEntradas - totalSaidas
      const minimo = p.estoqueMinimo ?? estoqueMinimoPadrao
      return { ...p, totalEntradas, totalSaidas, saldo, valorEstoque: saldo * p.preco, estoqueMinimoPadrao: minimo, alerta: saldo <= minimo }
    })
  )
  res.json(result)
})

dashboardRouter.get('/por-funcionario/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { dataInicio, dataFim } = req.query
  const where: Record<string, unknown> = { funcionarioId: id, tipo: 'SAIDA' }
  if (dataInicio || dataFim) {
    where.data = {}
    if (dataInicio) (where.data as Record<string, unknown>).gte = new Date(dataInicio as string)
    if (dataFim) (where.data as Record<string, unknown>).lte = new Date(dataFim as string)
  }
  const func = await prisma.funcionario.findUnique({ where: { id } })
  if (!func) return res.status(404).json({ error: 'Funcion\u00e1rio n\u00e3o encontrado' })
  const movs = await prisma.movimentacao.findMany({ where, include: { produto: true } })
  const totalItens = movs.reduce((a, m) => a + m.quantidade, 0)
  const totalValor = movs.reduce((a, m) => a + m.valorTotal, 0)
  res.json({ funcionario: func, movimentacoes: movs, totalItens, totalValor })
})
