import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function DELETE(req, { params }) {
  const { id } = await params;
  const { userId } = getAuth(req);
  if (!userId) {
    return new Response("Please login and try again", { status: 401 });
  }
  try {
    const deletedHabit = await prisma.habit.delete({
      where: {
        id: parseInt(id),
        userId: userId,
      },
    });
    return new Response(
      JSON.stringify({ msg: "habit deleted", deletedHabit: deletedHabit })
    );
  } catch (error) {
    if (error.code === "P2025") {
      return new Response(
        JSON.stringify({ error: "Habit not found or unauthorized" }),
        {
          status: 401,
        }
      );
    }
    return new Response(
      JSON.stringify("Some error occured", {
        status: 500,
      })
    );
  }
}
export async function GET(req, { params }) {
  let { id } = await params;
  id = parseInt(id);
  const { userId } = getAuth(req);

  if (!userId) {
    return new Response("Please login and try again", { status: 401 });
  }
  try {
    const habit = await prisma.habit.findFirst({
      where: {
        userId: userId,
        id: id,
      },
    });
    if (!habit) {
      return new Response("Habit not found or unauthorized", {
        status: 404,
      });
    }
    return new Response(JSON.stringify(habit));
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify("Some error occured", {
        status: 500,
      })
    );
  }
}
export async function PUT(req, { params }) {
  const { userId } = getAuth(req);
  let { id } = await params;
  id = parseInt(id);
  const data = await req.json();
  if (!userId) {
    return new Response("Please login and try again", { status: 401 });
  }
  try {
    const updatedHabit = await prisma.habit.update({
      data: {
        name: data.name,
        description: data.description,
        dailyGoal: parseInt(data.dailyGoal) || 100,
      },
      where: {
        id: id,
        userId: userId,
      },
    });
    return new Response(
      JSON.stringify({ msg: "Habit updated", habit: updatedHabit })
    );
  } catch (error) {
    if (error.code === "P2025") {
      return new Response(
        JSON.stringify({ error: "Habit not found or unauthorized" }),
        {
          status: 401,
        }
      );
    }
    return new Response("Some error occured", {
      status: 500,
    });
  }
}
