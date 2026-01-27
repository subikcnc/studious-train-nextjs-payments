"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { getMessages, sendMessage } from "@/lib/actions/message.action";
import { ScrollArea } from "../ui/scroll-area";

interface ChatListProps {
  loggedInUser: {
    id: string;
    email: string;
    username: string;
  };
  users: {
    id: string;
    email: string;
    name: string;
  }[];
}

const ChatList = ({ loggedInUser, users }: ChatListProps) => {
  const [selectedUser, setSelectedUser] = useState<{
    email: string;
    name: string;
    id: string;
  } | null>(users[0]);
  const [messageToSend, setMessageToSend] = useState<string>("");
  const [allMessages, setAllMessages] = useState<Messages>([]);

  const handleSend = async () => {
    console.log("Handling send", loggedInUser.email, selectedUser?.email);
    const data = await sendMessage({
      senderEmail: loggedInUser.email,
      receiverEmail: selectedUser!.email,
      content: messageToSend,
    });
    setMessageToSend("");
    console.log("response", data);

    // As soon as sending the message we need to get the message and then append it in the UI
    const { conversationId } = data;
    const messages = await getMessages(conversationId);
    setAllMessages(messages);
  };

  return (
    <div>
      <h1>
        Logged in as: {loggedInUser.username} {loggedInUser.id}
      </h1>
      <h2>
        Selected User {selectedUser?.name} {selectedUser?.id}
      </h2>
      <div className="flex gap-6">
        <div className="flex flex-col gap-1">
          {users.map(
            (user) =>
              user.email !== loggedInUser.email && (
                <Button
                  key={user.email}
                  onClick={() => setSelectedUser(user)}
                  variant="outline"
                  className={cn(
                    "w-full justify-start",
                    selectedUser?.email === user.email &&
                      "bg-black text-white hover:bg-black hover:text-white",
                  )}
                >
                  {user.name}
                </Button>
              ),
          )}
        </div>
        <div className="flex-1 h-[calc(100vh-20rem)] flex flex-col gap-4">
          {/* Previous messages area */}
          <ScrollArea className="flex-1 border rounded-md">
            <div className="flex flex-col gap-2 p-4">
              {allMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.accountId === loggedInUser.id && "justify-end",
                  )}
                >
                  <p
                    className={cn(
                      message.accountId === loggedInUser.id &&
                        "bg-violet-700 text-white",
                      message.accountId !== loggedInUser.id && "bg-gray-300",
                      "p-2 rounded m-0",
                    )}
                  >
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Textarea
            className="h-[10%]"
            placeholder={`Message ${selectedUser?.name}`}
            value={messageToSend}
            onChange={(e) => setMessageToSend(e.target.value)}
          />
          <Button className="self-end mt-4" onClick={handleSend}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
