import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Movimentacao } from './pages/Movimentacao'
import { Produtos } from './pages/Produtos'
import { Funcionarios } from './pages/Funcionarios'
import { Historico } from './pages/Historico'
import { Relatorios } from './pages/Relatorios'
import { Configuracoes } from './pages/Configuracoes'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1d27', color: '#e2e8f0', border: '1px solid #2a2d3a' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#1a1d27' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1a1d27' } },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/movimentacao" element={<Movimentacao />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
