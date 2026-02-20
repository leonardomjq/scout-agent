import { Loader2 } from "lucide-react";

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="size-6 text-accent-green animate-spin" />
    </div>
  );
}
