import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useCallback } from "react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  // Use wrapper div for better iOS touch handling
  return (
    <div 
      className="fixed right-6 bottom-20 z-20 touch-manipulation"
      onClick={onClick}
      role="button"
      aria-label="Add new item"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Button
        type="button"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:bg-primary/90"
      >
        <PlusIcon className="h-6 w-6" />
      </Button>
    </div>
  );
}
