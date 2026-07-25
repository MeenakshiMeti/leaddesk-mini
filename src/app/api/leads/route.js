import connectDB from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, budgetRange, message } = body;

    if (!name || !email || !budgetRange || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const lead = await Lead.create({ name, email, budgetRange, message });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
    }

    console.error("POST /api/leads error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const leads = await Lead.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads." },
      { status: 500 }
    );
  }
}