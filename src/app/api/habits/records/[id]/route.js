import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const { userId } = getAuth(req);

  if (!userId) {
    return new Response("Please login and try again", { status: 401 });
  }
  const { id } = await params;
  try {
    const record = await prisma.habitRecord.findUnique({
      where: {
        id: parseInt(id),
        userId: userId,
      },
    });
    return new Response(JSON.stringify(record));
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return new Response(
        JSON.stringify({ error: "Habit not found or unauthorized" }),
        {
          status: 404,
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

export async function DELETE(req, { params }) {
  const { id } = await params;
  const { userId } = getAuth(req);
  if (!userId) {
    return new Response("Please login and try again", { status: 401 });
  }
  try {
    const deletedRecord = await prisma.habitRecord.delete({
      where: {
        id: parseInt(id),
        userId: userId,
      },
    });
    return new Response(
      JSON.stringify({ msg: "record deleted", deletedRecord: deletedRecord })
    );
  } catch (error) {
    if (error.code === "P2025") {
      return new Response(
        JSON.stringify({ error: "Record not found or unauthorized" }),
        {
          status: 404,
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

export async function PUT(req, { params }) {
  const { userId } = getAuth(req);

  if (!userId) {
    return new Response("Please login and try again", { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();
  try {
    const updatedRecord = await prisma.habitRecord.update({
      data: {
        goalReachedPercent: parseInt(data.goalReachedPercent),
        notes: data.notes,
        date: data.date,
      },
      where: {
        id: parseInt(id),
        userId: userId,
      },
    });
    return new Response(
      JSON.stringify({ msg: "Record updated", habit: updatedRecord })
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
