import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.configuracao.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nomeEmpresa: 'Minha Empresa', estoqueMinimo: 5 },
  })

  const produtos = [
    { codigo: '7891234560001', nome: 'Papel A4 (Resma)', preco: 25.90, categoria: 'Papelaria', estoqueMinimo: 10 },
    { codigo: '7891234560002', nome: 'Caneta Esferográfica Azul', preco: 2.50, categoria: 'Papelaria' },
    { codigo: '7891234560003', nome: 'Grampeador', preco: 35.00, categoria: 'Escritório' },
    { codigo: '7891234560004', nome: 'Toner HP LaserJet', preco: 189.90, categoria: 'Informática', estoqueMinimo: 2 },
    { codigo: '7891234560005', nome: 'Pendrive 32GB', preco: 45.00, categoria: 'Informática' },
  ]

  for (const p of produtos) {
    await prisma.produto.upsert({ where: { codigo: p.codigo }, update: {}, create: p })
  }

  const funcionarios = [
    { matricula: 'F001', nome: 'Carlos Silva', setor: 'TI' },
    { matricula: 'F002', nome: 'Ana Oliveira', setor: 'Administrativo' },
    { matricula: 'F003', nome: 'João Santos', setor: 'Financeiro' },
  ]

  for (const f of funcionarios) {
    await prisma.funcionario.upsert({ where: { matricula: f.matricula }, update: {}, create: f })
  }

  const prod1 = await prisma.produto.findUnique({ where: { codigo: '7891234560001' } })
  const prod2 = await prisma.produto.findUnique({ where: { codigo: '7891234560002' } })
  const func1 = await prisma.funcionario.findUnique({ where: { matricula: 'F001' } })

  if (prod1 && prod2 && func1) {
    await prisma.movimentacao.createMany({
      data: [
        { tipo: 'ENTRADA', quantidade: 50, valorTotal: 50 * prod1.preco, produtoId: prod1.id },
        { tipo: 'ENTRADA', quantidade: 100, valorTotal: 100 * prod2.preco, produtoId: prod2.id },
        { tipo: 'SAIDA', quantidade: 5, valorTotal: 5 * prod1.preco, produtoId: prod1.id, funcionarioId: func1.id },
        { tipo: 'SAIDA', quantidade: 10, valorTotal: 10 * prod2.preco, produtoId: prod2.id, funcionarioId: func1.id },
      ],
    })
  }

  console.log('✅ Seed concluído!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
