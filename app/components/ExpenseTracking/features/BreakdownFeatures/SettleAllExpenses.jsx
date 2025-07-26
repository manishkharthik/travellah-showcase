import React from 'react';
export default function SettleAllExpensesButton({ disabled, onClick }) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`px-8 py-4 bg-green-600 text-white rounded-md text-lg border-none transition-opacity duration-200 ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        }`}
      >
        <span>Settle all expenses</span>
      </button>
    );
  }
  