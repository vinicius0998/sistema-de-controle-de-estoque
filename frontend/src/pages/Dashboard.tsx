import { useEffect, useState } from 'react'
import { api, Produto } from '../lib/api'
import { formatBRL } from '../lib/utils'
import { AlertTriangle, Package, TrendingDown, TrendingUp, DollarSign } from 'lucide-react'

export function Dashboard() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Produto[]>('/dashboard/estoque').then(r => { setProdutos(r.data); setLoading(false) })
  }, [])

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.codigo.includes(busca)
  )

  const totalEntradas = produtos.reduce((a, p) => a + (p.totalEntradas ?? 0), 0)
  const totalSaidas = produtos.reduce((a, p) => a + (p.totalSaidas ?? 0), 0)
  const valorTotal = produtos.reduce((a, p) => a + (p.valorEstoque ?? 0), 0)
  const alertas = produtos.filter(p => p.alerta).length

  const stats = [
    { label: 'Total Entradas', value: totalEntradas, icon: TrendingUp, color: 'text-success' },
    { label: 'Total Saídas', value: totalSaidas, icon: TrendingDown, color: 'text-danger' },
    { label: 'Valor em Estoque', value: formatBRL(valorTotal), icon: DollarSign, color: 'text-accent' },
    { label: 'Produtos em Alerta', value: alertas, icon: AlertTriangle, color: 'text-warning' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard de Estoque</h1>
        <p className="text-muted text-sm mt-1">Visão geral do estoque atual</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-white/5 ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-muted text-xs">{s.label}</p>
              <p className="text-white font-bold text-lg">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Package size={18} /> Posição do Estoque
          </h2>
          <input
            className="input-base w-64"
            placeholder="Buscar produto ou código..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        {loading ? (
          <p className="text-muted text-sm text-center py-8">Carregando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-xs uppercase tracking-wide">
                  <th className="text-left py-3 px-2">Código</th>
                  <th className="text-left py-3 px-2">Produto</th>
                  <th className="text-left py-3 px-2">Categoria</th>
                  <th className="text-right py-3 px-2">Entradas</th>
                  <th className="text-right py-3 px-2">Saídas</th>
                  <th className="text-right py-3 px-2">Saldo</th>
                  <th className="text-right py-3 px-2">Valor</th>
                  <th className="text-center py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(p => (
                  <tr key={p.id} className={`table-row ${p.alerta ? 'bg-red-500/5' : ''}`}>
                    <td className="py-3 px-2 font-mono text-xs text-muted">{p.codigo}</td>
                    <td className="py-3 px-2 font-medium text-white">{p.nome}</td>
                    <td className="py-3 px-2 text-muted">{p.categoria ?? '—'}</td>
                    <td className="py-3 px-2 text-right text-success">{p.totalEntradas ?? 0}</td>
                    <td className="py-3 px-2 text-right text-danger">{p.totalSaidas ?? 0}</td>
                    <td className={`py-3 px-2 text-right font-bold ${(p.saldo ?? 0) === 0 ? 'text-danger' : p.alerta ? 'text-warning' : 'text-white'}`}>
                      {p.saldo ?? 0}
                    </td>
                    <td className="py-3 px-2 text-right text-white">{formatBRL(p.valorEstoque ?? 0)}</td>
                    <td className="py-3 px-2 text-center">
                      {(p.saldo ?? 0) === 0 ? (
                        <span className="badge-saida">Zerado</span>
                      ) : p.alerta ? (
                        <span className="badge-alerta">Baixo</span>
                      ) : (
                        <span className="badge-entrada">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-bold text-white">
                  <td colSpan={3} className="py-3 px-2 text-muted text-sm">TOTAIS</td>
                  <td className="py-3 px-2 text-right text-success">{totalEntradas}</td>
                  <td className="py-3 px-2 text-right text-danger">{totalSaidas}</td>
                  <td className="py-3 px-2 text-right">{totalEntradas - totalSaidas}</td>
                  <td className="py-3 px-2 text-right">{formatBRL(valorTotal)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
