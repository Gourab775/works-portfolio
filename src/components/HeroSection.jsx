import { useState, useRef, useEffect } from 'react'
import { useEditor } from '../context/EditorContext'

export default function HeroSection() {
  const { heroText, guiMode, setHeroText, setSelectedElement, theme } = useEditor()
  const [editing, setEditing] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleSave = () => {
    setEditing(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setEditing(null)
  }

  return (
    <section
      className={`relative py-24 md:py-32 text-center ${guiMode ? 'gui-hoverable' : ''}`}
      style={{ backgroundColor: theme.heroBg }}
      onClick={(e) => {
        if (guiMode) {
          e.stopPropagation()
          setSelectedElement?.('hero')
        }
      }}
    >
      <div className="max-w-4xl mx-auto px-4">
        {editing === 'title' ? (
          <input
            ref={inputRef}
            type="text"
            value={heroText}
            onChange={(e) => setHeroText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-center w-full bg-transparent border-b-2 border-indigo-500 outline-none pb-2"
            style={{ color: theme.heroText }}
          />
        ) : (
          <h1
            className={`text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 ${guiMode ? 'cursor-pointer hover:opacity-80' : ''}`}
            style={{ color: theme.heroText }}
            onClick={(e) => {
              if (guiMode) {
                e.stopPropagation()
                setEditing('title')
              }
            }}
          >
            {heroText}
          </h1>
        )}




      </div>
    </section>
  )
}
