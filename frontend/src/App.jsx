import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import JDParser from './pages/JDParser'
import Ability from './pages/Ability'
import Roadmap from './pages/Roadmap'
import ResumeOptimizer from './pages/ResumeOptimizer'
import Interview from './pages/Interview'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="jd-parser" element={<JDParser />} />
        <Route path="ability" element={<Ability />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="resume" element={<ResumeOptimizer />} />
        <Route path="interview" element={<Interview />} />
      </Route>
    </Routes>
  )
}

export default App
