import Chat from "@/components/chat/chat";
import EsewaForm from "@/components/forms/esewaForm";
import HblForm from "@/components/forms/hblForm";
import KhaltiForm from "@/components/forms/khaltiForm";

export default function Home() {
  return (
    <div className="flex h-screen w-full justify-center items-center flex-col">
      <EsewaForm />
      <KhaltiForm />
      <HblForm />
      <Chat />
    </div>
  );
}
