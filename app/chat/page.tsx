import React from 'react';
import dynamic from "next/dynamic";
import { Suspense } from 'react';

const ChatPageClient = dynamic(() => import("./ChatPageClient"), { ssr: false });

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatPageClient />
    </Suspense>
  );
}