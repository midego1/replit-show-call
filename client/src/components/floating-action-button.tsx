import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  // Handle touch events to improve touch responsiveness
  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    // Prevent ghost clicks and double firing of events
    e.preventDefault();
    onClick();
  };

  return (
    <Button
      onClick={onClick}
      onTouchStart={handleTouchStart}
      className="fixed right-6 bottom-20 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-20 active:bg-primary/90"
      aria-label="Add new item"
    >
      <PlusIcon className="h-6 w-6" />
    </Button>
  );
}
