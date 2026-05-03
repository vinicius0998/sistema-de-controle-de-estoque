import { useEffect, useState } from 'react'
import { api, Funcionario, Movimentacao } from '../lib/api'
import { formatBRL, formatDateTime } from '../lib/utils'

interface RelatorioFuncionario {
  funcionario: Funcionario
  movimentacoes: Movimentacao[]
  totalItens: number
  totalValor: number
}

export function Relatorios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [funcId, setFuncId] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [relatorio, setRelatorio] = useState<RelatorioFuncionario | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get<Funcionario[]>('/funcionarios').then(r => setFuncionarios(r.data))
  }, [])

  const buscar = async () => {
    if (!funcId) return
    setLoading(true)
    const params = new URLSearchParams()
    if (dataInicio) params.set('dataInicio', dataInicio)
    if (dataFim) params.set('dataFim', dataFim)
    const r = await api.get<RelatorioFuncionario>(`/dashboard/por-funcionario/${funcId}?${params}`)
    setRelatorio(r.data)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Relatório por Funcionário</h1>
        <p className="text-muted text-sm mt-1">Veja todos os materiais retirados por um funcionário</p>
      </div>

      <div className="card flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-48">
          <label className="text-xs text-muted mb-1 block">Funcionário</label>
          <select className="input-base" value={funcId} onChange={e => setFuncId(e.target.value)}>
            <option value="">Selecione...</option>
            {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">De</label>
          <input type="date" className="input-base" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">Até</label>
          <input type="date" className="input-base" value={dataFim} onChange={e => setDataFim(e.target.value)} />
        </div>
        <button onClick={buscar} className="btn-primary">Buscar</button>
      </div>

      {loading && <p className="text-muted text-center py-8">Carregando...</p>}

      {relatorio && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="card text-center">
              <p className="text-muted text-xs mb-1">Funcionário</p>
              <p className="text-white font-bold">{relatorio.funcionario.nome}</p>
              <p className="text-muted text-xs">{relatorio.funcionario.setor ?? ''}</p>
            </div>
            <div className="card text-center">
              <p className="text-muted text-xs mb-1">Total de Itens Retirados</p>
              <p className="text-white font-bold text-2xl">{relatorio.totalItens}</p>
            </div>
            <div className="card text-center">
              <p className="text-muted text-xs mb-1">Valor Total</p>
              <p className="text-accent font-bold text-2xl">{formatBRL(relatorio.totalValor)}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-4">Movimentações</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted text-xs uppercase">
                    <th className="text-left py-3 px-2">Data/Hora</th>
                    <th className="text-left py-3 px-2">Produto</th>
                    <th className="text-right py-3 px-2">Qtd</th>
                    <th className="text-right py-3 px-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorio.movimentacoes.map(m => (
                    <tr key={m.id} className="table-row">
                      <td className="py-3 px-2 text-muted">{formatDateTime(m.data)}</td>
                      <td className="py-3 px-2 text-white">{m.produto.nome}</td>
                      <td className="py-3 px-2 text-right">{m.quantidade}</td>
                      <td className="py-3 px-2 text-right">{formatBRL(m.valorTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {relatorio.movimentacoes.length === 0 && <p className="text-muted text-center py-8 text-sm">Nenhuma movimentação no período</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
