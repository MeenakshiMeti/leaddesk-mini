import connectDB from "@/lib/mongodb";
import Lead from "@/models/Lead";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const allowedStatuses = ["New", "Contacted", "Closed"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value." },
        { status: 400 }
      );
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error("PATCH /api/leads/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update lead." },
      { status: 500 }
    );
  }
}