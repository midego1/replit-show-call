import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed right-6 bottom-20 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-20"
    >
      <PlusIcon className="h-6 w-6" />
    </Button>
  );
}
