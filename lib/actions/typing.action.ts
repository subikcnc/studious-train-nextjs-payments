"use server";

import { pusher } from "../utils/pusher";

export const sendTypingStatus = async ({
  conversationId,
  status,
}: {
  conversationId: string;
  status: "typing" | "stopped";
}) => {
  console.log(
    `Triggering a ${status} event for conversation ${conversationId}`,
  );
  await pusher.trigger(`${"chat-" + conversationId}`, "typing", {
    typing: status,
  });
};
