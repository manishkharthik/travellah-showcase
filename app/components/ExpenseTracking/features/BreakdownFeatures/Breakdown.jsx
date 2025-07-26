"use client";

import React from "react";
import { useState, useEffect } from "react";
import NewExpense from "./NewExpense";
import ResolveExpenses from "./ResolveExpenses";
import SettleAllExpenses from "./SettleAllExpenses";
import DeleteSettledExpenses from "./DeleteSettledExpenses";

export default function Breakdown({
  person,
  expenses,
  setExpenses,
  currentUser,
  people,
  tripId,
}) {
  const [showForm, setShowForm] = useState(false);
  const [sortKey, setSortKey] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [sortDirection, setSortDirection] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [selectedExpenseIndex, setSelectedExpenseIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState([]);
  const [originalOrder, setOriginalOrder] = useState(null);
  const [redoStack, setRedoStack] = useState([]);

  {
    /* Load expenses from backend on initial render */
  }
  useEffect(() => {
    console.log(
      "Effect triggered with tripId:",
      tripId,
      "person:",
      person.name
    );
    const loadExpenses = async () => {
      try {
        const res = await fetch(`/api/expenses?tripId=${tripId}`);
        const raw = await res.json();
        const allExpenses = Array.isArray(raw) ? raw : raw.data;
        const filtered = allExpenses.filter((exp) => {
          const involved = exp.peopleInvolved || [];
          const owedBy = exp.owedBy || [];

          const isIndividual =
            exp.category === "Individual" &&
            (exp.paidBy === person.username ||
              owedBy.includes(person.username));

          const isGroup =
            exp.category === "Group" &&
            ((exp.paidBy === currentUser && owedBy.includes(person.username)) ||
              (exp.paidBy === person.username && owedBy.includes(currentUser)));

          if (exp.category === "Group") {
            console.log("Evaluating group expense:");
            console.log("  • Expense:", exp.name);
            console.log("  • Paid by:", exp.paidBy);
            console.log("  • Owed by:", owedBy);
            console.log("  • Current user:", currentUser);
            console.log("  • Other person:", person.username);
            console.log("  • Include? ->", isGroup);
          }

          return isIndividual || isGroup;
        });
        setExpenses(filtered);
      } catch (err) {
        console.error("Failed to load expenses", err);
      }
    };
    if (tripId && person?.username) {
      loadExpenses();
    }
  }, [tripId, person?.username]);

  {
    /* Function to handle adding a new expense */
  }
  const handleAddExpense = (expense) => {
    const updatedExpenses = [
      ...expenses,
      { ...expense, category: "Individual" },
    ];
    setHistory((prev) => [...prev, { expenses: [...expenses] }]);
    setExpenses(updatedExpenses);
    console.log("Expenses: ", sanitizeExpenses(updatedExpenses));
    syncExpenses(sanitizeExpenses(updatedExpenses));
    setRedoStack([]);
    setHasChanges(true);
  };

  {
    /* Function to handle sorting expenses */
  }
  const getSortedExpenses = (key, direction) => {
    if (direction === 0) return [...expenses];
    return [...expenses].sort((a, b) => {
      const multiplier = direction;
      switch (key) {
        case "name":
          return multiplier * a.name.localeCompare(b.name);
        case "cost":
          return (
            multiplier *
            (parseFloat(a.totalCost ?? a.cost ?? 0) -
              parseFloat(b.totalCost ?? b.cost ?? 0))
          );
        case "category":
          if (a.category === b.category) return 0;
          if (a.category === "Individual") return multiplier * -1;
          return multiplier * 1;
        case "paidBy":
          return (
            multiplier *
            ((a.paidBy === currentUser ? -1 : 1) -
              (b.paidBy === currentUser ? -1 : 1))
          );
        case "status":
          return multiplier * (a.status === "Unsettled" ? -1 : 1);
        default:
          return 0;
      }
    });
  };
  const sortedExpenses = getSortedExpenses(sortKey, sortDirection);

  {
    /* Function to toggle header clicks for sorting */
  }
  const handleHeaderClick = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection(1);
    } else {
      setSortDirection((prev) => (prev === 1 ? -1 : prev === -1 ? 0 : 1));
    }
  };

  {
    /* Function to allow expenses to be passed to backend */
  }
  const sanitizeExpenses = (expenses) =>
    expenses.map((exp) => ({
      id: exp.id || undefined,
      tripId: tripId || exp.tripId,
      name: exp.name,
      totalCost: parseFloat(exp.totalCost ?? exp.cost ?? 0),
      paidBy: exp.paidBy,
      category: exp.category || "Individual",
      status: exp.status || "Unsettled",
      peopleInvolved: exp.peopleInvolved || [],
      owedBy: exp.owedBy || [],
      transactions: exp.transactions || [],
    }));

  {
    /* Function to save expenses to backend */
  }
  const syncExpenses = async (expensesToSync) => {
    try {
      const res = await fetch("/api/expenses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenses: expensesToSync }),
      });
      const resData = await res.json();
      if (!res.ok) {
        console.error("❌ Failed to sync expenses", resData);
        alert("Failed to sync expenses. Please try again.");
      } else {
        if (Array.isArray(resData.data)) {
          setExpenses(resData.data);
        } else {
          console.warn("Unexpected response shape", resData);
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
      alert("Something went wrong while syncing expenses.");
    }
  };

  {
    /* Check if any expenses are settled or unsetlled */
  }
  const hasSettled = expenses.some((e) => e.status === "Settled");
  const hasUnsettled = expenses.some((e) => e.status === "Unsettled");

  if (!person) return null;

  {
    /* Calculate total owed */
  }
  const totalOwed = expenses.reduce((acc, exp) => {
    if (exp.status !== "Unsettled") return acc;
    const amount = parseFloat(exp.totalCost ?? exp.cost ?? 0);
    if (exp.category === "Individual") {
      if (exp.paidBy === currentUser && exp.owedBy.includes(person.name)) {
        return acc + amount;
      } else if (
        exp.paidBy === person.name &&
        exp.owedBy.includes(currentUser)
      ) {
        return acc - amount;
      }
    }
    if (
      exp.category === "Group" &&
      exp.peopleInvolved.includes(currentUser) &&
      exp.peopleInvolved.includes(person.name)
    ) {
      const share = amount / exp.peopleInvolved.length;
      if (exp.paidBy === currentUser) {
        return acc + share;
      } else if (exp.paidBy === person.name) {
        return acc - share;
      }
    }
    return acc;
  }, 0);

  return (
    <div className="p-6 flex flex-col flex-grow px-8 py-6 overflow-y-auto bg-gradient-to-tr from-cyan-100 to-yellow-100">
      {/* Title with navbar */}
      <div className="w-full flex justify-between items-center mt-8 mb-6 gap-9">
        <h2 className="text-4xl font-bold mb-4 text-teal-700 text-center w-full">
          Breakdown for {person.name}
        </h2>

        {/* Fixed navbar with add undo/redo buttons */}
        <div className="fixed top-7 right-7 z-50">
          <div className="relative">
            {/* Toggle button for actions */}
            <button
              onClick={() => setShowActions(!showActions)}
              className="ml-auto text-teal-700 text-6xl p-3 w-32 rounded-md transition-shadow hover:shadow"
            >
              ☰
            </button>
            {/* Dropdown menu for actions */}
            {showActions && (
              <div className="absolute right-0 mt-2 w-64 bg-gradient-to-br from-yellow-200 to-cyan-200 rounded-xl shadow-2xl p-4 flex flex-col space-y-3 z-50 border border-gray-300">
                {/* Add Expense */}
                <button
                  onClick={() => {
                    setShowForm(true);
                    setShowActions(false);
                  }}
                  className={`px-4 py-2 rounded-md text-base transition-all bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600`}
                >
                  Add expense
                </button>
                {/* Undo action */}
                <button
                  onClick={() => {
                    if (history.length === 0) {
                      if (originalOrder) {
                        setRedoStack((prev) => [
                          ...prev,
                          { expenses: expenses.map((e) => ({ ...e })) },
                        ]);
                        setExpenses(originalOrder.map((e) => ({ ...e })));
                        setOriginalOrder(null);
                      }
                      return;
                    }
                    const lastState = history[history.length - 1];
                    setRedoStack((prev) => [
                      ...prev,
                      { expenses: expenses.map((e) => ({ ...e })) },
                    ]);
                    setExpenses(lastState.expenses);
                    syncExpenses(sanitizeExpenses(lastState.expenses));
                    setHistory((prev) => prev.slice(0, -1));
                    setSelectedExpenseIndex(null);
                    setShowActions(false);
                    setHasChanges(true);
                  }}
                  disabled={history.length === 0 && !originalOrder}
                  className={`px-4 py-2 rounded-md text-white text-base ${
                    history.length === 0 && !originalOrder
                      ? "bg-amber-300 cursor-not-allowed opacity-60"
                      : "bg-amber-500 hover:bg-amber-600 cursor-pointer"
                  }`}
                >
                  Undo
                </button>
                {/* Redo action */}
                <button
                  onClick={() => {
                    if (redoStack.length === 0) return;
                    const redoState = redoStack[redoStack.length - 1];
                    setHistory((prev) => [
                      ...prev,
                      { expenses: expenses.map((e) => ({ ...e })) },
                    ]);
                    setExpenses(redoState.expenses.map((e) => ({ ...e })));
                    setRedoStack((prev) => prev.slice(0, -1));
                    setSelectedExpenseIndex(null);
                    setShowActions(false);
                    setHasChanges(true);
                  }}
                  disabled={redoStack.length === 0}
                  className={`px-4 py-2 rounded-md text-white text-base ${
                    redoStack.length === 0
                      ? "bg-violet-400 cursor-not-allowed opacity-60"
                      : "bg-violet-600 cursor-pointer hover:bg-violet-700"
                  }`}
                >
                  Redo
                </button>
                {/* Close actions menu */}
                <button
                  onClick={() => setShowActions(false)}
                  className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 text-base cursor-pointer transition-all"
                  aria-label="Close"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary text */}
      <p className="text-2xl mb-5 max-w-3/5 leading-relaxed text-gray-700">
        {totalOwed == 0
          ? "All payments are settled!"
          : totalOwed < 0
          ? "Amount you owe them"
          : "Amount they owe you"}
        :
        <strong
          className={`ml-1 ${
            totalOwed === 0
              ? "text-gray-500"
              : totalOwed < 0
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {" $" + Math.abs(totalOwed)}
        </strong>
      </p>

      {/* Expense Headers */}
      <div className="w-[96%] grid grid-cols-[1.5fr_1.5fr_1.5fr_1.5fr_1.5fr] gap-4 font-semibold text-lg px-4 py-2 bg-indigo-100 text-indigo-900 rounded-md mb-4">
        <button
          onClick={() => handleHeaderClick("name")}
          className="hover:underline underline-offset-4 transition duration-150 ease-in-out"
        >
          Expenditure
        </button>
        <button
          onClick={() => handleHeaderClick("cost")}
          className="hover:underline underline-offset-4 transition duration-150 ease-in-out"
        >
          Cost
        </button>
        <button
          onClick={() => handleHeaderClick("category")}
          className="hover:underline underline-offset-4 transition duration-150 ease-in-out"
        >
          Category
        </button>
        <button
          onClick={() => handleHeaderClick("paidBy")}
          className="hover:underline underline-offset-4 transition duration-150 ease-in-out"
        >
          Paid by
        </button>
        <button
          onClick={() => handleHeaderClick("status")}
          className="hover:underline underline-offset-4 transition duration-150 ease-in-out"
        >
          Status
        </button>
      </div>

      {/* Expenses list*/}
      {sortedExpenses.map((exp, idx) => {
        const isUnsettled = exp.status === "Unsettled";
        return (
          <button
            key={idx}
            onClick={() => setSelectedExpenseIndex(idx)}
            className={`w-[96%] grid grid-cols-[1.5fr_1.5fr_1.5fr_1.5fr_1.5fr] gap-4 text-base px-4 py-3 rounded-md mb-2 border-none shadow-sm cursor-pointer ${
              isUnsettled
                ? "bg-white text-black opacity-100"
                : "bg-green-50 text-gray-600 opacity-70"
            }`}
          >
            <div>{exp.name}</div>
            <div>${parseFloat(exp.totalCost ?? exp.cost ?? 0).toFixed(2)}</div>
            <div>{exp.category}</div>
            <div>
              {exp.paidBy === currentUser
                ? "You"
                : people.find((p) => p.username === exp.paidBy)?.name ||
                  exp.paidBy}
            </div>
            <div
              className={`font-semibold ${
                exp.status === "Settled" ? "text-green-600" : "text-red-600"
              }`}
            >
              {exp.status}
            </div>
          </button>
        );
      })}

      {/* Popup form to create new expense */}
      {showForm && (
        <NewExpense
          person={person}
          currentUser={currentUser}
          onAdd={handleAddExpense}
          onEdit={(updatedExpense) => {
            setHistory((prev) => [...prev, { expenses: [...expenses] }]);
            const updated = [...expenses];
            updated[selectedExpenseIndex] = updatedExpense;
            setExpenses(updated);
            syncExpenses(sanitizeExpenses(updated));
            setIsEditing(false);
            setShowForm(false);
            setSelectedExpenseIndex(null);
          }}
          onClose={() => {
            setShowForm(false);
            setIsEditing(false);
            setSelectedExpenseIndex(null);
          }}
          isEditing={isEditing}
          initialData={expenses[selectedExpenseIndex]}
          tripId={tripId}
        />
      )}

      {/* Popup to resolve/edit expense */}
      {!isEditing && (
        <ResolveExpenses
          disabled={selectedExpenseIndex == null}
          onResolve={() => {
            setHistory((prev) => [
              ...prev,
              { expenses: expenses.map((e) => ({ ...e })) },
            ]);
            const updated = expenses.map((e) => ({ ...e }));
            updated[selectedExpenseIndex].status = "Settled";
            setExpenses(updated);
            syncExpenses(sanitizeExpenses(updated));
            setSelectedExpenseIndex(null);
            setHasChanges(true);
          }}
          onEdit={() => {
            setIsEditing(true);
            setShowForm(true);
          }}
          onCancel={() => setSelectedExpenseIndex(null)}
          selectedExpense={expenses[selectedExpenseIndex]}
          currentUser={currentUser}
        />
      )}

      {/* Instructions to resolve payment */}
      <p className="text-base max-w-4/5 leading-9 text-gray-700 mt-8">
        If an expense is unsettled, you can resolve it by clicking on it.
        <br />
        To add a new expense, click the "Add expense" button under the dropdown.
        <br />
        To edit an existing expense, click on the expense, followed by the "Edit
        expense" button.
        <br />
        To delete all settled expenses, click the "Delete" button.
      </p>

      {/* Bottom buttons */}
      <div className="w-full ml-10 mt-35 flex justify-center gap-12">
        <div className="w-84">
          <SettleAllExpenses
            disabled={!hasUnsettled}
            onClick={() => {
              const msg = `Are you sure you want to settle all expenses?\n\n${
                totalOwed < 0
                  ? `You owe them $${Math.abs(totalOwed)}`
                  : `They owe you $${Math.abs(totalOwed)}`
              }`;
              if (!window.confirm(msg)) return;
              setHistory((prev) => [...prev, { expenses: [...expenses] }]);
              const updated = expenses.map((exp) => ({
                ...exp,
                status: "Settled",
              }));
              setExpenses(updated);
              syncExpenses(sanitizeExpenses(updated));
              setHasChanges(true);
            }}
          />
        </div>
        <div className="w-84">
          <DeleteSettledExpenses
            disabled={!hasSettled}
            onClick={async () => {
              if (
                !window.confirm(
                  "Are you sure you want to delete all settled expenses?  This action cannot be undone."
                )
              )
                return;
              try {
                await fetch("/api/expenses", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ tripId }),
                });
                setHistory((prev) => [...prev, { expenses: [...expenses] }]);
                const remaining = expenses.filter(
                  (exp) => exp.status !== "Settled"
                );
                setExpenses(remaining);
                syncExpenses(sanitizeExpenses(remaining));
                setHasChanges(true);
              } catch (error) {
                console.error("Error deleting settled expenses:", error);
                alert("Failed to delete expenses. Please try again.");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
