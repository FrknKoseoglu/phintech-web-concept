"use client";

import { toast } from "sonner";
import { ReactNode } from "react";

interface DemoButtonProps {
  children: ReactNode;
  featureName: string;
  className?: string;
}

/**
 * A button that shows a concept-unavailable toast when clicked.
 * Use this for features not implemented in the concept project.
 */
export default function DemoButton({ children, featureName, className }: DemoButtonProps) {
  return (
    <button
      onClick={() => toast.info(`${featureName} özelliği Konsept Projede mevcut değildir`)}
      className={className}
    >
      {children}
    </button>
  );
}

