import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, ArrowLeftRight, Package, Users,
  History, BarChart2, Settings, Menu, X, Barcode
} from 'lucide-react'
import { api, Configuracao } from '../lib/api'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/movimentacao', icon: ArrowLeftRight, label: 'Entrada / Saída' },
  { to: '/produtos', icon: Package, label: 'Produtos' },
  { to: '/funcionarios', icon: Users, label: 'Funcionários' },
  { to: '/historico', icon: History, label: 'Histórico' },
  { to: '/relatorios', icon: BarChart2, label: 'Relatórios' },
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
]

export function Layout() {
  const [config, setConfig] = useState<Configuracao | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    api.get<Configuracao>('/configuracao').then(r => setConfig(r.data)).catch(() => {})
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-60' : 'w-16'
        } flex-shrink-0 bg-surface border-r border-border flex flex-col transition-all duration-300`}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
          {config?.logoPath ? (
            <img src={config.logoPath} alt="logo" className="w-8 h-8 rounded object-cover" />
          ) : (
            <div className="w-8 h-8 bg-accent/20 border border-accent/40 rounded flex items-center justify-center">
              <Barcode size={16} className="text-accent" />
            </div>
          )}
          {sidebarOpen && (
            <span className="font-semibold text-sm text-white truncate">
              {config?.nomeEmpresa ?? 'Minha Empresa'}
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-muted hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-t border-border">
            <p className="text-xs text-muted">Controle de Estoque v1.0</p>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
