import { useEffect } from 'react'
import { EditorProvider, useEditor } from './context/EditorContext'
import HeroSection from './components/HeroSection'
import WorksSection from './components/WorksSection'
import GUIEditor from './components/GUIEditor'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableSection({ id, children, guiMode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !guiMode })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }
  return (
    <div ref={setNodeRef} style={style} className="relative">
      {guiMode && (
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5">
          <button {...attributes} {...listeners} className="px-2 py-1 rounded-full bg-zinc-900 text-white text-xs font-bold shadow-md cursor-grab active:cursor-grabbing flex items-center gap-1" title="Drag to move section">
            ⋮⋮ Move
          </button>
          <span className="px-2 py-1 rounded-full bg-white border border-zinc-300 text-xs font-bold text-zinc-700 shadow-sm capitalize">{id}</span>
        </div>
      )}
      <div className={guiMode ? 'pt-8' : ''}>{children}</div>
    </div>
  )
}

function AppContent() {
  const { guiMode, theme, sectionOrder, reorderSections } = useEditor()

  useEffect(() => {
    document.body.style.backgroundColor = theme.pageBg
    document.body.style.color = theme.cardText
    document.documentElement.style.backgroundColor = theme.pageBg
  }, [theme.pageBg, theme.cardText])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleSectionDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sectionOrder.findIndex(s => s === active.id)
    const newIndex = sectionOrder.findIndex(s => s === over.id)
    if (oldIndex !== -1 && newIndex !== -1) reorderSections(oldIndex, newIndex)
  }

  const sectionMap = {
    hero: <HeroSection key="hero" />,
    works: <WorksSection key="works" />,
  }

  return (
    <div
      className={`min-h-screen ${guiMode ? 'gui-mode' : ''}`}
      style={{ backgroundColor: theme.pageBg, color: theme.cardText }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          {sectionOrder.map((id) => (
            <SortableSection key={id} id={id} guiMode={guiMode}>
              {sectionMap[id]}
            </SortableSection>
          ))}
        </SortableContext>
      </DndContext>
      <GUIEditor />
      {guiMode && (
        <div className="fixed bottom-6 left-6 z-50 px-3 py-2 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold shadow-md">
          Drag ⋮⋮ Move on each section • also use GUI → Sections to reorder
        </div>
      )}
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
