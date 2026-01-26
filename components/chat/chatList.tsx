"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { sendMessage } from "@/lib/actions/message.action";

interface ChatListProps {
  loggedInUser: {
    email: string;
    username: string;
  };
  users: {
    email: string;
    name: string;
  }[];
}

const ChatList = ({ loggedInUser, users }: ChatListProps) => {
  console.log("all users", users);
  const [selectedUser, setSelectedUser] = useState<{
    email: string;
    name: string;
  } | null>(users[0]);

  const handleSend = async () => {
    console.log("Handling send", loggedInUser.email, selectedUser?.email);
    const response = await sendMessage({
      senderEmail: loggedInUser.email,
      receiverEmail: selectedUser!.email,
      content: "Hello",
    });
    const data = await response?.json();
    console.log("response", data);
  };

  return (
    <div>
      <h1>Logged in as: {loggedInUser.username}</h1>
      <h2>Selected User {selectedUser?.name}</h2>
      <div className="flex gap-6">
        <div className="flex flex-col gap-1">
          {users.map(
            (user) =>
              user.email !== loggedInUser.email && (
                <Button
                  key={user.email}
                  onClick={() => setSelectedUser(user)}
                  variant="default"
                  className={cn(
                    "w-full justify-start",
                    selectedUser?.email === user.email &&
                      "bg-amber-400 text-black",
                  )}
                >
                  {user.name}
                </Button>
              ),
          )}
        </div>
        <div className="flex-1 h-[calc(100vh-20rem)] flex flex-col">
          <Textarea
            className="h-full"
            placeholder={`Message ${selectedUser?.name}`}
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
