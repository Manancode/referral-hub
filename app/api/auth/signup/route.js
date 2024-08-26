import { NextResponse } from "next/server";
import { createUser } from "../../../controllers/signupcontroller";

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();
    const newUser = await createUser(email, password, name);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


export async function OPTIONS(request) {
  return NextResponse.json({}, { status: 200 });
}