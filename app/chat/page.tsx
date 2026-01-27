import ChatList from "@/components/chat/chatList";
import { getAllUsers, getUser } from "@/lib/actions/user.action";

const ChatPage = async () => {
  const data = await getUser();
  const allUsers = await getAllUsers();

  console.log("response in chat", data);
  return (
    <div className="container mx-auto py-8">
      <ChatList loggedInUser={data} users={allUsers} />{" "}
    </div>
  );
};

export default ChatPage;
