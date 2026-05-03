import { useEffect, useRef, useState } from 'react'
import { api, Configuracao } from '../lib/api'
import toast from 'react-hot-toast'
import { Upload } from 'lucide-react'

export function Configuracoes() {
  const [config, setConfig] = useState<Configuracao | null>(null)
  const [nome, setNome] = useState('')
  const [estoqueMinimo, setEstoqueMinimo] = useState(5)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get<Configuracao>('/configuracao').then(r => {
      setConfig(r.data); setNome(r.data.nomeEmpresa); setEstoqueMinimo(r.data.estoqueMinimo)
    })
  }, [])

  const salvar = async () => {
    setLoading(true)
    try {
      const r = await api.put<Configuracao>('/configuracao', { nomeEmpresa: nome, estoqueMinimo })
      setConfig(r.data)
      toast.success('Configurações salvas!')
    } catch { toast.error('Erro ao salvar') } finally { setLoading(false) }
  }

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo deve ter no máximo 2MB'); return }
    const fd = new FormData()
    fd.append('logo', file)
    try {
      const r = await api.post<Configuracao>('/configuracao/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setConfig(r.data)
      toast.success('Logo atualizado!')
    } catch { toast.error('Erro ao enviar logo') }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Configurações da Empresa</h1>
        <p className="text-muted text-sm mt-1">Personalize as informações da empresa</p>
      </div>

      <div className="card space-y-5">
        {/* Logo */}
        <div>
          <label className="text-xs text-muted mb-2 block font-medium">Logo da Empresa</label>
          <div className="flex items-center gap-4">
            {config?.logoPath ? (
              <img src={config.logoPath} alt="logo" className="w-16 h-16 rounded-lg object-cover border border-border" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-white/5 border border-border flex items-center justify-center text-muted text-xs">Sem logo</div>
            )}
            <button onClick={() => fileRef.current?.click()} className="btn-ghost flex items-center gap-2">
              <Upload size={16} /> Fazer Upload
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={uploadLogo} />
          </div>
          <p className="text-muted text-xs mt-2">PNG ou JPG, máx. 2MB</p>
        </div>

        {/* Nome */}
        <div>
          <label className="text-xs text-muted mb-1.5 block font-medium">Nome da Empresa</label>
          <input
            id="input-nome-empresa"
            className="input-base"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome da empresa"
          />
        </div>

        {/* Estoque mínimo */}
        <div>
          <label className="text-xs text-muted mb-1.5 block font-medium">Estoque Mínimo Padrão</label>
          <input
            id="input-estoque-minimo"
            type="number" min={0}
            className="input-base w-32"
            value={estoqueMinimo}
            onChange={e => setEstoqueMinimo(Number(e.target.value))}
          />
          <p className="text-muted text-xs mt-1">Produtos com saldo igual ou abaixo desse valor aparecerão em alerta no dashboard</p>
        </div>

        <button id="btn-salvar-config" onClick={salvar} disabled={loading} className="btn-primary">
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  )
}
