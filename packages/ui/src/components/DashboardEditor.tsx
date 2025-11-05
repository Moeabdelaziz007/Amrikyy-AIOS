import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { cn } from '../utils';
import SystemStatusWidget, { SystemStatus } from './SystemStatusWidget';

export interface DashboardWidget {
  id: string;
  type: 'system-status' | 'agent-canvas' | 'notifications' | 'custom';
  title: string;
  data?: any;
  size: 'small' | 'medium' | 'large';
  position: number;
}

export interface DashboardEditorProps {
  widgets: DashboardWidget[];
  onWidgetsChange: (widgets: DashboardWidget[]) => void;
  systemStatus?: SystemStatus;
  className?: string;
}

interface SortableWidgetProps {
  widget: DashboardWidget;
  systemStatus?: SystemStatus;
}

const SortableWidget: React.FC<SortableWidgetProps> = ({ widget, systemStatus }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1',
    large: 'col-span-2 row-span-2',
  };

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'system-status':
        return systemStatus ? (
          <SystemStatusWidget systemStatus={systemStatus} />
        ) : (
          <div className="p-4 text-center text-gray-500">
            System status data not available
          </div>
        );
      case 'notifications':
        return (
          <div className="p-4">
            <h4 className="font-semibold mb-2">Notifications</h4>
            <div className="text-sm text-gray-500">
              No new notifications
            </div>
          </div>
        );
      case 'agent-canvas':
        return (
          <div className="p-4">
            <h4 className="font-semibold mb-2">Agent Canvas</h4>
            <div className="text-sm text-gray-500">
              Agent workflow canvas
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4">
            <h4 className="font-semibold mb-2">{widget.title}</h4>
            <div className="text-sm text-gray-500">
              Custom widget content
            </div>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-lg border bg-white shadow-sm transition-all',
        sizeClasses[widget.size],
        isDragging && 'opacity-50 rotate-2 scale-105 shadow-lg'
      )}
    >
      <div
        className={cn(
          'absolute top-2 right-2 cursor-move p-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors',
          isDragging && 'bg-blue-200'
        )}
        {...attributes}
        {...listeners}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </div>
      
      <div className="h-full overflow-hidden">
        {renderWidgetContent()}
      </div>
    </div>
  );
};

const DashboardEditor: React.FC<DashboardEditorProps> = ({
  widgets,
  onWidgetsChange,
  systemStatus,
  className,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex(widget => widget.id === active.id);
      const newIndex = widgets.findIndex(widget => widget.id === over?.id);

      const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex).map((widget, index) => ({
        ...widget,
        position: index,
      }));

      onWidgetsChange(reorderedWidgets);
    }

    setActiveId(null);
  };

  const sortedWidgets = [...widgets].sort((a, b) => a.position - b.position);
  const activeWidget = widgets.find(widget => widget.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min',
        className
      )}>
        <SortableContext items={sortedWidgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
          {sortedWidgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              systemStatus={systemStatus}
            />
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeWidget && (
          <div className="transform rotate-2 scale-105 opacity-90">
            <SortableWidget
              widget={activeWidget}
              systemStatus={systemStatus}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default DashboardEditor;
