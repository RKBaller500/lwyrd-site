"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  panelClassName?: string;
  closeIconClassName?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-md",
  panelClassName = "bg-[#141C2E] p-8",
  closeIconClassName = "text-[#8A93A6]",
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full ${maxWidth} ${panelClassName} rounded-3xl shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 transition-colors z-10"
          aria-label="Close dialog"
        >
          <X size={16} className={closeIconClassName} />
        </button>
        <div id={titleId}>
          {children}
        </div>
      </div>
    </div>
  );
}
