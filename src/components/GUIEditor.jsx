import { useState } from 'react'
import { useEditor } from '../context/EditorContext'

export default function GUIEditor() {
  const { guiMode, toggleGuiMode, theme, updateTheme, addProject, projects, categories, addCategory, removeCategory, renameCategory, resetAll, saveStatus, forceSave } = useEditor()
  const [activeTab, setActiveTab] = useState('theme')
  const [collapsed, setCollapsed] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [editCategoryValue, setEditCategoryValue] = useState('')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const colorFields = [
    { key: 'heroBg', label: 'Hero Background' },
    { key: 'heroText', label: 'Hero Text' },
    { key: 'pageBg', label: 'Page Background' },
    { key: 'cardBg', label: 'Card Background' },
    { key: 'cardBorder', label: 'Card Border' },
    { key: 'cardText', label: 'Card Text' },
    { key: 'cardDesc', label: 'Description Text' },
    { key: 'accentColor', label: 'Accent Color' },
    { key: 'tagBg', label: 'Tag Background' },
    { key: 'tagText', label: 'Tag Text' },
  ]

  const tabs = [
    { id: 'theme', label: 'Theme' },
    { id: 'categories', label: 'Categories' },
    { id: 'projects', label: 'Projects' },
    { id: 'tips', label: 'Tips' },
  ]

  const handleAddCategory = () => {
    const name = newCategoryName.trim()
    if (name) {
      addCategory(name)
      setNewCategoryName('')
    }
  }

  const handleRenameCategory = (oldName) => {
    const newName = editCategoryValue.trim()
    if (newName && newName !== oldName) {
      renameCategory(oldName, newName)
    }
    setEditingCategory(null)
    setEditCategoryValue('')
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleGuiMode}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-medium text-sm shadow-lg transition-all hover:scale-105 ${
          guiMode
            ? 'bg-indigo-600 text-white shadow-indigo-500/30'
            : 'bg-white text-gray-900 shadow-black/10 border border-gray-200'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {guiMode ? (
            <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
          ) : (
            <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></>
          )}
        </svg>
        {guiMode ? 'Exit GUI Mode' : 'Edit Mode'}
      </button>

      {/* Editor Panel */}
      {guiMode && (
        <div
          className={`fixed right-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ${
            collapsed ? 'w-12' : 'w-80'
          }`}
          style={{ backgroundColor: '#1a1a2e', borderLeft: '1px solid #2a2a4a' }}
        >
          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-indigo-600 rounded-l-md flex items-center justify-center text-white text-xs hover:bg-indigo-500 z-50"
          >
            {collapsed ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            )}
          </button>

          {!collapsed && (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-sm">GUI Editor</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      saveStatus === 'saved' ? 'bg-green-600/20 text-green-400' :
                      saveStatus === 'saving' ? 'bg-yellow-600/20 text-yellow-400' :
                      'bg-red-600/20 text-red-400'
                    }`}>
                      {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Error'}
                    </span>
                    <button
                      onClick={forceSave}
                      className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                      title="Force save now"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mt-0.5">Click any element to edit</p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-700/50">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/10'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'none' }}>
                {activeTab === 'theme' && (
                  <>
                    <div>
                      <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Colors</h4>
                      <div className="space-y-2.5">
                        {colorFields.map(({ key, label }) => (
                          <div key={key} className="flex items-center justify-between">
                            <label className="text-gray-300 text-xs">{label}</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={theme[key]}
                                onChange={(e) => updateTheme(key, e.target.value)}
                                className="w-7 h-7 rounded-md border border-gray-600 cursor-pointer bg-transparent"
                              />
                              <input
                                type="text"
                                value={theme[key]}
                                onChange={(e) => updateTheme(key, e.target.value)}
                                className="w-20 text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 border border-gray-700 outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-700/50">
                      <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Presets</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: 'Dark', colors: { heroBg: '#0f0f0f', heroText: '#f5f5f5', pageBg: '#0a0a0a', cardBg: '#1a1a1a', cardBorder: '#2e2e2e', cardText: '#f0f0f0', cardDesc: '#b0b0b0', accentColor: '#6366f1', tagBg: '#252538', tagText: '#b4b8f7' }},
                          { name: 'Midnight', colors: { heroBg: '#0f172a', heroText: '#f1f5f9', pageBg: '#020617', cardBg: '#1e293b', cardBorder: '#334155', cardText: '#e2e8f0', cardDesc: '#94a3b8', accentColor: '#8b5cf6', tagBg: '#1e1b4b', tagText: '#c4b5fd' }},
                          { name: 'Forest', colors: { heroBg: '#052e16', heroText: '#f0fdf4', pageBg: '#022c22', cardBg: '#14532d', cardBorder: '#166534', cardText: '#dcfce7', cardDesc: '#86efac', accentColor: '#22c55e', tagBg: '#064e3b', tagText: '#6ee7b7' }},
                          { name: 'Ocean', colors: { heroBg: '#0c1929', heroText: '#f0f9ff', pageBg: '#082f49', cardBg: '#075985', cardBorder: '#0369a1', cardText: '#e0f2fe', cardDesc: '#7dd3fc', accentColor: '#0ea5e9', tagBg: '#0c4a6e', tagText: '#7dd3fc' }},
                          { name: 'Sunset', colors: { heroBg: '#1c1917', heroText: '#fef3c7', pageBg: '#1c1917', cardBg: '#292524', cardBorder: '#44403c', cardText: '#fef3c7', cardDesc: '#fbbf24', accentColor: '#f97316', tagBg: '#431407', tagText: '#fdba74' }},
                          { name: 'Rose', colors: { heroBg: '#1a0a14', heroText: '#fff1f2', pageBg: '#130810', cardBg: '#2d1224', cardBorder: '#4a1942', cardText: '#ffe4e6', cardDesc: '#fda4af', accentColor: '#f43f5e', tagBg: '#4c0519', tagText: '#fda4af' }},
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => Object.entries(preset.colors).forEach(([k, v]) => updateTheme(k, v))}
                            className="p-2 rounded-lg border border-gray-700 hover:border-indigo-500 transition-colors text-left"
                          >
                            <div className="flex gap-1 mb-1">
                              {[preset.colors.accentColor, preset.colors.cardBg, preset.colors.heroBg].map((c, i) => (
                                <div key={i} className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: c }} />
                              ))}
                            </div>
                            <span className="text-gray-300 text-xs">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-700/50">
                      {showResetConfirm ? (
                        <div className="space-y-2">
                          <p className="text-amber-400 text-xs">Reset everything to default?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { resetAll(); setShowResetConfirm(false) }}
                              className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-500"
                            >
                              Yes, Reset
                            </button>
                            <button
                              onClick={() => setShowResetConfirm(false)}
                              className="flex-1 py-1.5 rounded-lg bg-gray-700 text-white text-xs font-medium hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowResetConfirm(true)}
                          className="w-full py-2 rounded-lg border border-gray-700 text-gray-400 text-xs font-medium hover:border-red-500 hover:text-red-400 transition-colors"
                        >
                          Reset to Default
                        </button>
                      )}
                    </div>
                  </>
                )}

                {activeTab === 'categories' && (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                        placeholder="New category name..."
                        className="flex-1 text-sm px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 outline-none focus:border-indigo-500 placeholder-gray-500"
                      />
                      <button
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim()}
                        className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {categories.map((cat) => {
                        const count = projects.filter(p => p.category === cat).length
                        return (
                          <div
                            key={cat}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800/40 border border-gray-700/40 group"
                          >
                            {editingCategory === cat ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={editCategoryValue}
                                  onChange={(e) => setEditCategoryValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameCategory(cat)
                                    if (e.key === 'Escape') setEditingCategory(null)
                                  }}
                                  onBlur={() => handleRenameCategory(cat)}
                                  autoFocus
                                  className="flex-1 text-sm px-2 py-1 rounded bg-gray-900 text-white border border-indigo-500 outline-none"
                                />
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: theme.accentColor }}
                                  />
                                  <span className="text-white text-sm">{cat}</span>
                                  <span className="text-gray-400 text-xs">{count}</span>
                                </div>
                                {cat !== 'All' && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => { setEditingCategory(cat); setEditCategoryValue(cat) }}
                                      className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                      title="Rename"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                    </button>
                                    <button
                                      onClick={() => removeCategory(cat)}
                                      className="p-1 rounded hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors"
                                      title="Delete"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <p className="text-xs text-gray-500 pt-2">
                      "All" cannot be deleted. Deleting a category moves its projects to the first available category.
                    </p>
                  </>
                )}

                {activeTab === 'projects' && (
                  <>
                    <button
                      onClick={addProject}
                      className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Add New Project
                    </button>

                    <div className="space-y-2">
                      {projects.map((p, i) => (
                        <div
                          key={p.id}
                          className="p-3 rounded-lg border border-gray-700/50 bg-gray-800/30"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-gray-500 text-xs w-5">#{i + 1}</span>
                              <span className="text-white text-sm truncate">{p.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-300">
                                {p.category}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${p.visible ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                                {p.visible ? 'Visible' : 'Hidden'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === 'tips' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg border border-gray-700/50 bg-gray-800/30">
                      <h4 className="text-white text-xs font-semibold mb-2">Quick Tips</h4>
                      <ul className="space-y-1.5 text-xs text-gray-300">
                        <li>- Click any text to edit inline</li>
                        <li>- Hover cards to see drag handle</li>
                        <li>- Use eye button to show/hide projects</li>
                        <li>- Use X button to delete projects</li>
                        <li>- Click tags to edit, backspace to delete</li>
                        <li>- Upload images or videos for thumbnails</li>
                        <li>- URLs are editable in the card directly</li>
                        <li>- Add/rename/delete categories in Categories tab</li>
                        <li>- Switch to Theme tab for color presets</li>
                        <li>- All changes auto-save to browser</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg border border-gray-700/50 bg-gray-800/30">
                      <h4 className="text-white text-xs font-semibold mb-2">Stats</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 rounded bg-gray-900/50">
                          <div className="text-indigo-400 text-lg font-bold">{projects.length}</div>
                          <div className="text-gray-400 text-xs">Total</div>
                        </div>
                        <div className="text-center p-2 rounded bg-gray-900/50">
                          <div className="text-green-400 text-lg font-bold">{projects.filter(p => p.visible).length}</div>
                          <div className="text-gray-400 text-xs">Visible</div>
                        </div>
                        <div className="text-center p-2 rounded bg-gray-900/50">
                          <div className="text-blue-400 text-lg font-bold">{categories.length - 1}</div>
                          <div className="text-gray-400 text-xs">Categories</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
