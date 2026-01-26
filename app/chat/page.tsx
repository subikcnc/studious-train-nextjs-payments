import ChatList from "@/components/chat/chatList";
import { getAllUsers, getUser } from "@/lib/actions/user.action";

const ChatPage = async () => {
  const response = await getUser();
  const usersResponse = await getAllUsers();
  const allUsers = await usersResponse.json();
  const data = await response.json();
  console.log("response in chat", data);
  return (
    <div className="container mx-auto py-8">
      <ChatList loggedInUser={data} users={allUsers} />{" "}
    </div>
  );
};

export default ChatPage;
