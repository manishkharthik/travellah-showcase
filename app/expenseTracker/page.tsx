"use client";
import React, { Suspense } from "react";
import ExpensesPageClient from "./ExpensesPageClient"; 

export default function ExpenseTracker() {
  return (
    <Suspense fallback={<div>Loading trip data...</div>}>
      <ExpensesPageClient />
    </Suspense>
  );
}