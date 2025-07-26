import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tripId, name, totalCost, paidBy, peopleInvolved, owedBy, transactions } = body;

    const expense = await prisma.expense.create({
      data: {
        tripId,
        name,
        totalCost,
        paidBy,
        peopleInvolved,
        owedBy,
        transactions,
      },
    });

    return NextResponse.json(expense);
  } catch (err) {
    console.error("Failed to create expense:", err);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get("tripId");

  if (!tripId) {
    return new Response(JSON.stringify({ error: "Missing tripId" }), { status: 400 });
  }

  try {
    const expenses = await prisma.expense.findMany({
      where: { tripId },
      orderBy: { createdAt: "desc" }, // optional
    });

    return new Response(JSON.stringify(expenses), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ GET /expenses error:", err);
    return new Response(JSON.stringify({ error: "Failed to load expenses" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const expenses = body.expenses;

    const updatedExpenses = [];
    for (const exp of expenses) {
      if (exp.id) {
        // Update existing expense
        const updated = await prisma.expense.update({
          where: { id: exp.id },
          data: {
            name: exp.name,
            totalCost: exp.totalCost,
            paidBy: exp.paidBy,
            category: exp.category,
            status: exp.status,
            peopleInvolved: exp.peopleInvolved,
            owedBy: exp.owedBy,
            transactions: exp.transactions,
          },
        });
        updatedExpenses.push(updated);
      } else {
         if (!exp.tripId) {
          throw new Error("Missing tripId for new expense");
        }
        // Create new expense and let Prisma assign the id
        const created = await prisma.expense.create({
          data: {
            tripId: exp.tripId,
            name: exp.name,
            totalCost: exp.totalCost,
            paidBy: exp.paidBy,
            category: exp.category,
            status: exp.status,
            peopleInvolved: exp.peopleInvolved,
            owedBy: exp.owedBy,
            transactions: exp.transactions,
          },
        });
        updatedExpenses.push(created);
      }
    }
    return new Response(JSON.stringify({ message: "Expenses updated", data: updatedExpenses }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ PUT /expenses error:", err.stack || err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to update expenses" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { tripId } = await req.json();
    if (!tripId) {
      return new Response(JSON.stringify({ error: "Missing tripId" }), {
        status: 400,
      });
    }
    await prisma.expense.deleteMany({
      where: {
        tripId,
        status: "Settled",
      },
    });
    return new Response(JSON.stringify({ message: "Settled expenses deleted successfully" }), {
      status: 200,
    });
  } catch (err) {
    console.error("❌ DELETE /expenses error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to delete expense" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
  }
}