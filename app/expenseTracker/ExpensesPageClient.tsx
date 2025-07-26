"use client"
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import People from "@/app/components/ExpenseTracking/features/PeopleFeatures/People.jsx";
import Breakdown from "@/app/components/ExpenseTracking/features/BreakdownFeatures/Breakdown.jsx";
import Details from "@/app/components/ExpenseTracking/features/OtherFeatures/Details.jsx";
import GroupExpenseForm from "@/app/components/ExpenseTracking/features/OtherFeatures/GroupExpenseForm.jsx";

interface Person {
  name: string;
}
interface Expenses {
  [personName: string]: any[]; // you can improve this with a more specific type for an expense object
}

const ExpensesPageClient = () => {
  const searchParams = useSearchParams();
  const [tripId, setTripId] = useState<string | null>(null);
  const [tripName, setTripName] = useState<string | null>(null);
  const [tripPeople, setTripPeople] = useState<
    { name: string; username: string }[]
  >([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [expenses, setExpenses] = useState<Expenses>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const id = searchParams.get("tripId");
    const name = searchParams.get("tripName");
    if (id && name) {
      setTripId(id);
      setTripName(name);
      localStorage.setItem("activeTrip", JSON.stringify({ tripId: id, tripName: name }));
    } else {
      const stored = localStorage.getItem("activeTrip");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTripId(parsed.tripId);
          setTripName(parsed.tripName);
        } catch (e) {
          console.error("❌ Failed to parse activeTrip from localStorage:", e);
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await fetch("/api/me");
        const userData = await userRes.json();
        setUserName(userData.username);
      } catch (e) {
        console.error("Error fetching user:", e);
        setError("Could not load user");
        setLoading(false);
      }
    };
    fetchUser();
  }, []); 

  useEffect(() => {
    if (!tripId || !userName) return;
    const fetchTripPeople = async () => {
      try {
        const res = await fetch(`/api/tripPeople?tripId=${tripId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch trip people: ${res.status}`);
        }
        const data = await res.json();
        if (data.people) {
          setTripPeople(
            data.people.filter((p: any) => p.username !== userName)
          );
        } else {
          console.error("Error fetching trip people:", data.error);
        }
      } catch (error: any) {
        console.error("Error fetching trip people:", error);
      }
    };
    fetchTripPeople();
  }, [tripId, userName]);

  useEffect(() => {
    if (!tripId || !userName) return;
    const fetchExpenses = async () => {
      try {
        const res = await fetch(`/api/expenses?tripId=${tripId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch expenses: ${res.status}`);
        }
        const raw = await res.json();
        const data = Array.isArray(raw) ? raw : raw.data;
        if (Array.isArray(data)) {
          const grouped: Record<string, any[]> = {};
          data.forEach((exp) => {
            const { category, paidBy, peopleInvolved = [], owedBy = [] } = exp;
            if (category === "Individual") {
              // Only show if currentUser is the payer or the receiver
              const receiver = owedBy[0]; // assumed to be [username]
              if (paidBy === userName || receiver === userName) {
                [paidBy, receiver].forEach((person) => {
                  if (person && !grouped[person]) grouped[person] = [];
                  if (person) grouped[person].push(exp);
                });
              }
            }
            if (category === "Group") {
              // Only show to those actually involved
              if (peopleInvolved.includes(userName)) {
                peopleInvolved.forEach((person: string) => {
                  if (!grouped[person]) grouped[person] = [];
                  grouped[person].push(exp);
                });
              }
            }
          });
          setExpenses(grouped);
        } else {
          console.error(
            "❌ Error fetching expenses:",
            data?.error || "Invalid response"
          );
        }
      } catch (error: any) {
        console.error("❌ Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [tripId, userName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#350a61] mx-auto mb-4"></div>
          <p>Loading expense tracker...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 mb-4">❌ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar - People */}
      <div className="w-[35%] bg-gradient-to-br from-[#fdf6e3] to-[#f1ece2] p-10 items-center justify-center text-center overflow-y-auto shadow-[2px_0_10px_rgba(0,0,0,0.05)]">
        <h1 className="text-3xl font-extrabold text-[#350a61] mt-8 tracking-tight">
          Expenses tracker for: {tripName}
        </h1>

        <People
          expenses={expenses}
          onSelectPerson={setSelectedPerson}
          people={tripPeople}
          currentUser={userName}
        />
      </div>

      {/* Main Content - Details or Breakdown */}
      <div className="w-[65%] bg-[#fafafa] flex flex-col h-screen overflow-hidden">
        {selectedPerson ? (
          <Breakdown
            person={selectedPerson}
            currentUser={userName}
            people={tripPeople}
            tripId={tripId}
            expenses={expenses[selectedPerson.name] || []}
            setExpenses={(newList: any[]) =>
              setExpenses((prev: Expenses) => ({
                ...prev,
                [selectedPerson.name]: newList,
              }))
            }
          />
        ) : (
          <>
            <Details
              peopleInvited={tripPeople}
              onAddExpense={() => setShowGroupForm(true)}
            />
            {showGroupForm && (
              <GroupExpenseForm
                peopleInvited={tripPeople}
                currentUser={userName}
                tripId={tripId}
                setExpenses={setExpenses}
                expenses={expenses}
                onClose={() => setShowGroupForm(false)}
                onSubmit={(data: any) => {
                  console.log("Group expense submitted:", data);
                  setShowGroupForm(false);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExpensesPageClient;