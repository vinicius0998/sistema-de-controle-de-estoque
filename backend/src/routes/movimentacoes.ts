import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export const movimentacoesRouter = Router()

const registroSchema = z.object({
  tipo: z.enum(['ENTRADA', 'SAIDA']),
  codigoProduto: z.string().min(1),
  matriculaFuncionario: z.string().optional(),
  quantidade: z.number().int().min(1),
})

// Listar com filtros
movimentacoesRouter.get('/', async (req, res) => {
  const { tipo, produtoId, funcionarioId, dataInicio, dataFim } = req.query
  const where: Record<string, unknown> = {}
  if (tipo) where.tipo = tipo
  if (produtoId) where.produtoId = Number(produtoId)
  if (funcionarioId) where.funcionarioId = Number(funcionarioId)
  if (dataInicio || dataFim) {
    where.data = {}
    if (dataInicio) (where.data as Record<string, unknown>).gte = new Date(dataInicio as string)
    if (dataFim) (where.data as Record<string, unknown>).lte = new Date(dataFim as string)
  }
  const movs = await prisma.movimentacao.findMany({
    where,
    include: { produto: true, funcionario: true },
    orderBy: { data: 'desc' },
  })
  res.json(movs)
})

// Exportar CSV
movimentacoesRouter.get('/export/csv', async (req, res) => {
  const movs = await prisma.movimentacao.findMany({
    include: { produto: true, funcionario: true },
    orderBy: { data: 'desc' },
  })
  const header = 'Data,Hora,Tipo,Codigo,Produto,Matricula,Funcionario,Quantidade,ValorTotal\n'
  const rows = movs.map((m) => {
    const d = new Date(m.data)
    const data = d.toLocaleDateString('pt-BR')
    const hora = d.toLocaleTimeString('pt-BR')
    return [
      data, hora, m.tipo, m.produto.codigo, m.produto.nome,
      m.funcionario?.matricula ?? '', m.funcionario?.nome ?? '',
      m.quantidade, m.valorTotal.toFixed(2).replace('.', ',')
    ].join(',')
  }).join('\n')
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename=movimentacoes.csv')
  res.send('\uFEFF' + header + rows)
})

// Registrar movimentacao
movimentacoesRouter.post('/', async (req, res) => {
  const data = registroSchema.safeParse(req.body)
  if (!data.success) return res.status(400).json({ error: data.error.flatten() })

  const { tipo, codigoProduto, matriculaFuncionario, quantidade } = data.data

  const produto = await prisma.produto.findUnique({ where: { codigo: codigoProduto } })
  if (!produto) return res.status(404).json({ error: 'Produto n\u00e3o encontrado' })

  let funcionarioId: number | undefined
  if (tipo === 'SAIDA') {
    if (!matriculaFuncionario) return res.status(400).json({ error: 'Matr\u00edcula do funcion\u00e1rio obrigat\u00f3ria para sa\u00edda' })
    const func = await prisma.funcionario.findUnique({ where: { matricula: matriculaFuncionario } })
    if (!func) return res.status(404).json({ error: 'Funcion\u00e1rio n\u00e3o encontrado' })
    funcionarioId = func.id

    // Checar saldo
    const entradas = await prisma.movimentacao.aggregate({ where: { produtoId: produto.id, tipo: 'ENTRADA' }, _sum: { quantidade: true } })
    const saidas = await prisma.movimentacao.aggregate({ where: { produtoId: produto.id, tipo: 'SAIDA' }, _sum: { quantidade: true } })
    const saldo = (entradas._sum.quantidade ?? 0) - (saidas._sum.quantidade ?? 0)
    if (saldo < quantidade) return res.status(422).json({ error: `Saldo insuficiente. Saldo atual: ${saldo}` })
  }

  const mov = await prisma.movimentacao.create({
    data: { tipo, quantidade, valorTotal: produto.preco * quantidade, produtoId: produto.id, funcionarioId },
    include: { produto: true, funcionario: true },
  })
  res.status(201).json(mov)
})
