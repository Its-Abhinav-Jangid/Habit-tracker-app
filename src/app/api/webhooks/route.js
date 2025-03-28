import { Webhook } from "svix";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify payload with headers
  let evt;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Do something with payload
  const { id } = evt.data;
  const eventType = evt.type;
  if (eventType === "user.created") {
    const userExists = await prisma.user.findFirst({
      where: {
        email: evt.data.email_addresses[0].email_address,
      },
    });

    if (!userExists) {
      createUser(evt.data);
    }
  } else if (eventType === "user.deleted") {
    deleteUser(evt.data);
  } else if (eventType === "user.updated") {
    updateUser(evt.data);
  }

  return new Response("Webhook received", { status: 200 });
}

async function createUser(userData) {
  return await prisma.user.create({
    data: {
      id: userData.id,
      name: userData.first_name,
      email: userData.email_addresses[0].email_address,
      image: userData.image_url,
    },
  });
}
async function deleteUser(userData) {
  return await prisma.user.delete({
    where: {
      id: userData.id,
    },
  });
}
async function updateUser(userData) {
  return await prisma.user.update({
    data: {
      name: userData.first_name,
      email: userData.email_addresses[0].email_address,
      image: userData.image_url,
    },
    where: {
      id: userData.id,
    },
  });
}
