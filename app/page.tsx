import EsewaForm from "@/components/forms/esewaForm";
import HblForm from "@/components/forms/HblForm";
import KhaltiForm from "@/components/forms/khaltiForm";

export default function Home() {
  return (
    <div className="flex h-screen w-full justify-center items-center flex-col gap-4">
      <EsewaForm />
      <KhaltiForm />
      <HblForm />
    </div>
  );
}
