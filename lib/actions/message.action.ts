"use server";

import db from "@/db";
import {
  accounts,
  conversationParticipants,
  conversations,
  messages,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function createMessage() {}

export async function getMessages(conversationId: string) {
  try {
    const storedMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId));

    if (!storedMessages) throw new Error("No messages found");

    return NextResponse.json(storedMessages, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

interface SendMessageProps {
  senderEmail: string;
  receiverEmail: string;
  content: string;
}

export async function sendMessage({
  senderEmail,
  receiverEmail,
  content,
}: SendMessageProps) {
  try {
    const sender = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, senderEmail));
    const receiver = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, receiverEmail));

    console.log("Sender and receiver are", sender, receiver);

    if (!sender || !receiver) throw new Error("Sender or receiver not found");

    // Check if these accounts are participating for the first time
    const participantSender = await db
      .select()
      .from(conversationParticipants)
      .where(eq(conversationParticipants.accountId, sender[0].id));

    const participantReceiver = await db
      .select()
      .from(conversationParticipants)
      .where(eq(conversationParticipants.accountId, receiver[0].id));

    console.log(
      "Participant sender and receiver are",
      participantSender,
      participantReceiver,
    );

    if (
      participantReceiver &&
      participantReceiver.length > 0 &&
      participantSender &&
      participantSender.length > 0
    ) {
      console.log("no need to create a new conversation");
      // They have already conversed before
    } else {
      console.log("Creating a new conversation");
      // This is their first conversation
      const [conversation] = await db
        .insert(conversations)
        .values({})
        .returning({
          id: conversations.id,
        });

      await db.insert(conversationParticipants).values({
        accountId: sender[0].id,
        conversationId: conversation.id,
      });

      await db.insert(conversationParticipants).values({
        accountId: receiver[0].id,
        conversationId: conversation.id,
      });

      const [insertedMessage] = await db
        .insert(messages)
        .values({
          content,
          conversationId: conversation.id,
          accountId: sender[0].id,
        })
        .returning({
          id: messages.id,
        });

      return NextResponse.json({
        message: "Message sent successfully",
      });

      //   await db.insert(conversationParticipants).values({});
    }

    // const conversation = await db
    //   .select()
    //   .from(conversations)
    //   .where(eq(conversations.id, conversationId));
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
