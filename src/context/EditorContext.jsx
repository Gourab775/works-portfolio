import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { defaultProjects, defaultTheme } from '../data/projects'

const EditorContext = createContext(null)

const STORAGE_KEY = 'works-by-gourab-data-v2'

const LEGACY_KEY = 'works-portfolio-data-v2'

function loadFromStorage() {
  try {
    // Migrate legacy key if new key empty but old exists
    const legacyRaw = localStorage.getItem(LEGACY_KEY)
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw && legacyRaw) {
      try {
        localStorage.setItem(STORAGE_KEY, legacyRaw)
        console.log('Migrated legacy storage to new key')
      } catch {}
    }
    const effectiveRaw = localStorage.getItem(STORAGE_KEY)
    if (effectiveRaw) {
      const data = JSON.parse(effectiveRaw)
      const hasProjects = Array.isArray(data.projects) && data.projects.length > 0
      const hasCategories = Array.isArray(data.categories) && data.categories.length > 0 && data.categories.includes('All')
      // Only reset if corrupted or very old (less than 6 projects = original old portfolio)
      const isCorrupted = !hasProjects || !hasCategories || data.projects.length < 6
      if (isCorrupted) {
        console.log('Corrupted/very old data, resetting to defaults')
        localStorage.removeItem(STORAGE_KEY)
        return null
      }
      // Keep user data as-is — any length (add/delete projects/categories) is preserved
      return {
        projects: data.projects,
        theme: { ...defaultTheme, ...(data.theme || {}) },
        heroText: typeof data.heroText === 'string' ? data.heroText : 'Works',
        heroSubtitle: typeof data.heroSubtitle === 'string' ? data.heroSubtitle : 'A collection of my best projects',
        categories: data.categories,
      }
    }
  } catch (e) {
    console.error('Failed to load from storage:', e)
  }
  return null
}

function saveToStorage(data) {
  try {
    const json = JSON.stringify(data)
    localStorage.setItem(STORAGE_KEY, json)
    return true
  } catch (e) {
    console.error('Failed to save to storage:', e)
    // Quota exceeded — try without thumbnails (biggest payload)
    if (e.name === 'QuotaExceededError' || e.code === 22 || String(e).includes('quota')) {
      try {
        const slim = {
          ...data,
          projects: data.projects.map(p => ({ ...p, thumbnail: p.thumbnail && p.thumbnail.startsWith('data:') && p.thumbnail.length > 50000 ? '' : p.thumbnail }))
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slim))
        console.warn('Saved slim version without large thumbnails due to quota')
        return true
      } catch (e2) {
        console.error('Slim save also failed:', e2)
      }
    }
    return false
  }
}

export function EditorProvider({ children }) {
  const stored = useRef(loadFromStorage()).current

  const [projects, setProjects] = useState(stored?.projects || defaultProjects)
  const [theme, setTheme] = useState(stored?.theme || defaultTheme)
  const [guiMode, setGuiMode] = useState(false)
  const [selectedElement, setSelectedElement] = useState(null)
  const [heroText, setHeroText] = useState(stored?.heroText || 'Works')
  const [heroSubtitle, setHeroSubtitle] = useState(stored?.heroSubtitle || 'A collection of my best projects')
  const [categories, setCategories] = useState(stored?.categories || ['All', ...new Set(defaultProjects.map(p => p.category))])
  const [saveStatus, setSaveStatus] = useState('saved')
  const saveTimerRef = useRef(null)

  // Auto-save with debounce
  useEffect(() => {
    setSaveStatus('saving')
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      const ok = saveToStorage({ projects, theme, heroText, heroSubtitle, categories })
      setSaveStatus(ok ? 'saved' : 'error')
    }, 300)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [projects, theme, heroText, heroSubtitle, categories])

  const updateProject = useCallback((id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const addProject = useCallback(() => {
    const newId = String(Date.now())
    setProjects(prev => [...prev, {
      id: newId,
      title: 'New Project',
      description: 'Project description here...',
      thumbnail: '',
      thumbnailType: 'image',
      category: categories.length > 1 ? categories[1] : 'Website',
      tech: ['HTML', 'CSS'],
      liveUrl: '#',
      githubUrl: '#',
      visible: true,
    }])
  }, [categories])

  const removeProject = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }, [])

  const toggleProjectVisibility = useCallback((id) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p))
  }, [])

  const reorderProjects = useCallback((oldIndex, newIndex) => {
    setProjects(prev => {
      const arr = [...prev]
      const [moved] = arr.splice(oldIndex, 1)
      arr.splice(newIndex, 0, moved)
      return arr
    })
  }, [])

  const updateTheme = useCallback((key, value) => {
    setTheme(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleGuiMode = useCallback(() => {
    setGuiMode(prev => !prev)
    setSelectedElement(null)
  }, [])

  const addCategory = useCallback((name) => {
    if (name && !categories.includes(name)) {
      setCategories(prev => [...prev, name])
    }
  }, [categories])

  const removeCategory = useCallback((name) => {
    if (name === 'All') return
    setCategories(prev => prev.filter(c => c !== name))
    setProjects(prev => prev.map(p => p.category === name ? { ...p, category: categories.find(c => c !== 'All' && c !== name) || 'Website' } : p))
  }, [categories])

  const renameCategory = useCallback((oldName, newName) => {
    if (!newName || oldName === 'All') return
    setCategories(prev => prev.map(c => c === oldName ? newName : c))
    setProjects(prev => prev.map(p => p.category === oldName ? { ...p, category: newName } : p))
  }, [])

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LEGACY_KEY)
    setProjects(defaultProjects)
    setTheme(defaultTheme)
    setHeroText('Works')
    setHeroSubtitle('A collection of my best projects')
    setCategories(['All', ...new Set(defaultProjects.map(p => p.category))])
    setSaveStatus('saved')
  }, [])

  const forceSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    const ok = saveToStorage({ projects, theme, heroText, heroSubtitle, categories })
    setSaveStatus(ok ? 'saved' : 'error')
    return ok
  }, [projects, theme, heroText, heroSubtitle, categories])

  return (
    <EditorContext.Provider value={{
      projects, theme, guiMode, selectedElement,
      heroText, heroSubtitle,
      categories, saveStatus,
      setHeroText, setHeroSubtitle,
      updateProject, addProject, removeProject,
      toggleProjectVisibility, reorderProjects,
      updateTheme, toggleGuiMode, setSelectedElement,
      addCategory, removeCategory, renameCategory,
      resetAll, forceSave,
    }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor must be used within EditorProvider')
  return ctx
}
