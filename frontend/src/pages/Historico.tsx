import { useEffect, useState } from 'react'
import { api, Movimentacao, Produto, Funcionario } from '../lib/api'
import { formatBRL, formatDate, formatTime } from '../lib/utils'
import { Download } from 'lucide-react'

export function Historico() {
  const [movs, setMovs] = useState<Movimentacao[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [filtros, setFiltros] = useState({ tipo: '', produtoId: '', funcionarioId: '', dataInicio: '', dataFim: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Produto[]>('/produtos').then(r => setProdutos(r.data))
    api.get<Funcionario[]>('/funcionarios').then(r => setFuncionarios(r.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filtros.tipo) params.set('tipo', filtros.tipo)
    if (filtros.produtoId) params.set('produtoId', filtros.produtoId)
    if (filtros.funcionarioId) params.set('funcionarioId', filtros.funcionarioId)
    if (filtros.dataInicio) params.set('dataInicio', filtros.dataInicio)
    if (filtros.dataFim) params.set('dataFim', filtros.dataFim)
    api.get<Movimentacao[]>(`/movimentacoes?${params.toString()}`)
      .then(r => setMovs(r.data))
      .finally(() => setLoading(false))
  }, [filtros])

  const exportar = () => { window.open('/api/movimentacoes/export/csv', '_blank') }

  const setFiltro = (key: string, val: string) => setFiltros(f => ({ ...f, [key]: val }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Histórico de Movimentações</h1>
          <p className="text-muted text-sm mt-1">{movs.length} registro(s)</p>
        </div>
        <button onClick={exportar} className="btn-ghost flex items-center gap-2">
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="card grid grid-cols-2 md:grid-cols-5 gap-3">
        <select className="input-base" value={filtros.tipo} onChange={e => setFiltro('tipo', e.target.value)}>
          <option value="">Todos os tipos</option>
          <option value="ENTRADA">Entrada</option>
          <option value="SAIDA">Saída</option>
        </select>
        <select className="input-base" value={filtros.produtoId} onChange={e => setFiltro('produtoId', e.target.value)}>
          <option value="">Todos os produtos</option>
          {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        <select className="input-base" value={filtros.funcionarioId} onChange={e => setFiltro('funcionarioId', e.target.value)}>
          <option value="">Todos funcionários</option>
          {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
        <input type="date" className="input-base" value={filtros.dataInicio} onChange={e => setFiltro('dataInicio', e.target.value)} />
        <input type="date" className="input-base" value={filtros.dataFim} onChange={e => setFiltro('dataFim', e.target.value)} />
      </div>

      <div className="card">
        {loading ? (
          <p className="text-muted text-center py-8 text-sm">Carregando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-xs uppercase tracking-wide">
                  <th className="text-left py-3 px-2">Data</th>
                  <th className="text-left py-3 px-2">Hora</th>
                  <th className="text-left py-3 px-2">Tipo</th>
                  <th className="text-left py-3 px-2">Produto</th>
                  <th className="text-left py-3 px-2">Funcionário</th>
                  <th className="text-right py-3 px-2">Qtd</th>
                  <th className="text-right py-3 px-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {movs.map(m => (
                  <tr key={m.id} className="table-row">
                    <td className="py-3 px-2 text-muted">{formatDate(m.data)}</td>
                    <td className="py-3 px-2 text-muted">{formatTime(m.data)}</td>
                    <td className="py-3 px-2">
                      <span className={m.tipo === 'ENTRADA' ? 'badge-entrada' : 'badge-saida'}>{m.tipo}</span>
                    </td>
                    <td className="py-3 px-2">
                      <p className="text-white font-medium">{m.produto.nome}</p>
                      <p className="text-muted text-xs font-mono">{m.produto.codigo}</p>
                    </td>
                    <td className="py-3 px-2 text-muted">{m.funcionario ? `${m.funcionario.nome} (${m.funcionario.matricula})` : '—'}</td>
                    <td className="py-3 px-2 text-right text-white font-medium">{m.quantidade}</td>
                    <td className="py-3 px-2 text-right text-white">{formatBRL(m.valorTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {movs.length === 0 && <p className="text-muted text-center py-8 text-sm">Nenhuma movimentação encontrada</p>}
          </div>
        )}
      </div>
    </div>
  )
}
