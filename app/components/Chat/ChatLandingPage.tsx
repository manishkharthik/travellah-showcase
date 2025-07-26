"use client"

import React from "react";
import { useState } from "react";
import {
  MessageCircle,
  ClipboardList,
  BookOpen,
  BarChart3,
} from "lucide-react";

import EntryPage from "./EntryPage";
import Polls from "./Polls";
import Tasks from "./Tasks";
import Journal from "./Journal";
import ChatWithTasksView from "./ChatWithTasksView";

interface ChatLandingPageProps {
    tripId: string | null;
    tripName: string | null;
    tripPeopleInvited: string[];
    startDate: Date | null;
    endDate: Date | null;
}

export default function ChatLandingPage({ tripId, tripName, tripPeopleInvited, startDate, endDate }: ChatLandingPageProps) {
    const [activeTab, setActiveTab] = useState("enter");
    const tabs = [
        { id: "chat", icon: <MessageCircle size={64}/>, label: "Chat" },
        { id: "polls", icon: <BarChart3 size={64}/>, label: "Polls" },
        { id: "tasks", icon: <ClipboardList size={64}/>, label: "Tasks" },
        { id: "journal", icon: <BookOpen size={64}/>, label: "Journal" },
    ];
    const startDateParam = startDate ? new Date(startDate) : null;
    const endDateParam = endDate ? new Date(endDate) : null;

    return (
        <div className="flex min-h-screen bg-[#fef6e4] text-[#432818]">
            <div className="w-40 bg-[#6f4e37] flex flex-col items-center py-4 space-y-12 pt-12">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center gap-1 text-lg ${
                            activeTab === tab.id ? "text-[#fef6e4]" : "text-[#d9cfc0]"
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            <div className="flex-1 p-8">
                {activeTab === "enter" && (
                    <EntryPage tripName={tripName} />
                )}
                {activeTab === "chat" && (
                    <ChatWithTasksView tripName={tripName} tripId={tripId} />
                )}
                {activeTab === "polls" && (
                    <Polls tripId={tripId} tripPeopleInvited={tripPeopleInvited} />
                )}
                {activeTab === "tasks" && (
                    <Tasks tripId={tripId} tripPeopleInvited={tripPeopleInvited} />
                )}
                {activeTab === "journal" && (
                    <Journal tripName={tripName} tripId={tripId} startDate={startDateParam} endDate={endDateParam} />
                )}
            </div>
        </div>
    );
}