import React from 'react';
import { useState, useEffect } from 'react';
import { ExtendedPoll } from "@/app/types/poll";

interface PollDetailsProps {
    poll: ExtendedPoll;
    onClose: () => void;
    onPollUpdated: (updatedPoll: ExtendedPoll) => void;
    onPollDeleted: () => void;
    currentUser: { id: number; username: string; name: string } | null;
}
type EditableOption = {
  id?: string; 
  text: string;
  votes: { id: string; userId: number }[];
};


export default function PollDetails({ poll, onClose, onPollUpdated, onPollDeleted, currentUser }: PollDetailsProps) {
    const [editedTitle, setEditedTitle] = useState(poll.title);
    const [editedOptions, setEditedOptions] = useState<EditableOption[]>(poll.options.map(opt => ({ ...opt })));
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPoll, setSelectedPoll] = useState<ExtendedPoll | null>(null);
    const [voterList, setVoterList] = useState<string[] | null>(null);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

    {/* Fetch selected poll details */}
    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const res = await fetch(`/api/polls/${poll.id}`);
                const data = await res.json();
                if (res.ok && data.data) {
                    setSelectedPoll(data.data);
                } else {
                    console.error("Failed to fetch poll:", data.error);
                }
            } catch (error) {
                console.error("Error fetching poll:", error);
            }
        };
        fetchPoll();
    }, [poll.id]);

    {/* Handling option changes */}
    const handleOptionChange = (index: number, newText: string) => {
        const newOptions = [...editedOptions];
        newOptions[index].text = newText;
        setEditedOptions(newOptions);
    }
    const handleAddOption = () => {
        setEditedOptions([...editedOptions, { id: undefined, text: "", votes: [] }]);
    }
    const handleDeleteOption = (index: number) => {
        const newOptions = [...editedOptions];
        newOptions.splice(index, 1);
        setEditedOptions(newOptions);
    }

    {/* Saving the edited poll */}
    const handleSave = async () => {
        if (!editedTitle.trim()) {
            alert("Poll title cannot be empty");
            return;
        }
        const trimmedOptions = editedOptions.map(o => o.text.trim());
        if (trimmedOptions.length < 2) {
            alert("You must have at least two options.");
            return;
        }
        if (trimmedOptions.some(text => text === "")) {
            alert("Poll options cannot be empty.");
            return;
        }
        try {
            const res = await fetch(`/api/polls/${poll.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: editedTitle,
                    options: editedOptions,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                onPollUpdated(data.updated);
                setIsEditing(false);
                onClose();
                alert("Poll updated successfully");
            } else {
                alert("Failed to update poll");
            }
        } catch (error) {
            console.error("Error updating poll:", error);
            alert("Failed to update poll");
        }
    };

    {/* Deleting the poll */}
    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this poll? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/polls/${poll.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                onPollDeleted();
                onClose();
                alert("Poll deleted successfully");
            } else {
                const data = await res.json();
                alert("Failed to delete poll: " + data.error);
            }
        } catch (error) {
            console.error("Error deleting poll:", error);
            alert("Failed to delete poll");
        }
    };

    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl relative">
        <button className="absolute top-3 right-3 text-xl" onClick={onClose}>✕</button>
        {/* Poll editing mode */}
        {isEditing ? (
            <>
                <input
                    type="text"
                    className="text-2xl font-bold mt-4 mb-4 w-full border p-2"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Poll Title"
                />
                <ul className="space-y-2 mb-4">
                    {editedOptions.map((option, index) => (
                        <li key={index} className="flex items-center space-x-2">
                            <input
                                type="text"
                                className="flex-1 border p-2"
                                value={option.text}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                            />
                            <button
                                className="text-red-500"
                                onClick={() => handleDeleteOption(index)}
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                    <button
                        className="bg-blue-500 text-white px-4 py-2 mt-3 rounded cursor-pointer hover:bg-blue-600 transition"
                        onClick={handleAddOption}
                    >
                        Add Option
                    </button>
                </ul>
                <div className="flex justify-end gap-4">
                    <button className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500 transition cursor-pointer" onClick={() => setIsEditing(false)}>
                        Cancel
                    </button>
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition cursor-pointer" onClick={handleSave}>
                        Save changes
                    </button>
                </div>
            </>
        ) : (
            <>
                <h2 className="text-2xl font-bold mb-4">{selectedPoll?.title}</h2>
                {selectedPoll?.options?.length ? (
                    <ul className="space-y-2 mb-4">
                        {selectedPoll.options.sort((a, b) => b.votes.length - a.votes.length).map((option) => {
                            const isSelected = selectedOptionId === option.id;
                            return (
                            <li
                                key={option.id}
                                className="border rounded p-2 cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                    if (isSelected) {
                                        setSelectedOptionId(null);
                                        setVoterList(null);
                                    } else {
                                        setSelectedOptionId(option.id);
                                        setVoterList(option.votes.map((v) => v.user.name));
                                    }
                                }}
                            >
                                {option.text} — {option.votes.length} vote{option.votes.length !== 1 && "s"}
                                {isSelected && voterList && (
                                    <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                                        {voterList.length > 0 ? (
                                        voterList.map((name, idx) => <li key={idx}>{name}</li>)
                                        ) : (
                                        <li>No voters yet.</li>
                                        )}
                                    </ul>
                                )}
                            </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-gray-500">No options available</p>
                )}
                {selectedPoll?.creator?.name && (
                    <h2 className="text-xl font-semibold mb-4">
                        Created by: {selectedPoll.creator.name === currentUser?.name ? "You" : selectedPoll.creator.name}
                    </h2>
                )}
                <div className="flex justify-end gap-4">
                <button className={`text-white px-4 py-2 rounded ${
                    selectedPoll?.creator.name !== currentUser?.name
                        ? "bg-red-200 cursor-not-allowed"
                        : "bg-red-600"
                  }`}
                onClick={handleDelete}>
                    Delete
                </button>
                <button
                  className={`text-white px-4 py-2 rounded ${
                    selectedPoll?.creator.name !== currentUser?.name
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600"
                  }`}
                  onClick={() => {
                    if (selectedPoll?.creator.name === currentUser?.name && selectedPoll) {
                      onPollUpdated(selectedPoll);
                      setIsEditing(true);
                    }
                  }}
                >
                    Edit
                </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
}