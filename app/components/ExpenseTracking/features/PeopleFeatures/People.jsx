"use client";
import React from "react";
import { useState } from "react";

export default function People({
  expenses,
  onSelectPerson,
  people,
  currentUser,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Shows breakdown upon clicking a person
  const handleClick = (index) => {
    const person = people[index];
    const alreadySelected = selectedIndex === index;
    setSelectedIndex(alreadySelected ? null : index);
    onSelectPerson(alreadySelected ? null : { name: person.username });
  };

  {
    /* Computes total balance between current user and person */
  }
  const getTotalBalanceWith = (personUsername) => {
    const personExpenses = expenses[personUsername] || [];
    let balance = 0;
    for (const exp of personExpenses) {
      if (exp.status === "Settled") continue;
      const amount = parseFloat(exp.totalCost ?? 0);
      if (exp.category === "Individual") {
        const payer = exp.paidBy;
        const receiver = exp.owedBy?.[0];
        if (payer === currentUser && receiver === personUsername) {
          balance += amount; // they owe you
        } else if (payer === personUsername && receiver === currentUser) {
          balance -= amount; // you owe them
        }
      }
      if (exp.category === "Group") {
        if (
          exp.peopleInvolved.includes(currentUser) &&
          exp.peopleInvolved.includes(personUsername)
        ) {
          const share = amount / exp.peopleInvolved.length;
          if (exp.paidBy === currentUser) {
            balance += share; // they owe you
          } else if (exp.paidBy === personUsername) {
            balance -= share; // you owe them
          }
        }
      }
    }
    return balance;
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1 px-6 py-8 sm:px-8 sm:py-10">
        {/* Header */}
        <p className="text-xl font-semibold text-[#350a61] mb-10 leading-tight">
          Check who owes you, and how much
        </p>

        <div>
          {people.length === 0 ? (
            <p className="text-gray-500 text-center">No people to display.</p>
          ) : (
            people.map((person, index) => {
              if (person.username === currentUser.username) return null;
              const balance = getTotalBalanceWith(person.username);
              const formatted = Math.abs(balance).toFixed(2);
              return (
                <div key={index} className="mb-10">
                  <button
                    onClick={() => handleClick(index)}
                    className={`w-full p-6 rounded-xl cursor-pointer bg-gradient-to-r from-[#dceffd] to-[#f3f8ff] text-center text-2xl font-medium text-[#350a61] shadow-md transition-transform duration-100 relative outline-none
                    ${
                      selectedIndex === index
                        ? "outline-4 outline-indigo-400"
                        : ""
                    }
                    hover:scale-[1.02]
                  `}
                  >
                    <p>
                      {person.name} @{person.username}
                    </p>
                    <p
                      className={`mt-2 text-lg font-bold ${
                        balance > 0
                          ? "text-green-600"
                          : balance < 0
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {balance > 0
                        ? `💰 Owes you $${balance.toFixed(2)}`
                        : balance < 0
                        ? `💸 You owe $${-balance.toFixed(2)}`
                        : `All settled!`}
                    </p>
                  </button>
                  {index < people.length - 1 && (
                    <hr className="mt-8 border-0 h-0.5 bg-gray-300" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
