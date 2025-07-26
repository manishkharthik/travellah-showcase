import React from 'react';
import { useState } from 'react';
import { ExtendedPoll } from '@/app/types/poll';
import { User } from "@prisma/client"

interface PollVotingProps {
  poll: ExtendedPoll;
  currentUser: User;
  onClose: () => void;
  onVoteSubmitted: (updatedPoll: ExtendedPoll) => void;
}

export default function PollVoting({ poll, currentUser, onClose, onVoteSubmitted }: PollVotingProps) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleOptionToggle = (optionId: string) => {
        if (poll.allowMultiple) {
            setSelectedOptions((prev) =>
                prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
            );
        } else {
            setSelectedOptions([optionId]);
        }
    };
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/votes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    optionIds: selectedOptions,
                    pollId: poll.id,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                alert('Vote submitted successfully!');
                onVoteSubmitted(data.updatedPoll);
                onClose();
            } else {
                alert('Failed to submit vote: ' + data.error);
            }
        } catch (error) {
            console.error("Vote, error", error);
            alert('An error occurred while submitting your vote.');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button className="absolute top-3 right-4 text-xl" onClick={onClose}>✕</button>
            <h2 className="text-2xl font-bold mb-2 text-center">{poll.title}</h2>
            <p className="text-center text-sm text-gray-500 mb-4">
                Created by: {poll.creator.name}
            </p>
            <ul className="space-y-2 mb-4">
            {poll.options.map((option) => (
                <li key={option.id}>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type={poll.allowMultiple ? "checkbox" : "radio"}
                        name="pollOption"
                        value={option.id}
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => handleOptionToggle(option.id)}
                    />
                    <span>{option.text}</span>
                </label>
                </li>
            ))}
            </ul>
            <button
                className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded font-bold disabled:opacity-50 cursor-pounter"
                disabled={isSubmitting}
                onClick={handleSubmit}
            >
            {isSubmitting ? "Submitting..." : "Submit Vote"}
            </button>
        </div>
        </div>
    );
}