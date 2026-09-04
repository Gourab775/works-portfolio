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
      // Merge new default projects/categories that are missing in stored data (e.g. new Laocoon)
      let mergedProjects = data.projects
      const storedIds = new Set(data.projects.map(p => String(p.id)))
      const missing = defaultProjects.filter(p => !storedIds.has(String(p.id)))
      if (missing.length > 0) {
        console.log(`Merging ${missing.length} new default project(s) into stored data`)
        mergedProjects = [...data.projects, ...missing]
      }
      // Merge categories: add any default category not in stored (keep user custom)
      const expectedCats = ['All', ...new Set(defaultProjects.map(p => p.category))]
      let mergedCats = data.categories
      const missingCats = expectedCats.filter(c => !data.categories.includes(c))
      if (missingCats.length > 0) {
        mergedCats = [...data.categories, ...missingCats]
      }
      // Persist merged if changed
      const storedSectionOrder = Array.isArray(data.sectionOrder) && data.sectionOrder.length > 0 ? data.sectionOrder : null
      const expectedSections = ['hero', 'works']
      let mergedSections = storedSectionOrder || expectedSections
      // if stored missing any expected, add
      const missingSections = expectedSections.filter(s => !mergedSections.includes(s))
      if (missingSections.length > 0) mergedSections = [...mergedSections, ...missingSections]
      // filter out unknown
      mergedSections = mergedSections.filter(s => expectedSections.includes(s))
      if (mergedSections.length === 0) mergedSections = expectedSections

      if (missing.length > 0 || missingCats.length > 0 || !storedSectionOrder) {
        try {
          const toSave = {
            projects: mergedProjects,
            theme: { ...defaultTheme, ...(data.theme || {}) },
            heroText: typeof data.heroText === 'string' ? data.heroText : 'Works',
            heroSubtitle: typeof data.heroSubtitle === 'string' ? data.heroSubtitle : 'A collection of my best projects',
            categories: mergedCats,
            sectionOrder: mergedSections,
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
        } catch {}
      }
      return {
        projects: mergedProjects,
        theme: { ...defaultTheme, ...(data.theme || {}) },
        heroText: typeof data.heroText === 'string' ? data.heroText : 'Works',
        heroSubtitle: typeof data.heroSubtitle === 'string' ? data.heroSubtitle : 'A collection of my best projects',
        categories: mergedCats,
        sectionOrder: mergedSections,
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
  const defaultSectionOrder = ['hero', 'works']
  const [sectionOrder, setSectionOrder] = useState(stored?.sectionOrder || defaultSectionOrder)
  const [saveStatus, setSaveStatus] = useState('saved')
  const [pushStatus, setPushStatus] = useState('idle') // idle | pushing | pushed | error
  const [autoPush, setAutoPush] = useState(() => {
    try { return localStorage.getItem('works-by-gourab-auto-push') === 'true' } catch { return false }
  })
  const saveTimerRef = useRef(null)
  const pushTimerRef = useRef(null)

  // Auto-save with debounce
  useEffect(() => {
    setSaveStatus('saving')
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      const ok = saveToStorage({ projects, theme, heroText, heroSubtitle, categories, sectionOrder })
      setSaveStatus(ok ? 'saved' : 'error')
    }, 300)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [projects, theme, heroText, heroSubtitle, categories, sectionOrder])

  // Persist autoPush toggle
  useEffect(() => {
    try { localStorage.setItem('works-by-gourab-auto-push', String(autoPush)) } catch {}
  }, [autoPush])

  // Auto GitHub push after every change (when enabled) — debounced 2s
  const pushToGitHub = useCallback(async (payload) => {
    const data = payload || { projects, theme, heroText, heroSubtitle, categories, sectionOrder }
    setPushStatus('pushing')
    try {
      const res = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setPushStatus('pushed')
      setTimeout(() => setPushStatus('idle'), 2000)
      return true
    } catch (e) {
      console.error('Auto push failed, falling back to local save only', e)
      // still mark as pushed locally (since local save succeeded), but show error for GitHub
      setPushStatus('error')
      setTimeout(() => setPushStatus('idle'), 2500)
      return false
    }
  }, [projects, theme, heroText, heroSubtitle, categories])

  useEffect(() => {
    if (!autoPush) return
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
    pushTimerRef.current = setTimeout(() => {
      pushToGitHub()
    }, 2000)
    return () => { if (pushTimerRef.current) clearTimeout(pushTimerRef.current) }
  }, [projects, theme, heroText, heroSubtitle, categories, sectionOrder, autoPush, pushToGitHub])

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

  const moveProject = useCallback((id, direction) => {
    setProjects(prev => {
      const idx = prev.findIndex(p => p.id === id)
      if (idx === -1) return prev
      const newIdx = direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const arr = [...prev]
      const [moved] = arr.splice(idx, 1)
      arr.splice(newIdx, 0, moved)
      return arr
    })
  }, [])

  const reorderCategories = useCallback((oldIndex, newIndex) => {
    setCategories(prev => {
      // Keep 'All' always at 0
      const all = prev[0] === 'All' ? ['All'] : []
      const rest = prev[0] === 'All' ? prev.slice(1) : [...prev]
      const adjOld = prev[0] === 'All' ? oldIndex - 1 : oldIndex
      const adjNew = prev[0] === 'All' ? newIndex - 1 : newIndex
      if (adjOld < 0 || adjNew < 0 || adjOld >= rest.length || adjNew >= rest.length) return prev
      const [moved] = rest.splice(adjOld, 1)
      rest.splice(adjNew, 0, moved)
      return [...all, ...rest]
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
    setSectionOrder(defaultSectionOrder)
    setSaveStatus('saved')
  }, [])

  const forceSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    const ok = saveToStorage({ projects, theme, heroText, heroSubtitle, categories, sectionOrder })
    setSaveStatus(ok ? 'saved' : 'error')
    return ok
  }, [projects, theme, heroText, heroSubtitle, categories, sectionOrder])

  const reorderSections = useCallback((oldIndex, newIndex) => {
    setSectionOrder(prev => {
      const arr = [...prev]
      const [moved] = arr.splice(oldIndex, 1)
      arr.splice(newIndex, 0, moved)
      return arr
    })
  }, [])

  const moveSection = useCallback((id, direction) => {
    setSectionOrder(prev => {
      const idx = prev.findIndex(s => s === id)
      if (idx === -1) return prev
      const newIdx = direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const arr = [...prev]
      const [moved] = arr.splice(idx, 1)
      arr.splice(newIdx, 0, moved)
      return arr
    })
  }, [])

  return (
    <EditorContext.Provider value={{
      projects, theme, guiMode, selectedElement,
      heroText, heroSubtitle,
      categories, sectionOrder, saveStatus, pushStatus, autoPush,
      setHeroText, setHeroSubtitle,
      updateProject, addProject, removeProject,
      toggleProjectVisibility, reorderProjects, moveProject, reorderCategories, reorderSections, moveSection,
      updateTheme, toggleGuiMode, setSelectedElement,
      addCategory, removeCategory, renameCategory,
      resetAll, forceSave, pushToGitHub, setAutoPush,
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
