import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/app/lib/db";
import { authOptions } from "../auth/[...nextauth]/authOptions";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const searchId = searchParams.get('searchId');

  if (!searchId) {
    return NextResponse.json({ error: "Search ID is required" }, { status: 400 });
  }

  const results = await prisma.searchResult.findMany({
    where: {
      search: {
        id: searchId,
        userId: session.user.id
      }
    },
    orderBy: {
      relevanceScore: 'desc'
    }
  });

  return NextResponse.json(results);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { searchId, username, postTitle, postContent, subreddit, relevanceScore } = body;

  if (!searchId || !username || !postTitle || !postContent || !subreddit || relevanceScore === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify that the search belongs to the current user
  const search = await prisma.search.findUnique({
    where: {
      id: searchId,
      userId: session.user.id
    }
  });

  if (!search) {
    return NextResponse.json({ error: "Search not found or unauthorized" }, { status: 404 });
  }

  const result = await prisma.searchResult.create({
    data: {
      username,
      postTitle,
      postContent,
      subreddit,
      relevanceScore,
      searchId
    }
  });

  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, contacted } = body;

  if (!id || contacted === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify that the result belongs to a search owned by the current user
  const result = await prisma.searchResult.findFirst({
    where: {
      id,
      search: {
        userId: session.user.id
      }
    }
  });

  if (!result) {
    return NextResponse.json({ error: "Result not found or unauthorized" }, { status: 404 });
  }

  const updatedResult = await prisma.searchResult.update({
    where: { id },
    data: { contacted }
  });

  return NextResponse.json(updatedResult);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: "Result ID is required" }, { status: 400 });
  }

  // Verify that the result belongs to a search owned by the current user
  const result = await prisma.searchResult.findFirst({
    where: {
      id,
      search: {
        userId: session.user.id
      }
    }
  });

  if (!result) {
    return NextResponse.json({ error: "Result not found or unauthorized" }, { status: 404 });
  }

  await prisma.searchResult.delete({
    where: { id }
  });

  return NextResponse.json({ message: "Result deleted successfully" });
}