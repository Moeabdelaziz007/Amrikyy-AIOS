import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KomabiThemeProvider, useKomabiTheme } from './theme/useTheme';
import { Button } from './components/Button';
import { Card, CardHeader, CardTitle, CardContent } from './components/Card';
import { SystemStatusWidget } from './components/SystemStatusWidget';
import { NotificationCenter } from './components/Notification';

const initialItems = [
  { id: 'status', content: <SystemStatusWidget cpuUsage={30} memoryUsage={55} fps={60} /> },
  { id: 'welcome', content: <Card><CardHeader><CardTitle>Welcome</CardTitle></CardHeader><CardContent><p>This is a draggable widget.</p></CardContent></Card> },
  { id: 'actions', content: <Card><CardHeader><CardTitle>Actions</CardTitle></CardHeader><CardContent><Button>Click Me</Button></CardContent></Card> },
];

const SortableItem = ({ id, children }: { id: string, children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const Dashboard = () => {
  const [items, setItems] = useState(initialItems);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { theme, setTheme } = useKomabiTheme();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addNotification = () => {
    const newNotif = { id: `notif-${Date.now()}`, title: 'New Event', message: 'Something happened!', type: 'info' as const };
    setNotifications(n => [...n, newNotif]);
  };

  return (
    <div className={`p-8 min-h-screen bg-background text-foreground`}>
        <NotificationCenter notifications={notifications} onDismiss={(id) => setNotifications(n => n.filter(notif => notif.id !== id))} />
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Komabi UI Dashboard</h1>
            <div>
                <Button onClick={addNotification} variant="outline">Add Notification</Button>
                <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="ml-4">
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </Button>
            </div>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map(({ id, content }) => (
                    <SortableItem key={id} id={id}>{content}</SortableItem>
                ))}
                </div>
            </SortableContext>
        </DndContext>
    </div>
  );
};

export const DemoDashboard = () => (
    <KomabiThemeProvider>
        <Dashboard />
    </KomabiThemeProvider>
);
