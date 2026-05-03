import { useEffect, useRef, useState } from 'react'
import { api, Funcionario } from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'

export function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<number | null>(null)
  const [form, setForm] = useState({ matricula: '', nome: '', setor: '' })
  const [editForm, setEditForm] = useState({ nome: '', setor: '' })
  const [showForm, setShowForm] = useState(false)
  const matriculaRef = useRef<HTMLInputElement>(null)

  const carregar = () => api.get<Funcionario[]>('/funcionarios').then(r => setFuncionarios(r.data))
  useEffect(() => { carregar() }, [])

  const salvar = async () => {
    if (!form.matricula || !form.nome) { toast.error('Matrícula e nome são obrigatórios'); return }
    try {
      await api.post('/funcionarios', form)
      toast.success('Funcionário cadastrado!')
      setForm({ matricula: '', nome: '', setor: '' })
      setShowForm(false)
      carregar()
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Erro ao salvar')
    }
  }

  const atualizarInline = async (id: number) => {
    try {
      await api.put(`/funcionarios/${id}`, editForm)
      toast.success('Funcionário atualizado!')
      setEditando(null); carregar()
    } catch { toast.error('Erro ao atualizar') }
  }

  const excluir = async (id: number) => {
    if (!confirm('Excluir este funcionário?')) return
    try { await api.delete(`/funcionarios/${id}`); toast.success('Excluído!'); carregar() }
    catch { toast.error('Não foi possível excluir') }
  }

  const filtrados = funcionarios.filter(f =>
    f.nome.toLowerCase().includes(busca.toLowerCase()) || f.matricula.includes(busca)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Funcionários</h1>
          <p className="text-muted text-sm mt-1">{funcionarios.length} funcionário(s) cadastrado(s)</p>
        </div>
        <button id="btn-novo-func" onClick={() => { setShowForm(!showForm); setTimeout(() => matriculaRef.current?.focus(), 50) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Novo Funcionário
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-white">Novo Funcionário</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted mb-1 block">Matrícula *</label>
              <input ref={matriculaRef} className="input-base font-mono" placeholder="Leia o crachá..." value={form.matricula} onChange={e => setForm(f => ({ ...f, matricula: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Nome *</label>
              <input className="input-base" placeholder="Nome completo" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Setor</label>
              <input className="input-base" placeholder="Ex: TI" value={form.setor} onChange={e => setForm(f => ({ ...f, setor: e.target.value }))} />
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
          <input className="input-base w-72" placeholder="Buscar por nome ou matrícula..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted text-xs uppercase tracking-wide">
                <th className="text-left py-3 px-2">Matrícula</th>
                <th className="text-left py-3 px-2">Nome</th>
                <th className="text-left py-3 px-2">Setor</th>
                <th className="text-center py-3 px-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(f => (
                <tr key={f.id} className="table-row">
                  <td className="py-3 px-2 font-mono text-xs text-muted">{f.matricula}</td>
                  {editando === f.id ? (
                    <>
                      <td className="py-2 px-2"><input className="input-base" value={editForm.nome} onChange={e => setEditForm(ef => ({ ...ef, nome: e.target.value }))} /></td>
                      <td className="py-2 px-2"><input className="input-base" value={editForm.setor} onChange={e => setEditForm(ef => ({ ...ef, setor: e.target.value }))} /></td>
                      <td className="py-2 px-2">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => atualizarInline(f.id)} className="text-success hover:text-success/80"><Check size={16} /></button>
                          <button onClick={() => setEditando(null)} className="text-muted hover:text-white"><X size={16} /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-2 text-white font-medium">{f.nome}</td>
                      <td className="py-3 px-2 text-muted">{f.setor ?? '—'}</td>
                      <td className="py-3 px-2">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => { setEditando(f.id); setEditForm({ nome: f.nome, setor: f.setor ?? '' }) }} className="text-muted hover:text-accent"><Pencil size={15} /></button>
                          <button onClick={() => excluir(f.id)} className="text-muted hover:text-danger"><Trash2 size={15} /></button>
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
