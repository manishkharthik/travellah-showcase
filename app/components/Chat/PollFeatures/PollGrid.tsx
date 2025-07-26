import React from 'react';
import { useState } from 'react';
import { ExtendedPoll } from "@/app/types/poll";
import PollVoting from "./PollVoting";

interface PollGridProps {
    polls: ExtendedPoll[];
    setPolls: React.Dispatch<React.SetStateAction<ExtendedPoll[]>>;
    currentUser: {
        id: number;
        username: string;
        name: string;
    } | null;
    onView: (poll: ExtendedPoll) => void;
    tripPeopleInvited: string[];
}
export default function PollGrid({ polls, setPolls, currentUser, onView, tripPeopleInvited }: PollGridProps) {
  const [selectedPollForVoting, setSelectedPollForVoting] = useState<ExtendedPoll | null>(null);
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {polls.map((poll) => (
          // Render each poll in a card-like format
          <div
            key={poll.id}
            className="p-4 border rounded shadow cursor-pointer bg-white hover:bg-gray-100 w-full text-center flex items-center flex-col"
            onClick={() => onView(poll)}
          >
            {/* Display poll title and creator */}
            <div className="text-xl font-bold mt-2">{poll.title}</div>
            <div className="text-sm text-gray-600 mt-1 mb-3">
              Created by: {currentUser && currentUser.name === poll.creator.name ? "You" : poll.creator.name}
            </div>
            {/* Display poll options */}
            <div className="mt-2 text-sm text-gray-500">
              <ul className="space-y-2 mb-4">
                {poll.options.sort((a, b) => b.votes.length - a.votes.length).slice(0, 5).map((option) => {
                  const totalVotes = tripPeopleInvited.length;
                  const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
                  return (
                    <li key={option.id} className="mb-2">
                      <div className="flex justify-between gap-5 text-sm font-medium mb-1">
                        <span>{option.text}</span>
                        <span>{option.votes.length} vote{option.votes.length !== 1 && "s"}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-[#522912a1] h-4 transition-all duration-300 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
                {poll.options.length > 5 && (
                  <li className="text-gray-500 italic pl-2">...and {poll.options.length - 5} more</li>
                )}
              </ul>
            </div>
            {/* Vote button */}
            <div className="pt-2 mt-2 mb-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPollForVoting(poll)} 
                } 
                className="bg-[#522912a1] text-white px-4 py-2 rounded hover:bg-[#522a12f3] transition cursor-pointer"
              >
                Vote
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedPollForVoting && (
        <PollVoting
          poll={selectedPollForVoting}
          onClose={() => setSelectedPollForVoting(null)}
          currentUser={currentUser}
          onVoteSubmitted={(updatedPoll) => {
          setPolls((prevPolls) =>
            prevPolls.map((p) => (p.id === updatedPoll.id ? updatedPoll : p))
          );
          setSelectedPollForVoting(null);
        }}
        />
      )}
    </>
  );
}