import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";

// Définir le chemin du fichier JSON
const filePath = join(process.cwd(), "data", "counter.json");

export async function GET(request: NextRequest) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const count = JSON.parse(data);
    return NextResponse.json(count);
  } catch (error) {
    return NextResponse.json({
      error: "Failed to read counter value",
      status: 500
    });
  }
}

export async function POST(request: NextRequest) {
  const { count } = await request.json();
  if (typeof count !== "number") {
    return NextResponse.json({
      error: "Invalid count value",
      status: 400
    });
  }

  try {
    await fs.writeFile(filePath, JSON.stringify([count]));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to update counter value",
      status: 500
    });
  }
}

export async function OPTIONS() {
  return NextResponse.json({
    message: "Method not allowed",
    status: 405
  });
}
