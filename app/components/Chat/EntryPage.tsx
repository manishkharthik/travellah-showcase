'use client';
import React from 'react';

export default function EntryPage({ tripName }: { tripName: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-[#432818] px-6 py-12 space-y-10 bg-[#fef6e4]">
      <h1 className="text-4xl font-bold text-center">Welcome to <span className="text-[#6f4e37]">{tripName}</span>!</h1>
      <p className="text-lg max-w-2xl text-center">
        This is your group’s communication hub – built to keep everyone aligned, updated, and engaged.
        Stay connected with your trip members, share ideas, assign tasks, and make decisions together.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <FeatureCard
          title="💬 Chat"
          desc="Converse in real-time with all group members. Share updates, jokes, or last-minute changes – all in one place."
        />
        <FeatureCard
          title="📊 Polls"
          desc="Need a group decision? Create polls for voting on restaurants, activities, or meeting times."
        />
        <FeatureCard
          title="✅ Tasks"
          desc="Assign responsibilities and keep track of who's doing what – from packing lists to group duties."
        />
        <FeatureCard
          title="📓 Journal"
          desc="Document your trip highlights or leave fun notes. This shared space becomes a digital memory book."
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-[#fff3e0] rounded-xl p-6 shadow hover:shadow-lg transition">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-sm text-[#5c4033]">{desc}</p>
    </div>
  );
}
