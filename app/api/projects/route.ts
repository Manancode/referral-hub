import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/app/lib/db';
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(request : Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: "Invalid project name" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { projects: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const projectLimits = {
      FREE: 1,
      BASIC: 2,
      PREMIUM: 3,
    };

    if (user.projects.length >= projectLimits[user.subscriptionTier]) {
      return NextResponse.json(
        { error: `You have reached the maximum number of projects for your ${user.subscriptionTier} tier` },
        { status: 403 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId: user.id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}