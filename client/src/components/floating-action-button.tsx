import { PlusIcon } from "lucide-react";
import React, { useState, useCallback } from "react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  // State to prevent double-clicks
  const [isClicking, setIsClicking] = useState(false);
  
  // Debounced click handler for iOS
  const handleClick = useCallback(() => {
    if (isClicking) return;
    
    setIsClicking(true);
    
    // Small delay to prevent double tap issues on iOS
    setTimeout(() => {
      onClick();
      setIsClicking(false);
    }, 100);
  }, [onClick, isClicking]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isClicking}
      aria-label="Add new item"
      style={{
        position: 'fixed',
        right: '24px',
        bottom: '80px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: isClicking ? 'var(--primary-light)' : 'var(--primary)',
        color: 'white',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        padding: 0,
        zIndex: 20,
        cursor: isClicking ? 'not-allowed' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        transition: 'background-color 0.2s'
      }}
    >
      <PlusIcon style={{ width: '26px', height: '26px' }} />
    </button>
  );
}
