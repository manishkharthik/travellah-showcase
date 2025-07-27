"use client";
import React from "react";
import TaskCard from "./TaskCard";

interface TripUser {
  id: number;
  username: string;
  name: string
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

interface AssignTaskProps {
  includedTasks: Task[] | null;
  currentUser: TripUser | null;
  onTaskCompleted: (taskId: string) => void;
  onTaskDeleted: (taskId: string) => void;
}

export default function PendingTasks({ includedTasks, currentUser, onTaskCompleted, onTaskDeleted }: AssignTaskProps) {
  const userTasks = includedTasks?.filter((task) => task.assignees.some((assignee) => assignee.user.id === currentUser?.id))
  const otherTasks = includedTasks?.filter((task) => !task.assignees.some((assignee) => assignee.user.id === currentUser?.id));

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Tasks Assigned to You</h3>
      {userTasks?.length === 0 ? (
        <p className="text-gray-500 mb-6">No pending tasks assigned to you.</p>
      ) : (
        <ul className="mb-6 space-y-3">
          {userTasks?.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              currentUser={currentUser}
              onTaskCompleted={onTaskCompleted}
              onTaskDeleted={onTaskDeleted} 
            />
          ))}
        </ul>
      )}
      <h3 className="text-xl font-semibold mb-4">Other Pending Tasks</h3>
      {otherTasks?.length === 0 ? (
        <p className="text-gray-500">No other pending tasks in this trip.</p>
      ) : (
        <ul className="mb-6 space-y-3">
          {otherTasks?.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              currentUser={currentUser}
              onTaskCompleted={onTaskCompleted}
              onTaskDeleted={onTaskDeleted} 
            />
          ))}
        </ul>
      )}
    </div>
  );
}