import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import SkillDetail from './pages/SkillDetail'
import ListSkill from './pages/ListSkill'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/skills/:id" element={<SkillDetail />} />
        <Route path="/list-skill" element={<ListSkill />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}