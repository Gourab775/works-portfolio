import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEditor } from '../context/EditorContext'

function InlineEdit({ editing, field, value, className, Tag = 'span', guiMode, theme, onStartEdit, onSave, onCancel }) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing === field && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing, field])

  if (editing === field) {
    return (
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onBlur={(e) => onSave(field, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave(field, e.target.value)
          if (e.key === 'Escape') onCancel()
        }}
        className={`${className} bg-transparent border-b-2 border-indigo-500 outline-none w-full`}
        style={{ color: theme.cardText }}
      />
    )
  }

  return (
    <Tag
      className={`${className} ${guiMode ? 'cursor-pointer hover:opacity-80' : ''}`}
      style={{ color: Tag === 'p' ? theme.cardDesc : theme.cardText }}
      onClick={(e) => {
        if (guiMode) {
          e.stopPropagation()
          onStartEdit(field)
        }
      }}
    >
      {value || 'Click to edit'}
    </Tag>
  )
}

export default function ProjectCard({ project }) {
  const { guiMode, updateProject, removeProject, toggleProjectVisibility, theme } = useEditor()
  const [editing, setEditing] = useState(null)
  const [editTagIndex, setEditTagIndex] = useState(null)

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: project.id, disabled: !guiMode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSave = (field, value) => {
    updateProject(project.id, { [field]: value })
    setEditing(null)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const isVideo = file.type.startsWith('video/')
      const reader = new FileReader()
      reader.onload = (ev) => {
        updateProject(project.id, {
          thumbnail: ev.target.result,
          thumbnailType: isVideo ? 'video' : 'image'
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTagEdit = (index, newValue) => {
    const newTags = [...project.tech]
    newTags[index] = newValue
    updateProject(project.id, { tech: newTags })
    setEditTagIndex(null)
  }

  const handleTagKeyDown = (e, index, value) => {
    if (e.key === 'Enter') handleTagEdit(index, value)
    if (e.key === 'Escape') setEditTagIndex(null)
    if (e.key === 'Backspace' && value === '' && project.tech.length > 1) {
      const newTags = project.tech.filter((_, i) => i !== index)
      updateProject(project.id, { tech: newTags })
      setEditTagIndex(null)
    }
  }

  const addTag = () => {
    const newTags = [...project.tech, 'New Tech']
    updateProject(project.id, { tech: newTags })
    setEditTagIndex(newTags.length - 1)
  }

  const removeTag = (index) => {
    const newTags = project.tech.filter((_, i) => i !== index)
    updateProject(project.id, { tech: newTags })
  }

  const isVideo = project.thumbnailType === 'video' && project.thumbnail

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl overflow-hidden transition-all duration-300 flex flex-col ${guiMode ? 'gui-hoverable' : ''} ${isDragging ? 'z-50 shadow-2xl' : ''} ${!project.visible ? 'opacity-40 hover:opacity-70' : ''}`}
    >
      {/* GUI Controls */}
      {guiMode && (
        <div className="absolute top-2 right-2 z-20 flex gap-1">
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 bg-black/70 rounded-md text-white text-xs hover:bg-indigo-600 cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M2 12h20M7 7l5-5 5 5M7 17l5 5 5-5M17 7l5 5-5 5M7 7l-5 5 5 5"/>
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleProjectVisibility(project.id) }}
            className={`p-1.5 rounded-md text-white text-xs hover:opacity-80 ${project.visible ? 'bg-green-600/80' : 'bg-amber-500 animate-pulse'}`}
            title={project.visible ? 'Hide project' : 'Show project'}
          >
            {project.visible ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); removeProject(project.id) }}
            className="p-1.5 bg-red-600/80 rounded-md text-white text-xs hover:bg-red-500"
            title="Delete project"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Hidden Banner */}
      {!project.visible && guiMode && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-5 py-4 text-center">
            <p className="text-amber-400 text-sm font-bold mb-2 tracking-wide uppercase">Hidden</p>
            <button
              onClick={(e) => { e.stopPropagation(); toggleProjectVisibility(project.id) }}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Show Again
            </button>
          </div>
        </div>
      )}

      {/* Thumbnail */}
      <div
        className="relative aspect-[16/10] overflow-hidden shrink-0"
        style={{ backgroundColor: theme.tagBg }}
      >
        {project.thumbnail ? (
          isVideo ? (
            <video
              src={project.thumbnail}
              className="w-full h-full object-cover"
              loop
              muted
              onMouseEnter={(e) => e.target.play()}
              onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0 }}
            />
          ) : (
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 opacity-20" style={{ color: theme.cardDesc }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}

        {isVideo && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-black/60 text-white backdrop-blur-sm flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Video
            </span>
          </div>
        )}

        {guiMode && (
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <div className="flex gap-2">
              <span className="text-white text-sm bg-indigo-600 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-indigo-500 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                Image
              </span>
              <span className="text-white text-sm bg-purple-600 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-purple-500 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                Video
              </span>
            </div>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        )}

        <div className="absolute top-3 left-3">
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: `${theme.accentColor}30`, color: theme.accentColor }}
          >
            <InlineEdit
              editing={editing}
              field="category"
              value={project.category}
              className=""
              guiMode={guiMode}
              theme={theme}
              onStartEdit={setEditing}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1" style={{ backgroundColor: theme.cardBg, borderTop: `1px solid ${theme.cardBorder}` }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <InlineEdit
            editing={editing}
            field="title"
            value={project.title}
            className="text-lg font-semibold leading-tight block"
            Tag="h3"
            guiMode={guiMode}
            theme={theme}
            onStartEdit={setEditing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </div>

        <div className="mb-3 min-h-[2.5rem]">
          <InlineEdit
            editing={editing}
            field="description"
            value={project.description}
            className="text-sm leading-relaxed block line-clamp-2"
            Tag="p"
            guiMode={guiMode}
            theme={theme}
            onStartEdit={setEditing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </div>

        {/* Tech Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech.map((t, i) => (
            <span
              key={i}
              className="relative text-xs px-2 py-0.5 rounded-md group/tag"
              style={{ backgroundColor: theme.tagBg, color: theme.tagText }}
            >
              {editTagIndex === i ? (
                <input
                  type="text"
                  defaultValue={t}
                  onBlur={(e) => handleTagEdit(i, e.target.value)}
                  onKeyDown={(e) => handleTagKeyDown(e, i, e.target.value)}
                  className="bg-transparent border-b border-indigo-400 outline-none w-16 text-center"
                  style={{ color: theme.tagText }}
                  autoFocus
                />
              ) : (
                <span
                  className={guiMode ? 'cursor-pointer' : ''}
                  onClick={(e) => {
                    if (guiMode) {
                      e.stopPropagation()
                      setEditTagIndex(i)
                    }
                  }}
                >
                  {t}
                </span>
              )}
              {guiMode && editTagIndex !== i && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeTag(i) }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover/tag:opacity-100 transition-opacity hover:bg-red-400"
                  title="Remove tag"
                >
                  x
                </button>
              )}
            </span>
          ))}
          {guiMode && (
            <button
              onClick={(e) => { e.stopPropagation(); addTag() }}
              className="text-xs px-2 py-0.5 rounded-md border border-dashed hover:border-indigo-500 transition-colors"
              style={{ borderColor: theme.cardBorder, color: theme.cardDesc }}
            >
              + Add
            </button>
          )}
        </div>

        {/* URLs */}
        {guiMode && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs w-16 shrink-0" style={{ color: theme.cardDesc }}>Live URL</span>
              <input
                type="text"
                value={project.liveUrl}
                onChange={(e) => updateProject(project.id, { liveUrl: e.target.value })}
                className="flex-1 text-xs px-2 py-1 rounded border outline-none focus:border-indigo-500"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.cardText }}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16 shrink-0" style={{ color: theme.cardDesc }}>GitHub</span>
              <input
                type="text"
                value={project.githubUrl}
                onChange={(e) => updateProject(project.id, { githubUrl: e.target.value })}
                className="flex-1 text-xs px-2 py-1 rounded border outline-none focus:border-indigo-500"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, color: theme.cardText }}
                placeholder="https://github.com/..."
              />
            </div>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex gap-2">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2 px-3 rounded-lg text-sm font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: theme.accentColor, color: '#fff' }}
            >
              Live Demo
            </a>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-lg text-sm font-medium transition-all border hover:opacity-80 flex items-center gap-1.5"
              style={{ borderColor: theme.cardBorder, color: theme.cardText }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
