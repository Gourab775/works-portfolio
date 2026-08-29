import { useState, useRef, useEffect } from 'react'
import { useEditor } from '../context/EditorContext'

export default function HeroSection() {
  const { heroText, heroSubtitle, guiMode, setHeroText, setHeroSubtitle, setSelectedElement, theme } = useEditor()
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

        {editing === 'subtitle' ? (
          <input
            ref={inputRef}
            type="text"
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="text-lg md:text-xl text-center w-full bg-transparent border-b-2 border-indigo-500 outline-none pb-1 mt-4"
            style={{ color: theme.heroText }}
          />
        ) : (
          <p
            className={`text-lg md:text-xl max-w-2xl mx-auto ${guiMode ? 'cursor-pointer hover:opacity-80' : ''}`}
            style={{ color: theme.cardDesc, opacity: 0.9 }}
            onClick={(e) => {
              if (guiMode) {
                e.stopPropagation()
                setEditing('subtitle')
              }
            }}
          >
            {heroSubtitle}
          </p>
        )}

        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="h-px w-16" style={{ backgroundColor: theme.cardBorder }}></div>
          <div className="w-2 h-2 rotate-45" style={{ backgroundColor: theme.accentColor }}></div>
          <div className="h-px w-16" style={{ backgroundColor: theme.cardBorder }}></div>
        </div>
      </div>
    </section>
  )
}
