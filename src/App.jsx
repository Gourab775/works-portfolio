import { useEffect } from 'react'
import { EditorProvider, useEditor } from './context/EditorContext'
import HeroSection from './components/HeroSection'
import WorksSection from './components/WorksSection'
import GUIEditor from './components/GUIEditor'

function AppContent() {
  const { guiMode, theme } = useEditor()

  useEffect(() => {
    document.body.style.backgroundColor = theme.pageBg
    document.body.style.color = theme.cardText
    document.documentElement.style.backgroundColor = theme.pageBg
  }, [theme.pageBg, theme.cardText])

  return (
    <div
      className={`min-h-screen ${guiMode ? 'gui-mode' : ''}`}
      style={{ backgroundColor: theme.pageBg, color: theme.cardText }}
    >
      <HeroSection />
      <WorksSection />
      <GUIEditor />
    </div>
  )
}

export default function App() {
  return (
    <EditorProvider>
      <AppContent />
    </EditorProvider>
  )
}
