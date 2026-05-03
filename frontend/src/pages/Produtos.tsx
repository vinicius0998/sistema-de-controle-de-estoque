import { useEffect, useRef, useState } from 'react'
import { api, Produto } from '../lib/api'
import { formatBRL } from '../lib/utils'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'

export function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<number | null>(null)
  const [form, setForm] = useState({ codigo: '', nome: '', preco: 0, categoria: '' })
  const [editForm, setEditForm] = useState({ nome: '', preco: 0, categoria: '' })
  const [showForm, setShowForm] = useState(false)
  const codigoRef = useRef<HTMLInputElement>(null)

  const carregar = () => api.get<Produto[]>('/produtos').then(r => setProdutos(r.data))
  useEffect(() => { carregar() }, [])

  const salvar = async () => {
    if (!form.codigo || !form.nome) { toast.error('Código e nome são obrigatórios'); return }
    try {
      await api.post('/produtos', { ...form, preco: Number(form.preco) })
      toast.success('Produto cadastrado!')
      setForm({ codigo: '', nome: '', preco: 0, categoria: '' })
      setShowForm(false)
      carregar()
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Erro ao salvar')
    }
  }

  const atualizarInline = async (id: number) => {
    try {
      await api.put(`/produtos/${id}`, { ...editForm, preco: Number(editForm.preco) })
      toast.success('Produto atualizado!')
      setEditando(null)
      carregar()
    } catch { toast.error('Erro ao atualizar') }
  }

  const excluir = async (id: number) => {
    if (!confirm('Excluir este produto?')) return
    try { await api.delete(`/produtos/${id}`); toast.success('Excluído!'); carregar() }
    catch { toast.error('Não foi possível excluir (pode ter movimentações vinculadas)') }
  }

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) || p.codigo.includes(busca)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Produtos</h1>
          <p className="text-muted text-sm mt-1">{produtos.length} produto(s) cadastrado(s)</p>
        </div>
        <button id="btn-novo-produto" onClick={() => { setShowForm(!showForm); setTimeout(() => codigoRef.current?.focus(), 50) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-white">Novo Produto</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted mb-1 block">Código de Barras *</label>
              <input ref={codigoRef} className="input-base font-mono" placeholder="Leia ou digite..." value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Nome *</label>
              <input className="input-base" placeholder="Nome do produto" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Preço Unitário</label>
              <input type="number" step="0.01" min={0} className="input-base" value={form.preco} onChange={e => setForm(f => ({ ...f, preco: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Categoria</label>
              <input className="input-base" placeholder="Ex: Papelaria" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={salvar} className="btn-primary">Salvar</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancelar</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="mb-4">
          <input className="input-base w-72" placeholder="Buscar por nome ou código..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-xs uppercase tracking-wide">
                <th className="text-left py-3 px-2">Código</th>
                <th className="text-left py-3 px-2">Nome</th>
                <th className="text-left py-3 px-2">Categoria</th>
                <th className="text-right py-3 px-2">Preço</th>
                <th className="text-center py-3 px-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="py-3 px-2 font-mono text-xs text-muted">{p.codigo}</td>
                  {editando === p.id ? (
                    <>
                      <td className="py-2 px-2">
                        <input className="input-base" value={editForm.nome} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} />
                      </td>
                      <td className="py-2 px-2">
                        <input className="input-base" value={editForm.categoria} onChange={e => setEditForm(f => ({ ...f, categoria: e.target.value }))} />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" step="0.01" className="input-base" value={editForm.preco} onChange={e => setEditForm(f => ({ ...f, preco: Number(e.target.value) }))} />
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => atualizarInline(p.id)} className="text-success hover:text-success/80"><Check size={16} /></button>
                          <button onClick={() => setEditando(null)} className="text-muted hover:text-white"><X size={16} /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-2 text-white font-medium">{p.nome}</td>
                      <td className="py-3 px-2 text-muted">{p.categoria ?? '—'}</td>
                      <td className="py-3 px-2 text-right text-white">{formatBRL(p.preco)}</td>
                      <td className="py-3 px-2">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => { setEditando(p.id); setEditForm({ nome: p.nome, preco: p.preco, categoria: p.categoria ?? '' }) }} className="text-muted hover:text-accent"><Pencil size={15} /></button>
                          <button onClick={() => excluir(p.id)} className="text-muted hover:text-danger"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
