import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!, // Pusher app identifier (server side only)
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!, // Public key, used by browser to connect
  secret: process.env.PUSHER_SECRET!, // secret key, server side only, used to authenticate events
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true, // Ensures communication is encrypted over HTTPS/WSS
});

export async function POST(req: Request) {
  try {
    // We read the request body as JSON, we take the username and message from the request
    const { username, message } = await req.json();
    // Trigger 'new-message' event on 'chat' channel
    // pusher.trigger sends a real time message
    // CHANNEL: "chat" -> the channel all clients subscribe to
    // EVENT: "new-message" -> the event name client listens for
    // DATA: { username, message } -> payload sent to all clients
    // All subscribed clients clients receive this message in real time
    await pusher.trigger("chat", "new-message", { username, message });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
