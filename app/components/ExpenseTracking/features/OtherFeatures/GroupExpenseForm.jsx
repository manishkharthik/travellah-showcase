"use client";
import { on } from 'events';
import { parse } from 'path';
import React, { useState } from 'react';

export default function GroupExpenseForm({ peopleInvited, currentUser, tripId, setExpenses, expenses, onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [cost, setCost] = useState("");
    const [involvedPeople, setInvolvedPeople] = useState([]);
    const [paidByList, setPaidByList] = useState([]);
    const [distribution, setDistribution] = useState("");
    const [manualDistribution, setManualDistribution] = useState({});

    {/* Function to save expenses to backend */}
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
        alert("Something went wrong while syncing group expenses.");
        }
    };

    const handleManualChange = (username, value) => {
        setManualDistribution((prev) => ({
            ...prev,
            [username]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const balances = {};
        paidByList.forEach(({ person, amount }) => {
            balances[person.username] = (balances[person.username] || 0) + parseFloat(amount);
        });
        Object.entries(manualDistribution).forEach(([username, amount]) => {
            balances[username] = (balances[username] || 0) - parseFloat(amount);
        });
        const creditors = [];
        const debtors = [];
        for (const [person, balance] of Object.entries(balances)) {
            if (balance > 0) {
                creditors.push({ person, amount: parseFloat(balance)});
            }
            if (balance < 0) {
                debtors.push({ person, amount: -parseFloat(balance)});
            }
        }
        const transactions = [];
        for (const debtor of debtors) {
            for (const creditor of creditors) {
                if (debtor.amount === 0) break;
                if (creditor.amount === 0) continue;
                const payment = Math.min(debtor.amount, creditor.amount);
                debtor.amount -= payment;
                creditor.amount -= payment;
                transactions.push({
                    from: creditor.person,
                    to: debtor.person,
                    amount: payment,
                })
            }
        }
        const updated = [];
        transactions.forEach(({ from, to, amount }) => {
            updated.push({
                name,
                cost: amount,
                paidBy: from === currentUser ? "You" : from,
                status: "Unsettled",
            });
        });
        const newGroupExpenses = transactions.map(({ from, to, amount }) => ({
            name,
            totalCost: amount,
            category: "Group",
            paidBy: from === currentUser ? "You" : from,
            status: "Unsettled",
            peopleInvolved: involvedPeople.map(p => typeof p === "string" ? p : p.username),
            tripId,
            owedBy: [to],
            transactions: [{ from, to, amount }],
        }));
        await syncExpenses(newGroupExpenses);
        alert("Group expense added successfully!");
        onSubmit(newGroupExpenses);
    };

    const peopleOptions = [
        ...peopleInvited,
        ...(peopleInvited.some(p => p.username === currentUser) ? [] : [{ name: "You", username: currentUser }]),
    ];

    const costNum = parseFloat(cost) || 0;
    const totalPaid = paidByList.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const totalOwed = Object.values(manualDistribution).reduce((sum, val) => sum + parseFloat(val || 0), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-6">
            <div className="bg-white p-6 rounded-lg w-[90%] max-w-md space-y-4">
                <h2 className="text-xl font-bold text-center mb-2">Add Group Expense</h2>
                {/* Expense Name */}
                <input
                    className='w-full border border-gray-300 rounded px-3 py-2'
                    type="text"
                    placeholder="Expense Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                {/* Total Cost */}
                <input
                    className='w-full border border-gray-300 rounded px-3 py-2'
                    type="number"
                    placeholder="Total Cost"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                />
                {/* People Involved */}
                <div>
                    <label className="block font-medium mb-1">People Involved:</label>
                    <select
                        className='w-full border border-gray-300 rounded px-3 py-2'
                        value=""
                        onChange={(e) => {
                            const selected = e.target.value;
                            const selectedObj = peopleOptions.find((p) => p.username === selected);
                            if (selectedObj && !involvedPeople.some((p) => p.username === selected)) {
                                setInvolvedPeople((prev) => [...prev, selectedObj]);
                            }
                        }}
                    >
                        <option value="">Add Person</option>
                        {peopleOptions.map((person) => (
                            <option key={person.username} value={person.username}>
                                {person.username === currentUser ? "You" : person.name}
                            </option>
                        ))}
                    </select>

                    {/* Display selected people */}
                    <div className="mt-2 space-y-1">
                        {involvedPeople.map((person) => (
                            <div 
                                key={person.username}
                                className="flex justify-between items-center px-3 py-2 bg-gray-100 rounded"
                            >
                                <span>{person === currentUser ? "You" : person.name}</span>
                                <button
                                    className="text-red-500 text-sm hover:underline"
                                    onClick={() => setInvolvedPeople((prev) => prev.filter((p) => p.username !== person.username))}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Paid By */}
                <div>
                    <label className="block font-medium mb-1">Paid By:</label>
                    <select
                        className='w-full border border-gray-300 rounded px-3 py-2'
                        value=""
                        onChange={(e) => {
                            const selected = e.target.value;
                            const selectedObj = peopleOptions.find(p => p.username === selected);
                            if (selectedObj) {
                                setPaidByList((prev) => [...prev, { person: selectedObj, amount: 0 }]);    
                            }
                        }}
                    >
                        <option value="">Add Person</option>
                        {peopleOptions.map((person) => (
                            <option key={person.username} value={person.username}>
                                {person.username === currentUser ? "You" : person.name}
                            </option>
                        ))}
                    </select>
                    {/* Display list of people who paid */}
                    <div className="mt-2 space-y-2">
                        {paidByList.map((entry, index) => (
                            <div 
                                key={entry.person.username}
                                className="flex justify-between items-center gap-2 px-3 py-2 bg-gray-100 rounded"
                            >
                                <span className="w-1/3 truncate">
                                    {entry.person.username === currentUser ? "You" : entry.person.name}
                                </span>
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    className='w-1/3 border border-gray-300 rounded px-2 py-1'
                                    value={entry.amount}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPaidByList((prev) => 
                                            prev.map((item, i) => 
                                                i === index ? { ...item, amount: value } : item
                                            )
                                        );
                                    }}
                                />
                                <button
                                    className="text-red-500 text-sm hover:underline"
                                    onClick={() =>
                                    setPaidByList((prev) => prev.filter((_, i) => i !== index))
                                    }
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Distribution */}
                <div className="flex items-center gap-4">
                    <label className="font-medium">Distribution Breakdown:</label>
                    <label className="flex items-center gap-1">
                        <input
                            type="radio"
                            checked={distribution === "auto"}
                            onChange={() => {
                                setDistribution("auto");
                                if (cost && involvedPeople.length > 0) {
                                    const equal = (parseFloat(cost) / involvedPeople.length).toFixed(2);
                                    const updated = {};
                                    involvedPeople.forEach((person) => (updated[person.username] = equal));
                                    setManualDistribution(updated);
                                }
                            }}
                        />
                        Auto
                    </label>
                    <label className="flex items-center gap-1">
                        <input
                            type="radio"
                            name="distribution"
                            value="manual"
                            checked={distribution === "manual"}
                            onChange={() => setDistribution("manual")}
                        />
                        Manual
                    </label>
                </div>
                {/* Manual Inputs */}
                {distribution && (
                    <div className="space-y-2">
                        <label className="block font-medium mb-1">Distribution Breakdown:</label>
                        {involvedPeople.map((person) => (
                            <div key={person.username} className="flex items-center gap-2">
                                <span className="w-1/3">{person.username === currentUser ? "You" : person.name}:</span>
                                <input
                                    className='w-2/3 border border-gray-300 rounded px-2 py-1'
                                    type="number"
                                    placeholder="Amount"
                                    value={manualDistribution[person.username] || ""}
                                    disabled={distribution === "auto"}
                                    onChange={(e) => handleManualChange(person.username, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                )}
                {/* Buttons with Real-time Totals Summary */}
                <div className="text-sm text-gray-700 mt-4 space-y-1">
                    <p className="text-gray-700">
                        <strong>Total Cost:</strong> ${costNum.toFixed(2)}
                    </p>
                    <p className={totalPaid !== costNum ? "text-red-600" : "text-green-600"}>
                        <strong>Total Paid:</strong>{" "} ${totalPaid.toFixed(2)}
                    </p>
                    <p className={totalOwed !== costNum ? "text-red-600" : "text-green-600"}>
                        <strong>Total Owed:</strong>{" "} ${totalOwed.toFixed(2)}
                    </p>
                </div>
                {/* Submit and Cancel Buttons */}
                <div className="flex justify-end gap-4 mt-4">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        onClick={handleSubmit}
                    >
                        Add group expense
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
