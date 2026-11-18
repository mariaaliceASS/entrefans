import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './components/PublicLayout'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import EsqueciSenha from './pages/EsqueciSenha'
import RedefinirSenha from './pages/RedefinirSenha'
import Termos from './pages/Termos'
import Contato from './pages/Contato'
import Fandoms from './pages/Fandoms'
import FandomDetalhe from './pages/FandomDetalhe'
import Mural from './pages/Mural'
import RoleDetalhe from './pages/RoleDetalhe'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Explorar from './pages/Explorar'
import PerfilUsuario from './pages/PerfilUsuario'
import Conexoes from './pages/Conexoes'
import MeuPerfil from './pages/MeuPerfil'
import Roles from './pages/Roles'
import Agenda from './pages/Agenda'

/** "/" mostra o Descobrir para quem está logado; visitante cai na lista pública de fandoms. */
function Inicio() {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-10 text-center text-on-surface-variant">Carregando…</div>
  return user ? <ProtectedRoute /> : <Navigate to="/fandoms" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Públicas: janela de login/cadastro */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      {/* Públicas: com cabeçalho e rodapé */}
      <Route element={<PublicLayout />}>
        <Route path="/fandoms" element={<Fandoms />} />
        <Route path="/fandom/:id" element={<FandomDetalhe />} />
        <Route path="/mural" element={<Mural />} />
        <Route path="/role/:id" element={<RoleDetalhe />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/contato" element={<Contato />} />
      </Route>
      {/* Exigem login */}
      <Route element={<Inicio />}><Route path="/" element={<Home />} /></Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/u/:id" element={<PerfilUsuario />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/conexoes" element={<Conexoes />} />
        <Route path="/perfil" element={<MeuPerfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
