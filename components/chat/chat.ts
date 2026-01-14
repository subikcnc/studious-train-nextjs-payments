"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe("chat");
    channel.bind("new-message", function (data) {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  const sendMessage = async () => {
    if (!input || !username) return;

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, message: input }),
    });

    setInput("");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2>Live Chat</h2>

      <input
        placeholder="Your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}: </strong>
            {msg.message}
          </div>
        ))}
      </div>

      <input
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "80%" }}
      />
      <button onClick={sendMessage} style={{ width: "18%" }}>
        Send
      </button>
    </div>
  );
}
