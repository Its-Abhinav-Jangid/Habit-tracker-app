import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  const { userId } = getAuth(req);
  if (!userId) {
    return new Response("Please login and try again", { status: 401 });
  }
  const query = {
    userId: userId,
  };
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (startDate && endDate) {
    query["createdAt"] = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  } else if (startDate || endDate) {
    if (startDate) {
      query["createdAt"] = {
        gte: new Date(startDate),
      };
    }
    if (endDate) {
      query["createdAt"] = {
        lte: new Date(endDate),
      };
    }
  }

  const habits = await prisma.habit.findMany({
    where: query,
    orderBy: {
      createdAt: "desc",
    },
  });

  return new Response(JSON.stringify(habits));
}

export async function POST(req) {
  // const userId = "user_2uuYjS5oxZt0Y7RIx9802chwPRZ";
  const { userId } = getAuth(req);

  const data = await req.json();
  if (!userId) {
    return new Response("Please login and try again", { status: 401 });
  }
  try {
    const newHabit = await prisma.habit.create({
      data: {
        userId: userId,
        name: data.name || "",
        description: data.description || "",
        dailyGoal: parseInt(data.dailyGoal) || 100,
      },
    });
    return new Response(
      JSON.stringify({ msg: "Habit created", habit: newHabit })
    );
  } catch (error) {
    console.error(error);
    return new Response("Some error occured", {
      status: 500,
    });
  }
}
