'use client';
import React from 'react';
import { useState } from 'react';
import ChatPage from './ChatPage';
import Tasks from './Tasks';

export default function ChatWithTasksView({ tripId, tripName }: { tripId: string; tripName: string }) {
  const [view, setView] = useState<'chat' | 'tasks'>('chat');

  return (
    <>
      {view === 'chat' && <ChatPage tripId={tripId} tripName={tripName} goToTasks={() => setView('tasks')} />}
      {view === 'tasks' && <Tasks tripId={tripId} />}
    </>
  );
}
