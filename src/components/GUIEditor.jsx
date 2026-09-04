import { useState } from 'react'
import { useEditor } from '../context/EditorContext'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableCategory({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1">
      <button {...attributes} {...listeners} className="w-7 h-7 rounded-lg bg-white border border-zinc-300 flex items-center justify-center text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 shrink-0 cursor-grab active:cursor-grabbing" title="Drag to move">⋮⋮</button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function SortableProjectRow({ id, children, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1">
      {!disabled && (
        <button {...attributes} {...listeners} className="w-7 h-7 rounded-lg bg-white border border-zinc-300 flex items-center justify-center text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 shrink-0 cursor-grab active:cursor-grabbing" title="Drag to move">⋮⋮</button>
      )}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

export default function GUIEditor() {
  const {
    guiMode, toggleGuiMode, theme, updateTheme,
    heroText, heroSubtitle, setHeroText, setHeroSubtitle,
    projects, categories, addCategory, removeCategory, renameCategory, reorderCategories,
    addProject, updateProject, removeProject, toggleProjectVisibility, reorderProjects, moveProject,
    saveStatus, pushStatus, autoPush, setAutoPush, forceSave, pushToGitHub, resetAll
  } = useEditor()

  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCat, setEditingCat] = useState(null)
  const [editCatVal, setEditCatVal] = useState('')
  const [expandedProject, setExpandedProject] = useState(null)
  const [showReset, setShowReset] = useState(false)
  const [projectSearch, setProjectSearch] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const colorFields = [
    { key: 'heroBg', label: 'Hero BG' },
    { key: 'heroText', label: 'Hero Text' },
    { key: 'pageBg', label: 'Page BG' },
    { key: 'cardBg', label: 'Card BG' },
    { key: 'cardBorder', label: 'Card Border' },
    { key: 'cardText', label: 'Card Text' },
    { key: 'cardDesc', label: 'Desc' },
    { key: 'accentColor', label: 'Accent' },
    { key: 'tagBg', label: 'Tag BG' },
    { key: 'tagText', label: 'Tag Text' },
  ]

  const presets = [
    { name: 'Dark', colors: { heroBg: '#0f0f0f', heroText: '#f5f5f5', pageBg: '#0a0a0a', cardBg: '#1a1a1a', cardBorder: '#2e2e2e', cardText: '#f0f0f0', cardDesc: '#b0b0b0', accentColor: '#6366f1', tagBg: '#252538', tagText: '#b4b8f7' } },
    { name: 'Light', colors: { heroBg: '#ffffff', heroText: '#0a0a0a', pageBg: '#f8f8f8', cardBg: '#ffffff', cardBorder: '#e5e7eb', cardText: '#0a0a0a', cardDesc: '#6b7280', accentColor: '#000000', tagBg: '#f3f4f6', tagText: '#374151' } },
    { name: 'Midnight', colors: { heroBg: '#0f172a', heroText: '#f1f5f9', pageBg: '#020617', cardBg: '#1e293b', cardBorder: '#334155', cardText: '#e2e8f0', cardDesc: '#94a3b8', accentColor: '#8b5cf6', tagBg: '#1e1b4b', tagText: '#c4b5fd' } },
    { name: 'Paper', colors: { heroBg: '#fafaf9', heroText: '#1c1917', pageBg: '#f5f5f4', cardBg: '#ffffff', cardBorder: '#e7e5e4', cardText: '#1c1917', cardDesc: '#78716c', accentColor: '#ea580c', tagBg: '#fff7ed', tagText: '#9a3412' } },
  ]

  const handleSaveAndRefresh = () => {
    const ok = forceSave()
    if (ok) {
      setTimeout(() => window.location.reload(), 300)
    } else {
      alert('Save failed — storage full. Try removing large thumbnails (Auto SS) or deleting some projects.')
    }
  }

  const handlePushNow = async () => {
    const ok = forceSave()
    if (!ok) { alert('Save failed, cannot push'); return }
    const pushed = await pushToGitHub()
    if (pushed) alert('Pushed to GitHub (if /api/push configured). Check Vercel logs for real push.')
  }

  const handleAddCategory = () => {
    const name = newCategoryName.trim()
    if (name) { addCategory(name); setNewCategoryName('') }
  }

  const handleRenameCategory = (oldName) => {
    const newName = editCatVal.trim()
    if (newName && newName !== oldName) renameCategory(oldName, newName)
    setEditingCat(null)
    setEditCatVal('')
  }

  const handleThumbUpload = (id, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const reader = new FileReader()
    reader.onload = (ev) => updateProject(id, { thumbnail: ev.target.result, thumbnailType: isVideo ? 'video' : 'image' })
    reader.readAsDataURL(file)
  }

  const handleCategoryDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = categories.findIndex(c => c === active.id)
    const newIndex = categories.findIndex(c => c === over.id)
    if (oldIndex !== -1 && newIndex !== -1) reorderCategories(oldIndex, newIndex)
  }

  const handleProjectDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = projects.findIndex(p => p.id === active.id)
    const newIndex = projects.findIndex(p => p.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) reorderProjects(oldIndex, newIndex)
  }

  const filteredProjects = projectSearch
    ? projects.filter(p => p.title.toLowerCase().includes(projectSearch.toLowerCase()) || p.category.toLowerCase().includes(projectSearch.toLowerCase()))
    : projects

  const isSearching = !!projectSearch

  if (!guiMode) {
    return (
      <button
        onClick={toggleGuiMode}
        className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-full bg-zinc-900 text-white text-sm font-semibold shadow-xl hover:bg-black transition flex items-center gap-2 border border-white/10"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Edit Mode — Move anything
      </button>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-[2px] z-30" onClick={toggleGuiMode} />
      <div className="fixed right-0 top-0 h-full w-[400px] bg-zinc-50 z-40 flex flex-col shadow-2xl border-l border-zinc-300">
        <div className="shrink-0 px-5 py-4 bg-white border-b border-zinc-300 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-5 bg-zinc-900 rounded-full" />
                Works by Gourab — Edit & Move
              </h2>
              <p className="text-xs font-medium mt-1 flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${saveStatus === 'saved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : saveStatus === 'saving' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-500' : saveStatus === 'saving' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                  {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving…' : 'Error'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${pushStatus === 'pushed' ? 'bg-sky-50 text-sky-700 border-sky-200' : pushStatus === 'pushing' ? 'bg-amber-50 text-amber-700 border-amber-200' : pushStatus === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
                  {pushStatus === 'pushing' ? 'Pushing…' : pushStatus === 'pushed' ? 'Pushed ✓' : pushStatus === 'error' ? 'Push failed' : 'GitHub idle'}
                </span>
                <span className="text-zinc-600">{projects.length} projects</span>
              </p>
            </div>
            <button onClick={toggleGuiMode} className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-black flex items-center justify-center text-white transition shrink-0">✕</button>
          </div>

          <button onClick={handleSaveAndRefresh} className="mt-4 w-full py-3 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-black transition flex items-center justify-center gap-2 shadow-md active:scale-[0.98]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save & Refresh
          </button>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={handlePushNow} className="py-2.5 rounded-xl bg-white border-2 border-zinc-900 text-zinc-900 text-xs font-bold hover:bg-zinc-50 shadow-sm flex items-center justify-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Push to GitHub
            </button>
            <label className="py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:border-zinc-900">
              <input type="checkbox" checked={autoPush} onChange={(e) => setAutoPush(e.target.checked)} className="w-3.5 h-3.5 accent-zinc-900" />
              Auto Push
            </label>
          </div>
          <p className="text-[11px] font-medium text-zinc-500 text-center mt-2">Har change ke baad {autoPush ? 'auto' : 'manual'} GitHub push • Drag ⋮⋮ se move karo</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <section className="bg-white rounded-2xl border border-zinc-300 shadow-sm p-4">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs">H</span>
              Hero — drag nahi, text move nahi needed
            </h3>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-semibold text-zinc-800 block mb-1.5">Title</span>
                <input value={heroText} onChange={(e) => setHeroText(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 bg-white" placeholder="Works" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-zinc-800 block mb-1.5">Subtitle</span>
                <input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 bg-white" placeholder="A collection..." />
              </label>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-zinc-300 shadow-sm p-4">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs">◈</span>
              Design — move nahi, color pick
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {colorFields.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300 transition shadow-sm">
                  <input type="color" value={theme[key]} onChange={(e) => updateTheme(key, e.target.value)} className="w-9 h-9 rounded-lg border border-zinc-300 p-1 cursor-pointer bg-white shrink-0 shadow-sm" title={label} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-zinc-700 leading-none">{label}</div>
                    <input value={theme[key]} onChange={(e) => updateTheme(key, e.target.value)} className="w-full text-xs font-mono font-medium bg-white mt-1 px-1.5 py-1 rounded-md border border-zinc-200 outline-none focus:border-zinc-900 text-zinc-900" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-200">
              <div className="text-xs font-bold text-zinc-900 mb-2.5">Presets — 1 click</div>
              <div className="grid grid-cols-4 gap-2">
                {presets.map((p) => (
                  <button key={p.name} onClick={() => Object.entries(p.colors).forEach(([k, v]) => updateTheme(k, v))} className="p-2.5 rounded-xl border border-zinc-300 bg-zinc-50 hover:bg-white hover:border-zinc-900 hover:shadow-md transition text-left">
                    <div className="flex gap-1 mb-2">
                      {[p.colors.accentColor, p.colors.cardBg, p.colors.heroBg].map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="text-xs font-bold text-zinc-900">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-zinc-300 shadow-sm p-4">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">↕</span>
              Categories — drag ⋮⋮ to move
            </h3>
            <div className="flex gap-2 mb-3">
              <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} placeholder="New category…" className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 bg-white" />
              <button onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed shadow-sm">Add</button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
              <SortableContext items={categories} strategy={verticalListSortingStrategy}>
                <div className="space-y-1.5">
                  {categories.map((cat) => {
                    const count = projects.filter(p => p.category === cat).length
                    if (cat === 'All') {
                      return (
                        <div key={cat} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-900 text-white border border-zinc-900 shadow-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-sm font-bold truncate">{cat}</span>
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/20 border border-white/20">{count}</span>
                          </div>
                          <span className="text-[11px] font-medium text-white/60">Locked — drag disabled</span>
                        </div>
                      )
                    }
                    return (
                      <SortableCategory key={cat} id={cat}>
                        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 shadow-sm hover:border-zinc-900 transition">
                          {editingCat === cat ? (
                            <input value={editCatVal} onChange={(e) => setEditCatVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleRenameCategory(cat); if (e.key === 'Escape') setEditingCat(null) }} onBlur={() => handleRenameCategory(cat)} autoFocus className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-900 outline-none text-sm font-medium bg-white text-zinc-900" />
                          ) : (
                            <>
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-sm font-semibold text-zinc-900 truncate">{cat}</span>
                                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">{count}</span>
                              </div>
                              <div className="flex gap-1 ml-2 shrink-0">
                                <button onClick={() => { setEditingCat(cat); setEditCatVal(cat) }} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-zinc-300 hover:border-zinc-900 hover:bg-zinc-50">Rename</button>
                                <button onClick={() => removeCategory(cat)} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-zinc-300 hover:border-red-600 hover:text-red-600 hover:bg-red-50">Delete</button>
                              </div>
                            </>
                          )}
                        </div>
                      </SortableCategory>
                    )
                  })}
                </div>
              </SortableContext>
            </DndContext>
            <p className="text-[11px] font-medium text-zinc-500 mt-3 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">Drag ⋮⋮ to reorder — “All” always first. Har category ko move kar sakte ho.</p>
          </section>

          <section className="bg-white rounded-2xl border border-zinc-300 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs">≡</span>
                Projects — drag ⋮⋮ or ▲▼ to move
              </h3>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-zinc-900 text-white">{filteredProjects.length}/{projects.length}</span>
            </div>

            <div className="flex gap-2 mb-3">
              <input value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} placeholder="Search to filter… drag disabled while searching" className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 bg-white" />
              <button onClick={addProject} className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-black shadow-sm whitespace-nowrap">+ Add</button>
            </div>
            {isSearching && <p className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">Searching — drag to move disabled. Clear search to reorder.</p>}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProjectDragEnd}>
              <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                  {filteredProjects.map((p) => {
                    const actualIdx = projects.findIndex(x => x.id === p.id)
                    const isOpen = expandedProject === p.id
                    return (
                      <SortableProjectRow key={p.id} id={p.id} disabled={isSearching}>
                        <div className={`rounded-xl border-2 overflow-hidden transition ${isOpen ? 'border-zinc-900 bg-white shadow-md' : 'border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300 shadow-sm'}`}>
                          <div className="flex items-center gap-2 px-3 py-3">
                            <span className="text-xs font-bold text-white bg-zinc-900 w-6 h-6 rounded-full flex items-center justify-center shrink-0">{actualIdx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-zinc-900 truncate">{p.title || 'Untitled'}</div>
                              <div className="text-xs font-medium text-zinc-600 truncate flex items-center gap-1.5 mt-0.5">
                                <span className="px-1.5 py-0.5 rounded-full bg-white border border-zinc-300 text-[11px]">{p.category}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold border ${p.visible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{p.visible ? 'Visible' : 'Hidden'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <div className="hidden sm:flex flex-col gap-1 mr-1">
                                <button onClick={() => moveProject(p.id, 'up')} disabled={actualIdx === 0} className="w-6 h-6 rounded bg-white border border-zinc-300 flex items-center justify-center hover:border-zinc-900 disabled:opacity-30 text-xs">▲</button>
                                <button onClick={() => moveProject(p.id, 'down')} disabled={actualIdx === projects.length - 1} className="w-6 h-6 rounded bg-white border border-zinc-300 flex items-center justify-center hover:border-zinc-900 disabled:opacity-30 text-xs">▼</button>
                              </div>
                              <button onClick={() => toggleProjectVisibility(p.id)} className={`px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${p.visible ? 'bg-white border-zinc-300 text-zinc-700 hover:border-zinc-900' : 'bg-amber-500 border-amber-600 text-white hover:bg-amber-600'}`}>{p.visible ? 'Hide' : 'Show'}</button>
                              <button onClick={() => setExpandedProject(isOpen ? null : p.id)} className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm shadow-sm ${isOpen ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-300 text-zinc-700 hover:border-zinc-900'}`}>{isOpen ? '−' : '+'}</button>
                            </div>
                          </div>

                          {isOpen && (
                            <div className="px-3.5 pb-4 pt-3 border-t-2 border-zinc-900 space-y-3 bg-white">
                              <label className="block">
                                <span className="text-xs font-bold text-zinc-800 block mb-1">Title</span>
                                <input value={p.title} onChange={(e) => updateProject(p.id, { title: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 bg-white" />
                              </label>
                              <label className="block">
                                <span className="text-xs font-bold text-zinc-800 block mb-1">Description</span>
                                <textarea value={p.description} onChange={(e) => updateProject(p.id, { description: e.target.value })} rows={2} className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 bg-white resize-none" />
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                <label className="block">
                                  <span className="text-xs font-bold text-zinc-800 block mb-1">Category</span>
                                  <select value={p.category} onChange={(e) => updateProject(p.id, { category: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold bg-white outline-none focus:border-zinc-900 text-zinc-900">
                                    {categories.filter(c => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
                                  </select>
                                </label>
                                <label className="block">
                                  <span className="text-xs font-bold text-zinc-800 block mb-1">Visible</span>
                                  <select value={String(p.visible)} onChange={(e) => updateProject(p.id, { visible: e.target.value === 'true' })} className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 text-sm font-semibold bg-white outline-none focus:border-zinc-900 text-zinc-900">
                                    <option value="true">Visible</option>
                                    <option value="false">Hidden</option>
                                  </select>
                                </label>
                              </div>

                              <div>
                                <span className="text-xs font-bold text-zinc-800 block mb-1.5">Tech stack</span>
                                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-zinc-300 bg-zinc-50">
                                  {p.tech.map((t, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-full bg-zinc-900 text-white text-xs font-semibold shadow-sm">
                                      <input defaultValue={t} onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== t) { const next = [...p.tech]; next[i] = v; updateProject(p.id, { tech: next }) } }} onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Backspace' && e.target.value === '' && p.tech.length > 1) { const next = p.tech.filter((_, idx) => idx !== i); updateProject(p.id, { tech: next }) } }} className="bg-transparent outline-none w-20 text-center text-white placeholder-white/60 font-semibold" />
                                      <button onClick={() => { const next = p.tech.filter((_, idx) => idx !== i); updateProject(p.id, { tech: next }) }} className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 text-white">×</button>
                                    </span>
                                  ))}
                                  <button onClick={() => updateProject(p.id, { tech: [...p.tech, 'New'] })} className="px-3 py-1 rounded-full bg-white border border-zinc-300 text-xs font-bold hover:border-zinc-900 hover:bg-zinc-50 shadow-sm">+ Add</button>
                                </div>
                              </div>

                              <label className="block">
                                <span className="text-xs font-bold text-zinc-800 block mb-1">Live URL</span>
                                <input value={p.liveUrl} onChange={(e) => updateProject(p.id, { liveUrl: e.target.value })} placeholder="https://..." className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-mono font-medium outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 bg-white text-zinc-900" />
                              </label>
                              <label className="block">
                                <span className="text-xs font-bold text-zinc-800 block mb-1">GitHub URL</span>
                                <input value={p.githubUrl} onChange={(e) => updateProject(p.id, { githubUrl: e.target.value })} placeholder="https://github.com/..." className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-mono font-medium outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 bg-white text-zinc-900" />
                              </label>

                              <div className="rounded-xl border-2 border-zinc-900 p-3 bg-zinc-50">
                                <div className="text-xs font-bold text-zinc-900 mb-2">📸 Thumbnail — auto screenshot</div>
                                <div className="flex gap-2 mb-2.5">
                                  <label className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs font-bold hover:border-zinc-900 hover:bg-zinc-50 cursor-pointer text-center shadow-sm text-zinc-900">
                                    Upload image/video
                                    <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleThumbUpload(p.id, e)} />
                                  </label>
                                  <button onClick={() => updateProject(p.id, { thumbnail: '', thumbnailType: 'image' })} className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-black shadow-sm">Auto SS</button>
                                </div>
                                <input value={p.thumbnail.startsWith('data:') ? '' : p.thumbnail} onChange={(e) => updateProject(p.id, { thumbnail: e.target.value, thumbnailType: 'image' })} placeholder="Paste image URL or leave empty for auto" className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono font-medium outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 bg-white text-zinc-900" />
                                <div className={`mt-2 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border ${p.thumbnail ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sky-50 text-sky-700 border-sky-200'}`}>{p.thumbnail ? '✓ Custom thumbnail' : '◯ Auto screenshot from Live URL'}</div>
                                <div className="mt-2 aspect-[16/10] rounded-xl overflow-hidden bg-white border-2 border-zinc-200 shadow-sm">
                                  {p.thumbnail ? (
                                    p.thumbnailType === 'video' ? <video src={p.thumbnail} className="w-full h-full object-cover" muted loop /> : <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                                  ) : p.liveUrl && p.liveUrl.startsWith('http') ? (
                                    <img src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(p.liveUrl)}?w=600&h=400`} alt={`Screenshot of ${p.title}`} className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.target.src = `https://image.thum.io/get/width/600/crop/800/${p.liveUrl}` }} />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">No preview</div>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => moveProject(p.id, 'up')} disabled={actualIdx === 0} className="py-2 rounded-xl bg-white border border-zinc-300 text-xs font-bold hover:border-zinc-900 disabled:opacity-30 flex items-center justify-center gap-1">▲ Up</button>
                                <button onClick={() => moveProject(p.id, 'down')} disabled={actualIdx === projects.length - 1} className="py-2 rounded-xl bg-white border border-zinc-300 text-xs font-bold hover:border-zinc-900 disabled:opacity-30 flex items-center justify-center gap-1">▼ Down</button>
                                <button onClick={() => { if (confirm(`Delete "${p.title}"?`)) removeProject(p.id) }} className="py-2 rounded-xl border-2 border-red-300 text-red-700 bg-red-50 text-xs font-bold hover:bg-red-100">Delete</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </SortableProjectRow>
                    )
                  })}
                  {filteredProjects.length === 0 && (
                    <div className="text-center py-8 px-4 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50">
                      <p className="text-sm font-semibold text-zinc-700">No projects found</p>
                      <p className="text-xs text-zinc-500 mt-1">Try another search term</p>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
            <p className="text-[11px] font-medium text-zinc-500 mt-3 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">Drag ⋮⋮ or ▲▼ to move — har project ko move kar sakte ho. Search clear karo for drag. Website grid pe bhi drag karo.</p>
          </section>
        </div>

        <div className="shrink-0 px-4 py-4 bg-white border-t-2 border-zinc-900 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          <button onClick={handleSaveAndRefresh} className="w-full py-3.5 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-black transition shadow-md active:scale-[0.99] flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save & Refresh
          </button>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button onClick={handlePushNow} className="py-2.5 rounded-xl bg-white border-2 border-zinc-900 text-zinc-900 text-xs font-bold hover:bg-zinc-50 shadow-sm">Push to GitHub</button>
            <label className="py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:border-zinc-900">
              <input type="checkbox" checked={autoPush} onChange={(e) => setAutoPush(e.target.checked)} className="w-3.5 h-3.5 accent-zinc-900" />
              Auto Push
            </label>
          </div>
          <div className="mt-3">
            {showReset ? (
              <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
                <p className="text-xs font-bold text-amber-900">Reset everything to default?</p>
                <div className="flex gap-2 mt-2.5">
                  <button onClick={() => { resetAll(); setShowReset(false); setTimeout(() => window.location.reload(), 300) }} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm">Yes, reset</button>
                  <button onClick={() => setShowReset(false)} className="flex-1 py-2 rounded-xl bg-white border-2 border-zinc-300 text-xs font-bold hover:border-zinc-900">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowReset(true)} className="w-full py-2 rounded-xl bg-zinc-100 border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-white hover:border-zinc-400">Reset to default</button>
            )}
          </div>
          <p className="text-[11px] font-medium text-zinc-500 text-center mt-3">Har cheez move kar sakte ho — Save ke baad {autoPush ? 'auto push' : 'Push to GitHub dabao'}.</p>
        </div>
      </div>
    </>
  )
}
