"use client";

import React from "react";
import { useRef, useEffect, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { ExtendedPoll } from "@/app/types/poll";
import PollVoting from "./PollFeatures/PollVoting";

interface User {
  id: number;
  username: string;
  name: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: number;
  sender: User;
  type?: string;
  replyTo?: {
    id: string;
    sender: User;
    content: string;
  };
}

export default function ChatPage({ tripName, tripId, goToTasks }: { tripName: string | null; tripId: string | null; goToTasks: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [selectedPoll, setSelectedPoll] = useState<ExtendedPoll | null>(null);

  {/* Fetch user */}
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (res.ok) {
          setCurrentUser(data)
        } else {
          console.error("Failed to fetch user:", data.error);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);
  
  {/* Fetch existing messages */}
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?tripId=${tripId}`);
        if (!res.ok) {
          const text = await res.text(); 
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        const data = await res.json();
        setMessages(data.data || []);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchMessages();
  }, [tripId]);

  {/* Sends message to backend */}
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          senderId: currentUser.id,
          tripId,
          replyToId: replyTo?.id || null,
        }),
      });
      if (!res.ok) {
        const errorText = await res.text(); // fallback for debugging
        throw new Error(`Request failed: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      setMessages((prev) => [...prev, data.data]);
      setNewMessage("");
      setReplyTo(null);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  {/* Delete messages */}
  const deleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      } else {
        const error = await res.text();
        console.error("Failed to delete message:", error);
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  {/* Reply to messages */}
  const handleReply = (msg: Message) => {
    setReplyTo(msg);
    setSelectedMessageId(null);
  }

  {/* Directs users to bottom of page upon sending message */}
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */} 
      <div className="text-4xl font-bold mb-4 text-[#432818] text-center">
        Group Chat for: {tripName}
      </div>
      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {Object.entries(
          messages.reduce((acc: Record<string, typeof messages>, msg) => {
            const date = format(new Date(msg.createdAt), "yyyy-MM-dd");
            if (!acc[date]) acc[date] = [];
            acc[date].push(msg);
            return acc;
          }, {})
        ).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="text-center text-lg font-bold text-gray-500 my-2">
              {isToday(new Date(date))
                ? "Today"
                : isYesterday(new Date(date))
                ? "Yesterday"
                : format(new Date(date), "dd MMM yyyy")}
            </div>
            {/* Todays messages*/}
            {dayMessages.map((msg, idx) => {
              const isCurrentUser = currentUser && msg.senderId === currentUser.id;
              const isSameSenderAsPrevious = idx > 0 && dayMessages[idx - 1]?.sender?.id === msg.sender?.id;
              if (msg.type === "poll") {
                try {
                  const { creatorName, pollTitle, pollId } = JSON.parse(msg.content);
                  return (
                    <div key={msg.id} className="border p-3 mb-5 rounded bg-[#f3f3f3] my-2">
                      <p className="font-bold mb-1">
                        {currentUser?.name === creatorName ? "You" : creatorName} created a new poll!
                      </p>
                      <p className="text-sm italic mb-2">“{pollTitle}”</p>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/polls/${pollId}`);
                            const json = await res.json();
                            if (res.ok) {
                              setSelectedPoll(json.data);
                            } else {
                              alert("Failed to fetch poll");
                            }
                          } catch {
                            console.error("Error fetching poll");
                            alert("Error loading poll");
                          }
                        }}
                        className="bg-[#522912a1] text-white px-3 py-1 rounded hover:bg-[#522a12f3]"
                      >
                        Go to vote
                      </button>
                    </div>
                  );
                } catch {
                  console.error("Failed to parse poll content:", msg.content);
                  return null;
                }
              }
              if (msg.type === "task") {
                try {
                  const { creatorName, assignedTo, taskTitle } = JSON.parse(msg.content);
                  return (
                    <div key={msg.id} className="border p-3 mb-5 rounded bg-[#f3f3f3] my-2">
                      <p className="font-bold mb-1">
                        {currentUser?.name === creatorName ? "You" : creatorName} created a new task!
                      </p>
                      <p className="text-sm italic mb-1">“{taskTitle}”</p>
                      <p className="text-sm font-semibold mb-2">People assigned: {assignedTo.map((a) => a.user.name).join(", ")}</p>
                      <button
                        onClick={goToTasks}
                        className="bg-[#522912a1] text-white px-3 py-1 rounded hover:bg-[#522a12f3]"
                      >
                        Go to tasks
                      </button>
                    </div>
                  );
                } catch {
                  console.error("Failed to fetch task content:", msg.content);
                  return null;
                }
              }  
              return (
                <div key={msg.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div 
                    className="relative max-w-xs cursor-pointer"
                    onClick={() => setSelectedMessageId(msg.id === selectedMessageId ? null : msg.id)}
                  >
                    {/* Text box */}
                    <div className={`relative px-4 py-2 mb-3 rounded-lg shadow w-fit
                      ${isCurrentUser ? "bg-[#88e2a3] mr-4 text-right": "bg-[#a5a19a49] ml-4 text-left"}
                      ${isSameSenderAsPrevious ? "-mt-2" : "mt-4"}
                      ${selectedMessageId === msg.id ? "ring-2 ring-[#6f4e37]" : ""}
                      `}
                    >
                      {/* Text contents - name of sender */}
                      {!isSameSenderAsPrevious && (
                        <div className="text-xl text-gray-500 mb-1 font-semibold">
                          {isCurrentUser ? "You" : `${msg.sender.name}`}
                        </div>
                      )}
                      {/* TextBox for replied messages */}
                      {msg.replyTo && (
                        <div className="text-sm text-gray-500 mb-1 px-2 py-1 bg-[#a5a19a49] rounded border-l-4 border-gray-400">
                          <div className="font-semibold">{msg.replyTo.sender.name}</div> 
                          <div>{msg.replyTo.content}</div>
                        </div>
                      )}
                      {/* Text contents - content */}
                      <div className="break-words text-lg">{msg.content}</div>
                      {/* Timestamp */}
                      <div className="text-base text-gray-500 mt-1 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {/* Message options; onselect */}
                    {selectedMessageId == msg.id && (
                      <div className={`absolute ${isCurrentUser ? "right-full" : "left-full"} top-0 mt-2 flex gap-2 ml-2`}>
                        <button 
                          className="text-xs text-blue-600 bg-white px-2 py-1 rounded shadow hover:bg-blue-200"
                          onClick={() => handleReply(msg)}
                        >
                          Reply
                        </button>
                        {isCurrentUser && (
                          <button
                            className="text-xs text-red-600 bg-white px-2 py-1 mr-2 rounded shadow hover:bg-red-200"
                            onClick={() => {
                              const confirmed = window.confirm("Are you sure you want to delete this message?");
                              if (confirmed) {
                                deleteMessage(msg.id);
                                setSelectedMessageId(null);
                              }
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {selectedPoll && (
          <PollVoting
            poll={selectedPoll}
            currentUser={currentUser}
            onClose={() => setSelectedPoll(null)}
            onVoteSubmitted={(updatedPoll) => {
              setSelectedPoll(updatedPoll);
            }}
          />
        )}
        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
      {/* Bottom Section */}
      <div className="w-full max-w-xl mx-auto">
        {/* Reply preview */} 
        {replyTo && (
          <div className="mb-2 px-4 py-2 bg-[#a5a19a49] rounded text-sm flex justify-between items-center w-full">
            <div>
              <div className="font-semibold text-lg">{`Replying to: ${replyTo.sender.name}`}</div>
              <div className="text-gray-700 text-base">{replyTo.content}</div>
            </div>
            <button onClick={() => setReplyTo(null)} className="ml-4 text-red-500 hover:underline font-bold text-lg">
              Cancel
            </button>
          </div>
        )}
        {/* Input */}
        <div className="flex gap-2 w-full">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 border h-12 max-w-xl rounded px-4 py-2 text-lg"
            placeholder="Message"
          />
          <button
            onClick={sendMessage}
            className="bg-[#6f4e37] text-white px-4 py-2 w-20 rounded text-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}