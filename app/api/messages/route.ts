import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true, // Ensures communication is encrypted over HTTPS/WSS
});

export async function POST(req: Request) {
  try {
    const { username, message } = await req.json();

    // Trigger 'new-message' event on 'chat' channel
    // pusher.trigger sends a real time message
    // channel: "chat" -> the channel all clients subscribe to
    // event: "new-message" -> the event name client listens for
    // data: { username, message } -> payload sent to all clients
    // All subscribed clients clients receive this message in real time
    await pusher.trigger("chat", "new-message", { username, message });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
