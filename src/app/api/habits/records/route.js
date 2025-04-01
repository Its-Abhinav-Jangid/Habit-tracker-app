import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function GET(req) {
  const { userId } = getAuth(req);
  if (!userId) {
    return new Response("Please login and try again", { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const query = {
    userId: userId,
  };
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const minGoalReached = searchParams.get("minGoalReached");
  const maxGoalReached = searchParams.get("maxGoalReached");
  if (startDate && endDate) {
    query["date"] = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  } else if (startDate || endDate) {
    if (startDate) {
      query["date"] = {
        gte: new Date(startDate),
      };
    }
    if (endDate) {
      query["date"] = {
        lte: new Date(endDate),
      };
    }
  }

  if (minGoalReached && maxGoalReached) {
    query["goalReachedPercent"] = {
      gte: parseFloat(minGoalReached),
      lte: parseFloat(maxGoalReached),
    };
  } else if (minGoalReached || maxGoalReached) {
    if (minGoalReached) {
      query["goalReachedPercent"] = {
        gte: parseFloat(minGoalReached),
      };
    }
    if (maxGoalReached) {
      query["goalReachedPercent"] = {
        lte: parseFloat(maxGoalReached),
      };
    }
  }

  try {
    const records = await prisma.habitRecord.findMany({
      where: query,
      orderBy: {
        date: "desc",
      },
    });
    return new Response(JSON.stringify(records));
  } catch (error) {
    console.error(error);
    return new Response("Some error occured", { status: 500 });
  }
}

export async function POST(req) {
  const { userId } = getAuth(req);
  if (!userId) {
    return new Response("Please login and try again", { status: 401 });
  }
  const data = await req.json();
  try {
    const habit = await prisma.habit.findUnique({
      where: {
        id: parseInt(data.habitId),
        userId: userId,
      },
    });
    if (!habit) {
      // if habit doesn't exist or belong to another user
      return new Response("Habit not found or unauthorized", {
        status: 404,
      });
    }
    const newRecord = await prisma.habitRecord.create({
      data: {
        userId: userId,
        habitId: parseInt(data.habitId),
        goalReachedPercent: parseInt(data.goalReachedPercent),
        notes: data.notes || "",
        date: data.date,
      },
    });
    return new Response(
      JSON.stringify({ msg: "New record created", newRecord: newRecord })
    );
  } catch (error) {
    console.error(error);
    return new Response("Some error occured", { status: 500 });
  }
}
