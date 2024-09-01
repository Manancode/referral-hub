import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/app/lib/db';
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ tier: user.subscriptionTier });
  } catch (error) {
    console.error('Error fetching user tier:', error);
    return NextResponse.json({ error: "Failed to fetch user tier" }, { status: 500 });
  }
}   