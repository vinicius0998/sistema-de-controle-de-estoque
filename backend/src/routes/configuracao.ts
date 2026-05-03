import { Router } from 'express'
import { prisma } from '../lib/prisma'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

export const configuracaoRouter = Router()

const uploadsDir = path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `logo${path.extname(file.originalname)}`),
})
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } })

configuracaoRouter.get('/', async (_req, res) => {
  let config = await prisma.configuracao.findUnique({ where: { id: 1 } })
  if (!config) config = await prisma.configuracao.create({ data: { id: 1, nomeEmpresa: 'Minha Empresa', estoqueMinimo: 5 } })
  res.json(config)
})

configuracaoRouter.put('/', async (req, res) => {
  const { nomeEmpresa, estoqueMinimo } = req.body
  const config = await prisma.configuracao.upsert({
    where: { id: 1 },
    update: { nomeEmpresa, estoqueMinimo: Number(estoqueMinimo) },
    create: { id: 1, nomeEmpresa, estoqueMinimo: Number(estoqueMinimo) },
  })
  res.json(config)
})

configuracaoRouter.post('/logo', upload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' })
  const logoPath = `/uploads/${req.file.filename}`
  const config = await prisma.configuracao.upsert({
    where: { id: 1 },
    update: { logoPath },
    create: { id: 1, nomeEmpresa: 'Minha Empresa', estoqueMinimo: 5, logoPath },
  })
  res.json(config)
})
