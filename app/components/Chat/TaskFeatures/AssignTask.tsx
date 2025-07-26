"use client";
import React from "react";
import { useState, useEffect } from "react";

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
    tripId: string | null;
    currentUser: TripUser | null;
    onTaskCreated: (task: Task) => void;
}

export default function AssignTask({ currentUser, tripId, onTaskCreated }: AssignTaskProps) {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueBy, setDueBy] = useState('');
    const [assignees, setAssignees] = useState<number[]>([]);
    const [peopleInvited, setPeopleInvited] = useState<TripUser[]>([]);

    {/* Fetch people in trip */}
    useEffect(() => {
        const fetchPeople = async () => {
            const res = await fetch(`/api/tripPeople?tripId=${tripId}`);
            const data = await res.json();
            if (res.ok) {
                setPeopleInvited(data.people);
            }
        };
        fetchPeople();
    }, [tripId]);

    {/* Upon assigning task */}
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !dueBy || assignees.length == 0 || !currentUser || !tripId) {
            alert("Please fill out the required fields");
            return;
        }
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    assignerId: currentUser.id,
                    assigneeIds: assignees,
                    dueBy,
                    tripId,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                onTaskCreated(data.data);
                const newTask = data.data;
                await fetch("/api/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        senderId: currentUser?.id,
                        tripId,
                        type: "task",
                        content: JSON.stringify({
                            creatorName: currentUser?.name,
                            assignedTo: newTask.assignees,
                            taskTitle: newTask.title,
                        }),
                    }),
                });
                alert("Task assigned successfully!");
                setShowForm(false);
                setTitle("");
                setDescription("");
                setDueBy("");
                setAssignees([]);
            } else {
                if (!res.ok) throw new Error(data.error || "something went wrong");
            }
        } catch {
            alert("Error creating task");
        }
    }

    return (
        <>
            <div className="flex items-center space-x-4 overflow-y-auto">
                <button onClick={() => setShowForm(!showForm)} className="bg-[#8b6a5c] text-white px-6 py-3 rounded-full text-xl shadow-lg hover:bg-[#6f4e37] transition cursor-pointer">
                    Assign Task
                </button>
            </div>
            {showForm && (
                <div className="absolute top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                        <h2 className="text-2xl font-semibold mb-4">Assign a New Task</h2>
                        <form>
                            {/* Title */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Task Title</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
                            </div>
                            {/* Description */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea className="w-full p-2 border border-gray-300 rounded" rows={4} value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                            </div>
                            {/* Assign to */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Assign To</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded"
                                    value=""
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value);
                                        if (!assignees.includes(selectedId)) {
                                            setAssignees([...assignees, selectedId]);
                                        }
                                    }}  
                                >
                                    <option value="" disabled>Select a user</option>
                                    {peopleInvited.map((person) => (
                                    <option key={person.id} value={person.id}>
                                        {person.name} {person.id === currentUser?.id ? "(you)" : ""}
                                    </option>
                                    ))}
                                </select>
                                  <div className="flex flex-wrap mt-2 gap-2">
                                    {assignees.map((id) => {
                                    const user = peopleInvited.find(p => p.id === id);
                                    return (
                                        <div key={id} className="flex items-center bg-[#8b6a5c] text-white px-3 py-1 rounded-full shadow text-sm">
                                        {user?.name} {user?.id === currentUser?.id ? "(you)" : ""}
                                        <button
                                            onClick={() => setAssignees(assignees.filter((uid) => uid !== id))}
                                            className="ml-2 font-bold hover:text-red-200"
                                        >
                                            &times;
                                        </button>
                                        </div>
                                    );
                                    })}
                                </div>
                            </div>
                            {/* Due date */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Due Date</label>
                                <input type="date" value={dueBy} onChange={(e) => setDueBy(e.target.value)} className="w-full p-2 border border-gray-300 rounded" />
                            </div>
                            {/* Submit / Cancel */}
                            <div className="flex justify-between">
                                <button onClick={handleSubmit} className="bg-[#8b6a5c] text-white px-6 py-3 rounded-full text-xl shadow-lg hover:bg-[#6f4e37] transition cursor-pointer">
                                    Submit
                                </button>
                                <button onClick={() => setShowForm(false)} className="bg-red-500 text-white px-6 py-3 rounded-full text-xl shadow-lg hover:bg-red-600 transition cursor-pointer">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>  
            )}
        </>
    );
}