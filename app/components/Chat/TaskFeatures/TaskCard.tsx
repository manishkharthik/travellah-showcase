"use client";
import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";

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

interface TaskCardProps {
    task: Task;
    currentUser: TripUser | null;
    onTaskCompleted: (taskId: string) => void;
    onTaskDeleted: (taskId: string) => void;
}

export default function TaskCard({ task, currentUser, onTaskCompleted, onTaskDeleted }: TaskCardProps ) {
    const [expanded, setExpanded] = useState(false);
    const [isCompleted, setIsCompleted] = useState(task.completed);
    const currentUserInvolved = task.assignees.some((assignee) => assignee.user.id === currentUser?.id);
    const currentUserCreator = task.assigner.id === currentUser?.id;

    function isDueToday(dateStr: string | Date) {
        const dueDate = new Date(dateStr);
        const today = new Date();
        return dueDate <= today;
    }

    const handleCheckBox = async () => {
        const confirmed = window.confirm("Mark task as complete?");
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/tasks/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: true}),
            });
            await res.json();
            if (res.ok) {
                toast.success("Task marked as completed!");
                onTaskCompleted(task.id);
                setIsCompleted(true);
            } else {
                toast.error("Failed to complete task");
                console.error("Error completing task");
            }
        } catch (err) {
            console.error("Error updating tasks: ", err);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete task? This action cannot be undone.");
        if (!confirmed) return;
        try {
            const res = await fetch(`/api/tasks/${task.id}`, {
                method: "DELETE",
            });
            await res.json();
            if (res.ok) {
                toast.success("Task deleted successfully!");
                onTaskDeleted(task.id);
            } else {
                toast.error("Failed to delete task")
            }
        } catch (err) {
            console.error("Error deleting task", err);
        }
    }

    return (
        <div
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded shadow cursor-pointer transition"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold text-lg">{task.title}</p>
                    <p
                        className={`text-sm ${
                            isDueToday(task.dueBy) ? 'text-red-600 font-bold' : 'text-gray-500'
                        }`}
                    >
                        Due: {new Date(task.dueBy).toLocaleDateString()}
                    </p>
                </div>
                {currentUserInvolved && !isCompleted && (
                    <input
                        type="checkbox"
                        className="w-5 h-5 accent-orange-500"
                        checked={isCompleted}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleCheckBox();
                        }}
                    />
                )}
            </div>    
            {expanded && (
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                    <p className="text-gray-800">Description: {task.description}</p>
                    <p><span className="font-medium">Assigned by:</span> {task.assigner.name} {task.assigner.id === currentUser?.id && "(you)"}</p>
                    <p>
                        <span className="font-medium">Assigned to:</span> {
                            task.assignees.map(a => a.user.id === currentUser?.id ? `${a.user.name} (you)` : a.user.name).join(", ")
                        }
                    </p>
                    {currentUserCreator && (
                        <button
                            className="mt-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                        >
                            Delete Task
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}