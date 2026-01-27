"use server";

import db from "@/db";
import {
  accounts,
  conversationParticipants,
  conversations,
  messages,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function createMessage() {}

export async function getMessages(conversationId: string) {
  try {
    const storedMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .limit(10)
      .orderBy(desc(messages.createdAt));

    if (!storedMessages) throw new Error("No messages found");

    // Send all the messages back to the client based on what the conversation id is
    return JSON.parse(JSON.stringify(storedMessages));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Internal server error",
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
      // They have already conversed before so need to get the conversation id from the conversation participants table
      const conversationId = participantSender[0].conversationId;
      const [insertedMessage] = await db
        .insert(messages)
        .values({
          content,
          conversationId,
          accountId: sender[0].id,
        })
        .returning({
          id: messages.id,
        });
      console.log("Inserted message is", insertedMessage);
      // Need to get all the messages from the conversation
      const allMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId));
      console.log("Messages are", allMessages);
      return {
        message: "Message sent successfully",
        conversationId: conversationId,
      };
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

      return {
        conversationId: JSON.parse(JSON.stringify(conversation.id)),
        message: "New Message sent successfully",
      };

      //   await db.insert(conversationParticipants).values({});
    }

    // const conversation = await db
    //   .select()
    //   .from(conversations)
    //   .where(eq(conversations.id, conversationId));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Internal server error",
    );
  }
}
