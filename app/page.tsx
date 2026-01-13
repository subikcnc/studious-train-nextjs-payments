import EsewaForm from "@/components/forms/esewaForm";
import KhaltiForm from "@/components/forms/khaltiForm";

export default function Home() {
  return (
    <div className="flex h-screen w-full justify-center items-center flex-col">
      <EsewaForm />
      <KhaltiForm />
    </div>
  );
}
