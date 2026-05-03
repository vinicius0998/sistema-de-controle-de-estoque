import { useEffect, useRef, useState } from 'react'
import { api, Produto, Funcionario, Movimentacao } from '../lib/api'
import { formatBRL, formatDateTime } from '../lib/utils'
import toast from 'react-hot-toast'
import { ArrowDownCircle, ArrowUpCircle, CheckCircle } from 'lucide-react'

export function Movimentacao() {
  const [modo, setModo] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA')
  const [codigoProduto, setCodigoProduto] = useState('')
  const [matricula, setMatricula] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [produto, setProduto] = useState<Produto | null>(null)
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null)
  const [loading, setLoading] = useState(false)
  const [ultimas, setUltimas] = useState<Movimentacao[]>([])
  const inputProdutoRef = useRef<HTMLInputElement>(null)

  const limpar = () => {
    setCodigoProduto(''); setMatricula(''); setQuantidade(1)
    setProduto(null); setFuncionario(null)
    setTimeout(() => inputProdutoRef.current?.focus(), 50)
  }

  useEffect(() => {
    inputProdutoRef.current?.focus()
    carregarUltimas()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F1') { e.preventDefault(); setModo('ENTRADA'); limpar() }
      if (e.key === 'F2') { e.preventDefault(); setModo('SAIDA'); limpar() }
      if (e.key === 'Escape') limpar()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const carregarUltimas = () => {
    api.get<Movimentacao[]>('/movimentacoes?_limit=5').then(r => setUltimas(r.data.slice(0, 8)))
  }

  const buscarProduto = async (codigo: string) => {
    if (!codigo.trim()) return
    try {
      const r = await api.get<Produto>(`/produtos/busca/${codigo}`)
      setProduto(r.data)
    } catch { toast.error('Produto não encontrado'); setProduto(null) }
  }

  const buscarFuncionario = async (mat: string) => {
    if (!mat.trim()) return
    try {
      const r = await api.get<Funcionario>(`/funcionarios/busca/${mat}`)
      setFuncionario(r.data)
    } catch { toast.error('Funcionário não encontrado'); setFuncionario(null) }
  }

  const registrar = async () => {
    if (!produto) { toast.error('Informe o código do produto'); return }
    setLoading(true)
    try {
      await api.post('/movimentacoes', {
        tipo: modo, codigoProduto, matriculaFuncionario: matricula || undefined, quantidade
      })
      toast.success(`${modo === 'ENTRADA' ? 'Entrada' : 'Saída'} registrada com sucesso!`)
      limpar()
      carregarUltimas()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error
      toast.error(msg ?? 'Erro ao registrar')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Entrada / Saída de Materiais</h1>
        <p className="text-muted text-sm mt-1">F1 = Entrada &nbsp;|&nbsp; F2 = Saída &nbsp;|&nbsp; Esc = Limpar</p>
      </div>

      {/* Toggle modo */}
      <div className="flex gap-3">
        <button
          id="btn-entrada"
          onClick={() => { setModo('ENTRADA'); limpar() }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border transition-all duration-200 ${
            modo === 'ENTRADA'
              ? 'bg-success/20 border-success/50 text-success'
              : 'bg-transparent border-border text-muted hover:border-success/30 hover:text-success'
          }`}
        >
          <ArrowDownCircle size={20} /> ENTRADA (F1)
        </button>
        <button
          id="btn-saida"
          onClick={() => { setModo('SAIDA'); limpar() }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border transition-all duration-200 ${
            modo === 'SAIDA'
              ? 'bg-danger/20 border-danger/50 text-danger'
              : 'bg-transparent border-border text-muted hover:border-danger/30 hover:text-danger'
          }`}
        >
          <ArrowUpCircle size={20} /> SAÍDA (F2)
        </button>
      </div>

      {/* Formulário */}
      <div className="card space-y-4">
        {/* Código produto */}
        <div>
          <label className="text-xs text-muted mb-1.5 block font-medium">Código de Barras do Produto</label>
          <input
            ref={inputProdutoRef}
            id="input-codigo-produto"
            className="input-base font-mono"
            placeholder="Leia o código de barras ou digite..."
            value={codigoProduto}
            onChange={e => setCodigoProduto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') buscarProduto(codigoProduto) }}
            onBlur={() => { if (codigoProduto) buscarProduto(codigoProduto) }}
          />
          {produto && (
            <div className="mt-2 p-3 bg-accent/10 border border-accent/30 rounded-lg">
              <p className="text-white font-medium text-sm">{produto.nome}</p>
              <p className="text-muted text-xs mt-0.5">{formatBRL(produto.preco)} por unidade • {produto.categoria ?? 'Sem categoria'}</p>
            </div>
          )}
        </div>

        {/* Matrícula funcionario (somente saída) */}
        {modo === 'SAIDA' && (
          <div>
            <label className="text-xs text-muted mb-1.5 block font-medium">Matrícula do Funcionário (obrigatório)</label>
            <input
              id="input-matricula"
              className="input-base font-mono"
              placeholder="Leia o crachá ou digite a matrícula..."
              value={matricula}
              onChange={e => setMatricula(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') buscarFuncionario(matricula) }}
              onBlur={() => { if (matricula) buscarFuncionario(matricula) }}
            />
            {funcionario && (
              <div className="mt-2 p-3 bg-success/10 border border-success/30 rounded-lg">
                <p className="text-white font-medium text-sm">{funcionario.nome}</p>
                <p className="text-muted text-xs mt-0.5">{funcionario.setor ?? 'Sem setor'} • {funcionario.matricula}</p>
              </div>
            )}
          </div>
        )}

        {/* Quantidade */}
        <div>
          <label className="text-xs text-muted mb-1.5 block font-medium">Quantidade</label>
          <input
            id="input-quantidade"
            type="number" min={1}
            className="input-base w-32"
            value={quantidade}
            onChange={e => setQuantidade(Number(e.target.value))}
          />
        </div>

        {/* Preview valor */}
        {produto && (
          <div className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
            <span className="text-muted text-sm">Valor total</span>
            <span className="text-white font-bold">{formatBRL(produto.preco * quantidade)}</span>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 pt-2">
          <button id="btn-registrar" onClick={registrar} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <CheckCircle size={18} />
            {loading ? 'Registrando...' : 'Registrar (Enter)'}
          </button>
          <button id="btn-limpar" onClick={limpar} className="btn-ghost">Limpar (Esc)</button>
        </div>
      </div>

      {/* Últimas movimentações */}
      {ultimas.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3">Últimas Movimentações</h3>
          <div className="space-y-2">
            {ultimas.map(m => (
              <div key={m.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className={m.tipo === 'ENTRADA' ? 'badge-entrada' : 'badge-saida'}>{m.tipo}</span>
                  <span className="text-white">{m.produto.nome}</span>
                  {m.funcionario && <span className="text-muted text-xs">• {m.funcionario.nome}</span>}
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-muted text-xs">{formatDateTime(m.data)}</span>
                  <span className="text-white font-medium">x{m.quantidade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
