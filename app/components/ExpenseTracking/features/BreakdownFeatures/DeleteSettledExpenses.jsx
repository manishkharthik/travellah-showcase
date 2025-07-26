import React from 'react';

export default function DeleteSettledExpensesButton({ disabled, onClick }) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`px-8 py-4 bg-red-600 text-white rounded-md text-lg border-none transition-opacity duration-300 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer opacity-100"}`}
      >
        <span>Delete settled expenses</span>
      </button>
    );
  }
  