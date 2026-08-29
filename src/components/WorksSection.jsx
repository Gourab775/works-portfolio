import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { useEditor } from '../context/EditorContext'
import ProjectCard from './ProjectCard'

export default function WorksSection() {
  const { projects, reorderProjects, guiMode, theme, categories } = useEditor()
  const [filter, setFilter] = useState('All')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const baseProjects = guiMode ? projects : projects.filter(p => p.visible)
  const filteredProjects = filter === 'All'
    ? baseProjects
    : baseProjects.filter(p => p.category === filter)

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = projects.findIndex(p => p.id === active.id)
    const newIndex = projects.findIndex(p => p.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderProjects(oldIndex, newIndex)
    }
  }

  return (
    <section className="py-12 px-4 md:px-8 lg:px-12" style={{ backgroundColor: theme.pageBg }}>
      <div className="max-w-7xl mx-auto">
        {/* Filter Bar */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: filter === cat ? theme.accentColor : theme.tagBg,
                color: filter === cat ? '#fff' : theme.cardDesc,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: theme.cardDesc }}>
            Showing <span className="font-semibold" style={{ color: theme.cardText }}>{filteredProjects.length}</span> projects
            {guiMode && (
              <span className="ml-2 text-xs opacity-60">
                ({projects.filter(p => !p.visible).length} hidden)
              </span>
            )}
          </p>
          {guiMode && (
            <span className="text-xs px-2 py-1 rounded-md bg-indigo-600/20 text-indigo-400">
              GUI Mode — Click text to edit, drag to reorder
            </span>
          )}
        </div>

        {/* Project Grid - equal height cards */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={projects.map(p => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {filteredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: theme.cardDesc }}>No projects found in this category.</p>
          </div>
        )}
      </div>
    </section>
  )
}
