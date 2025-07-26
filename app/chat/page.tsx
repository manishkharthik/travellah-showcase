import React from 'react';
import dynamic from "next/dynamic";

const ChatPageClient = dynamic(() => import("./ChatPageClient"), { ssr: false });

export default function ChatPage() {
  return (
    <ChatPageClient />
  );
}