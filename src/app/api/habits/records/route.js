import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function GET(req) {
  const { userId } = getAuth(req);
  if (!userId) {
    return new Response("Please login and try again", { status: 401 });
  }
  try {
    const records = await prisma.habitRecord.findMany({
      where: {
        userId: userId,
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
