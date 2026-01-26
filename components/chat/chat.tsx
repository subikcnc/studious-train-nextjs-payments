"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function Chat() {
  const [messages, setMessages] = useState<
    { username: string; message: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Create a new pusher instance
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe("chat"); // chat is the channel
    channel.bind(
      "new-message",
      function (data: { username: string; message: string }) {
        // new-message is the event client listens to
        setMessages((prev) => [...prev, data]);
      },
    );

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const sendMessage = async () => {
    if (!input || !username) return;

    await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, message: input }),
    });
    setInput("");
  };

  return (
    <div className="flex flex-col">
      <Input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        type="text"
        placeholder="Your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <Button onClick={() => sendMessage()}>Send Message</Button>

      {/* Messages here */}
      {messages.map((message) => (
        <div key={message.username}>
          <p>{message.username}</p>
          <p>{message.message}</p>
        </div>
      ))}
    </div>
  );
}
