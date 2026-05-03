import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export const funcionariosRouter = Router()

const schema = z.object({
  matricula: z.string().min(1),
  nome: z.string().min(1),
  setor: z.string().optional(),
})

funcionariosRouter.get('/', async (_req, res) => {
  const funcionarios = await prisma.funcionario.findMany({ orderBy: { nome: 'asc' } })
  res.json(funcionarios)
})

funcionariosRouter.get('/busca/:matricula', async (req, res) => {
  const func = await prisma.funcionario.findUnique({ where: { matricula: req.params.matricula } })
  if (!func) return res.status(404).json({ error: 'Funcionário não encontrado' })
  res.json(func)
})

funcionariosRouter.post('/', async (req, res) => {
  const data = schema.safeParse(req.body)
  if (!data.success) return res.status(400).json({ error: data.error.flatten() })
  try {
    const func = await prisma.funcionario.create({ data: data.data })
    res.status(201).json(func)
  } catch {
    res.status(409).json({ error: 'Matrícula já cadastrada' })
  }
})

funcionariosRouter.put('/:id', async (req, res) => {
  const data = schema.partial().safeParse(req.body)
  if (!data.success) return res.status(400).json({ error: data.error.flatten() })
  try {
    const func = await prisma.funcionario.update({ where: { id: Number(req.params.id) }, data: data.data })
    res.json(func)
  } catch {
    res.status(404).json({ error: 'Funcionário não encontrado' })
  }
})

funcionariosRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.funcionario.delete({ where: { id: Number(req.params.id) } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error: 'Funcionário não encontrado' })
  }
})
