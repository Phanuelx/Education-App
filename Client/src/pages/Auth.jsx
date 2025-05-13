import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "login";
  
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12">
      <AuthForm defaultTab={tab} />
    </div>
  );
}