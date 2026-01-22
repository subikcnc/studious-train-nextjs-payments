import { getUser } from "@/lib/actions/user.action";
import { cookies } from "next/headers";

const ChatPage = async () => {
  const response = await getUser();
  const data = await response.json();
  console.log("response in chat", data);
  // const token = cookieStore.get("accountToken")?.value;
  try {
    // const payload = await verifyToken()
  } catch (error) {
    // throw new Error("Invalid token", error);
  }
  return (
    <div className="flex h-screen w-full justify-center items-center flex-col">
      <h1>Client</h1>
    </div>
  );
};

export default ChatPage;
