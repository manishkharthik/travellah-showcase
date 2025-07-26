import React, { useState } from "react";
import { ExtendedPoll } from "@/app/types/poll";

interface PollCreationProps {
    tripId: string | null;
    onClose: () => void;
    onPollCreated: (newPoll: ExtendedPoll) => void;
    currentUser: { id: number; username: string; name: string } | null;
}

export default function PollCreation({ tripId, onClose, onPollCreated, currentUser }: PollCreationProps) {
    const [title, setTitle] = useState("");
    const [options, setOptions] = useState<string[]>([""]);
    const [allowMultiple, setAllowMultiple] = useState(false);

    const addOption = () => setOptions([...options, ""]);
    const updateOption = (index: number, value: string) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    };
    const removeOption = (index: number) => {
        const updated = options.filter((_, i) => i !== index);
        setOptions(updated);
    };

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();
        const trimmedOptions = options.map((o) => o.trim()).filter((o) => o !== "");
        if (!trimmedTitle) {
            alert("Poll title cannot be empty.");
            return;
        }
        if (trimmedOptions.length < 2) {
            alert("Please enter at least two non-empty options.");
            return;
        }
        if (trimmedOptions.length > 10) {
            alert("Please enter no more than ten options.");
            return;
        }
        if (trimmedOptions.some((text) => text === "")) {
            alert("All options must be non-empty.");
            return;
        }
        const payload = {
            title: trimmedTitle,
            options: trimmedOptions,
            allowMultiple,
            tripId,
            creatorId: currentUser?.id,
        };
        const res = await fetch("/api/polls", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
            onPollCreated(data.data);
            const newPoll = data.data;
            await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderId: currentUser?.id,
                    tripId,
                    type: "poll",
                    content: JSON.stringify({
                        creatorName: currentUser?.name,
                        pollTitle: newPoll.title,
                        pollId: newPoll.id
                    }),
                }),
            });
            onClose();
        } else {
            console.error(data.error);
            alert("Failed to create poll: " + data.error);
        }
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
            <button className="absolute top-3 right-4 text-xl" onClick={onClose}>✕</button>
            <h2 className="text-2xl font-bold mb-4">Create a New Poll</h2>
            <input
                className="w-full border p-2 rounded mb-4"
                placeholder="Poll Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            {options.map((option, idx) => (
                <div key={idx} className="flex items-center mb-2 gap-2">
                    <input
                        className="flex-1 border p-2 rounded"
                        placeholder={`Option ${idx + 1}`}
                        value={option}
                        onChange={(e) => updateOption(idx, e.target.value)}
                    />
                    <button onClick={() => removeOption(idx)} className="text-red-600">✕</button>
                </div>
            ))}
            <button onClick={addOption} className="text-cyan-600 mb-4 cursor-pointer hover:underline">
                + Add Option
            </button>
            <div className="mb-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={allowMultiple}
                        onChange={(e) => setAllowMultiple(e.target.checked)}
                    />
                    Allow multiple selections
                </label>
            </div>
            <button
                className="bg-green-600 text-white w-full py-2 rounded font-bold hover:bg-green-700 transition cursor-pointer"
                onClick={handleSubmit}
            >
                Create Poll
            </button>
        </div>
    </div>
    );
}