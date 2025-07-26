"use client";
import React from 'react';

export default function Details({ peopleInvited, onAddExpense }) {
    return (
        <div className="w-[87.5%] p-12 sm:p-16 flex flex-col items-center justify-center text-center mx-auto">
        <h1 className="text-4xl font-extrabold text-[#350a61] mb-6 tracking-tight">
            Smart Cost-Splitting
        </h1>
        <p className="text-lg max-w-xl text-gray-700 leading-relaxed">
            Manage your shared expenses with ease. Add people, track spending, and get real-time breakdowns for every group trip.
        </p>
        {/*
        <button
            onClick={onAddExpense}
            className="mt-6 px-6 py-3 bg-purple-700 text-white font-semibold rounded-xl shadow-md hover:bg-purple-700 transition-colors duration-200"
        >
            Add Group Expense
        </button>
        */}
    </div>
    );
}
  