import React from "react";
export default function ResolveExpenses({ disabled, onResolve, onEdit, onCancel, selectedExpense, currentUser}) {
    if (disabled) return null;   
    const isSettled = selectedExpense?.status === "Settled";
    const isGroup = selectedExpense?.category === "Group";

    return (
      <div className="mt-8 flex gap-4">
        {/* Resolve Payment */}
        <button
          onClick={onResolve}
          className={`px-8 py-4 rounded-md text-lg transition-all ${
            isSettled
              ? "bg-green-400 text-white cursor-not-allowed opacity-60"
              : "bg-green-500 text-white cursor-pointer hover:bg-green-600"
          }`}
        >
          Resolve Payment
        </button>
        {/* Edit Expense */}
        <button
          onClick={onEdit}
          className="px-8 py-4 bg-blue-500 text-white rounded-md text-lg cursor-pointer"
        >
          Edit Expense
        </button>
        {/* View People Involved*/}
        <button
          disabled={!isGroup}
          onClick={() => {
            if (isGroup) {
              alert(`People involved: ${selectedExpense.peopleInvolved?.map(p => p.username === currentUser ? "You" : p.name).join(", ") || "N/A"}`);
            }
          }}
          className={`px-8 py-4 rounded-md text-lg ${
            isGroup
              ? "bg-purple-500 text-white cursor-pointer hover:bg-purple-600"
              : "bg-gray-400 text-white cursor-not-allowed opacity-60"
          }`}
        >
          People Involved  
        </button>        
        {/* Cancel Action */}
        <button
          onClick={onCancel}
          className="px-8 py-4 bg-red-400 text-white rounded-md text-lg cursor-pointer"
        >
          Cancel
        </button>
      </div>
    );
  }