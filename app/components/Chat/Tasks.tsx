"use client";
import React from "react";
import PendingTasks from "./TaskFeatures/PendingTasks";
import CompletedTasks from "./TaskFeatures/CompletedTasks"; 
import AssignTask from "./TaskFeatures/AssignTask";
import { useState, useEffect } from "react";

interface TripUser {
  id: number;
  username: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueBy: string;
  completed: boolean;
  completedAt: string;
  assigner: TripUser;
  assignees: { user: TripUser }[];
}

export default function Tasks({ tripId }: { tripId: string }) {
  const [currentUser, setCurrentUser] = useState<TripUser | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleTaskCreated = (task: Task) => {
    setTasks(prev => [task, ...prev]);
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }

  const handleTaskCompleted = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
  };

  {/* Fetch Current User */}
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (res.ok) {
          setCurrentUser(data);
        } else {
          console.error("Failed to fetch user:", data.error);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  {/* Fetch Trip Tasks */}
  useEffect(() => {
    const fetchTasks = async () => {
      if (!tripId) return;
      try {
        const res = await fetch(`/api/tasks?tripId=${tripId}`);
        const data = await res.json();
        if (res.ok) {
          setTasks(data.data);
        } else {
          console.error("Failed to fetch tasks: ", data.error)
        }
      } catch (err) {
        console.error("Error fetching tasks: ", err);
      }
    };
    fetchTasks();
  }, [tripId]);

  const pendingTasks = tasks.filter((task) => task.completed === false);
  const completedTasks = tasks.filter((task) => task.completed === true);

  return (
    <div className="w-full h-full p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl text-center font-bold ml-90 mt-4">Welcome to the taskmaster!</h1>
        <AssignTask 
          tripId={tripId} 
          currentUser={currentUser} 
          onTaskCreated={handleTaskCreated}
        />
      </div>
      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="bg-white p-6 rounded-lg mt-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Pending Tasks</h2>
          <PendingTasks 
            includedTasks={pendingTasks} 
            currentUser={currentUser}
            onTaskCompleted={handleTaskCompleted}
            onTaskDeleted={handleTaskDeleted}
          />
        </div>
        {/* Completed Tasks */}
        <div className="bg-white p-6 rounded-lg mt-8 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Completed Tasks</h2>
          <CompletedTasks 
            includedTasks={completedTasks} 
            currentUser={currentUser} 
            onTaskCompleted={handleTaskCompleted}
            onTaskDeleted={handleTaskDeleted}
          />
        </div>
      </div>
    </div>
  );
}