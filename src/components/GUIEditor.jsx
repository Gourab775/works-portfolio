import { useState } from 'react'
import { useEditor } from '../context/EditorContext'

export default function GUIEditor() {
  const {
    guiMode, toggleGuiMode, theme, updateTheme,
    heroText, heroSubtitle, setHeroText, setHeroSubtitle,
    projects, categories, addCategory, removeCategory, renameCategory,
    addProject, updateProject, removeProject, toggleProjectVisibility,
    saveStatus, forceSave, resetAll
  } = useEditor()

  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCat, setEditingCat] = useState(null)
  const [editCatVal, setEditCatVal] = useState('')
  const [expandedProject, setExpandedProject] = useState(null)
  const [showReset, setShowReset] = useState(false)

  const colorFields = [
    { key: 'heroBg', label: 'Hero BG' },
    { key: 'heroText', label: 'Hero Text' },
    { key: 'pageBg', label: 'Page BG' },
    { key: 'cardBg', label: 'Card BG' },
    { key: 'cardBorder', label: 'Card Border' },
    { key: 'cardText', label: 'Card Text' },
    { key: 'cardDesc', label: 'Desc Text' },
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
    // small delay to ensure localStorage write, then reload
    setTimeout(() => window.location.reload(), 400)
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

  // Thumbnail helpers
  const handleThumbUpload = (id, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const reader = new FileReader()
    reader.onload = (ev) => updateProject(id, { thumbnail: ev.target.result, thumbnailType: isVideo ? 'video' : 'image' })
    reader.readAsDataURL(file)
  }

  if (!guiMode) {
    return (
      <button
        onClick={toggleGuiMode}
        className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-full bg-black text-white text-sm font-medium shadow-lg hover:bg-zinc-800 transition flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Edit Mode
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/10 z-30" onClick={toggleGuiMode} />

      {/* KISS Panel */}
      <div className="fixed right-0 top-0 h-full w-[380px] bg-white z-40 flex flex-col shadow-2xl border-l border-zinc-200">
        {/* Header — KISS: title + close + save */}
        <div className="shrink-0 px-5 py-4 border-b border-zinc-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">Edit — Works by Gourab</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {saveStatus === 'saved' ? 'All changes saved' : saveStatus === 'saving' ? 'Saving…' : 'Save error'}
                <span className="mx-1">·</span>{projects.length} projects
              </p>
            </div>
            <button
              onClick={toggleGuiMode}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Primary Save Button — KISS: one clear action */}
          <button
            onClick={handleSaveAndRefresh}
            className="mt-4 w-full py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-800 transition flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Save & Refresh
          </button>
          <p className="text-[11px] text-zinc-400 text-center mt-2">Saves to browser and reloads page</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* HERO */}
          <section className="px-5 py-5 border-b border-zinc-100">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">Hero</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-600 block mb-1">Title</label>
                <input
                  value={heroText}
                  onChange={(e) => setHeroText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                  placeholder="Works"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-600 block mb-1">Subtitle</label>
                <input
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
                  placeholder="A collection of my best projects"
                />
              </div>
            </div>
          </section>

          {/* DESIGN */}
          <section className="px-5 py-5 border-b border-zinc-100">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">Design</h3>
            <div className="grid grid-cols-2 gap-3">
              {colorFields.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={(e) => updateTheme(key, e.target.value)}
                    className="w-8 h-8 rounded-md border border-zinc-200 p-0.5 cursor-pointer bg-white shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-zinc-500 leading-none">{label}</div>
                    <input
                      value={theme[key]}
                      onChange={(e) => updateTheme(key, e.target.value)}
                      className="w-full text-xs font-mono bg-transparent outline-none text-zinc-900 truncate"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="text-xs text-zinc-500 mb-2">Presets</div>
              <div className="grid grid-cols-4 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => Object.entries(p.colors).forEach(([k, v]) => updateTheme(k, v))}
                    className="p-2 rounded-lg border border-zinc-200 hover:border-black hover:bg-zinc-50 transition text-left group"
                  >
                    <div className="flex gap-1 mb-1.5">
                      {[p.colors.accentColor, p.colors.cardBg, p.colors.heroBg].map((c, i) => (
                        <div key={i} className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="text-xs font-medium text-zinc-900">{p.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* CATEGORIES */}
          <section className="px-5 py-5 border-b border-zinc-100">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">Categories</h3>
            <div className="flex gap-2 mb-3">
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="New category…"
                className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:border-black bg-white"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            <div className="space-y-1.5">
              {categories.map((cat) => {
                const count = projects.filter(p => p.category === cat).length
                return (
                  <div key={cat} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200">
                    {editingCat === cat ? (
                      <input
                        value={editCatVal}
                        onChange={(e) => setEditCatVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameCategory(cat)
                          if (e.key === 'Escape') setEditingCat(null)
                        }}
                        onBlur={() => handleRenameCategory(cat)}
                        autoFocus
                        className="flex-1 px-2 py-1 rounded border border-black outline-none text-sm bg-white"
                      />
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium text-zinc-900 truncate">{cat}</span>
                          <span className="text-xs text-zinc-500">{count}</span>
                        </div>
                        {cat !== 'All' && (
                          <div className="flex gap-1 ml-2">
                            <button onClick={() => { setEditingCat(cat); setEditCatVal(cat) }} className="px-2 py-1 rounded text-xs bg-white border border-zinc-200 hover:border-black">Rename</button>
                            <button onClick={() => removeCategory(cat)} className="px-2 py-1 rounded text-xs bg-white border border-zinc-200 hover:border-red-500 hover:text-red-600">Delete</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">“All” cannot be deleted. Deleting moves its projects to first category.</p>
          </section>

          {/* PROJECTS — KISS: everything editable here */}
          <section className="px-5 py-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Projects — {projects.length}</h3>
              <button onClick={addProject} className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-medium hover:bg-zinc-800">+ Add</button>
            </div>

            <div className="space-y-2">
              {projects.map((p, idx) => {
                const isOpen = expandedProject === p.id
                return (
                  <div key={p.id} className={`rounded-xl border ${isOpen ? 'border-black bg-white' : 'border-zinc-200 bg-zinc-50'} overflow-hidden`}>
                    {/* Row header — KISS */}
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <span className="text-xs text-zinc-400 w-6">#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-zinc-900 truncate">{p.title || 'Untitled'}</div>
                        <div className="text-xs text-zinc-500 truncate">{p.category} · {p.visible ? 'Visible' : 'Hidden'}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleProjectVisibility(p.id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${p.visible ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-amber-100 border-amber-200 text-amber-700'}`}
                        >
                          {p.visible ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => setExpandedProject(isOpen ? null : p.id)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center border ${isOpen ? 'bg-black text-white border-black' : 'bg-white border-zinc-200 text-zinc-600'}`}
                        >
                          {isOpen ? '−' : '+'}
                        </button>
                      </div>
                    </div>

                    {/* Expanded form — all fields */}
                    {isOpen && (
                      <div className="px-3 pb-4 pt-2 border-t border-zinc-200 space-y-3 bg-white">
                        <div className="grid grid-cols-1 gap-3">
                          <label className="block">
                            <span className="text-xs text-zinc-600">Title</span>
                            <input value={p.title} onChange={(e) => updateProject(p.id, { title: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:border-black bg-white" />
                          </label>
                          <label className="block">
                            <span className="text-xs text-zinc-600">Description</span>
                            <textarea value={p.description} onChange={(e) => updateProject(p.id, { description: e.target.value })} rows={2} className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:border-black bg-white resize-none" />
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                              <span className="text-xs text-zinc-600">Category</span>
                              <select value={p.category} onChange={(e) => updateProject(p.id, { category: e.target.value })} className="mt-1 w-full px-2 py-2 rounded-lg border border-zinc-200 text-sm bg-white outline-none focus:border-black">
                                {categories.filter(c => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </label>
                            <label className="block">
                              <span className="text-xs text-zinc-600">Visible</span>
                              <select value={String(p.visible)} onChange={(e) => updateProject(p.id, { visible: e.target.value === 'true' })} className="mt-1 w-full px-2 py-2 rounded-lg border border-zinc-200 text-sm bg-white outline-none focus:border-black">
                                <option value="true">Visible</option>
                                <option value="false">Hidden</option>
                              </select>
                            </label>
                          </div>

                          {/* Tech */}
                          <div>
                            <span className="text-xs text-zinc-600">Tech stack — click to edit, Enter to save, Backspace empty to delete</span>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {p.tech.map((t, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-900 text-white text-xs">
                                  <input
                                    defaultValue={t}
                                    onBlur={(e) => {
                                      const v = e.target.value.trim()
                                      if (v && v !== t) {
                                        const next = [...p.tech]; next[i] = v; updateProject(p.id, { tech: next })
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') e.target.blur()
                                      if (e.key === 'Backspace' && e.target.value === '' && p.tech.length > 1) {
                                        const next = p.tech.filter((_, idx) => idx !== i); updateProject(p.id, { tech: next })
                                      }
                                    }}
                                    className="bg-transparent outline-none w-20 text-center text-white"
                                  />
                                  <button onClick={() => { const next = p.tech.filter((_, idx) => idx !== i); updateProject(p.id, { tech: next }) }} className="ml-1 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">×</button>
                                </span>
                              ))}
                              <button onClick={() => updateProject(p.id, { tech: [...p.tech, 'New'] })} className="px-2 py-1 rounded-full border border-dashed border-zinc-300 text-xs hover:border-black">+ Add</button>
                            </div>
                          </div>

                          <label className="block">
                            <span className="text-xs text-zinc-600">Live URL</span>
                            <input value={p.liveUrl} onChange={(e) => updateProject(p.id, { liveUrl: e.target.value })} placeholder="https://..." className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:border-black bg-white font-mono" />
                          </label>
                          <label className="block">
                            <span className="text-xs text-zinc-600">GitHub URL</span>
                            <input value={p.githubUrl} onChange={(e) => updateProject(p.id, { githubUrl: e.target.value })} placeholder="https://github.com/..." className="mt-1 w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm outline-none focus:border-black bg-white font-mono" />
                          </label>

                          {/* Thumbnail — KISS + screenshot option */}
                          <div className="rounded-lg border border-zinc-200 p-3 bg-zinc-50">
                            <div className="text-xs font-medium text-zinc-900 mb-2">Thumbnail — website first look</div>
                            <div className="flex gap-2 mb-2">
                              <label className="flex-1 px-3 py-2 rounded-lg bg-white border border-zinc-200 text-xs font-medium hover:border-black cursor-pointer text-center">
                                📷 Upload image/video
                                <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleThumbUpload(p.id, e)} />
                              </label>
                              <button
                                onClick={() => updateProject(p.id, { thumbnail: '', thumbnailType: 'image' })}
                                className="px-3 py-2 rounded-lg bg-black text-white text-xs font-medium hover:bg-zinc-800"
                                title="Use auto screenshot from Live URL"
                              >
                                Auto SS
                              </button>
                            </div>
                            <input
                              value={p.thumbnail.startsWith('data:') ? '' : p.thumbnail}
                              onChange={(e) => updateProject(p.id, { thumbnail: e.target.value, thumbnailType: 'image' })}
                              placeholder="Or paste image URL… leave empty for auto screenshot"
                              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs outline-none focus:border-black bg-white font-mono"
                            />
                            <div className="mt-2 text-[11px] text-zinc-500">
                              {p.thumbnail ? 'Using uploaded / custom URL' : 'Using auto screenshot from Live URL (first look) — updates on Save & Refresh'}
                            </div>
                            {/* Preview */}
                            <div className="mt-2 aspect-[16/10] rounded-lg overflow-hidden bg-white border border-zinc-200">
                              {p.thumbnail ? (
                                p.thumbnailType === 'video' ? (
                                  <video src={p.thumbnail} className="w-full h-full object-cover" muted loop />
                                ) : (
                                  <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                                )
                              ) : p.liveUrl && p.liveUrl.startsWith('http') ? (
                                <img
                                  src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(p.liveUrl)}?w=600&h=400`}
                                  alt={`Screenshot of ${p.title}`}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    // fallback to thum.io
                                    e.target.src = `https://image.thum.io/get/width/600/crop/800/${p.liveUrl}`
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">No preview</div>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => { if (confirm(`Delete "${p.title}"?`)) removeProject(p.id) }}
                            className="w-full py-2 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50"
                          >
                            Delete project
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Footer — Reset + Save again */}
          <div className="px-5 py-5 bg-zinc-50 border-t border-zinc-200">
            <button
              onClick={handleSaveAndRefresh}
              className="w-full py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition shadow-sm"
            >
              Save & Refresh
            </button>
            <div className="mt-3">
              {showReset ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-medium text-amber-900">Reset everything to default?</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => { resetAll(); setShowReset(false); setTimeout(() => window.location.reload(), 300) }} className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-medium">Yes, reset</button>
                    <button onClick={() => setShowReset(false)} className="flex-1 py-2 rounded-lg bg-white border border-zinc-200 text-xs font-medium">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowReset(true)} className="w-full py-2 rounded-lg bg-white border border-zinc-200 text-zinc-600 text-xs font-medium hover:border-zinc-300">Reset to default</button>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 text-center mt-3">KISS — Keep It Simple, Stupid. All changes here. No extra tabs.</p>
          </div>
        </div>
      </div>
    </>
  )
}
