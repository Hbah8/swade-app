import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { CharacterBuilderPage } from '@/pages/CharacterBuilderPage'
import { RulesPage } from '@/pages/RulesPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/character" element={<CharacterBuilderPage />} />
        <Route path="/rules" element={<RulesPage />} />
      </Route>
    </Routes>
  )
}

export default App
