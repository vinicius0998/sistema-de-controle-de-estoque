import express from 'express'
import cors from 'cors'
import path from 'path'
import { produtosRouter } from './routes/produtos'
import { funcionariosRouter } from './routes/funcionarios'
import { movimentacoesRouter } from './routes/movimentacoes'
import { dashboardRouter } from './routes/dashboard'
import { configuracaoRouter } from './routes/configuracao'

const app = express()
const PORT = process.env.PORT ?? 3001

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173']

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use('/api/produtos', produtosRouter)
app.use('/api/funcionarios', funcionariosRouter)
app.use('/api/movimentacoes', movimentacoesRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/configuracao', configuracaoRouter)

app.listen(PORT, () => {
  console.log(`✅ Backend rodando na porta ${PORT}`)
})
