"use client";

import { useEffect, useRef, ReactNode } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotationType } from "rough-notation/lib/model";

type Props = {
  type: RoughAnnotationType;
  color?: string;
  strokeWidth?: number;
  padding?: number | [number, number, number, number];
  iterations?: number;
  multiline?: boolean;
  animationDuration?: number;
  children: ReactNode;
  className?: string;
  as?: "span" | "div" | "strong" | "em";
};

export function Annotation({
  type,
  color = "#047857",
  strokeWidth = 2,
  padding = 4,
  iterations = 2,
  multiline = false,
  animationDuration = 800,
  children,
  className,
  as: Tag = "span",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const a = annotate(ref.current, {
      type,
      color,
      strokeWidth,
      padding,
      iterations,
      multiline,
      animationDuration,
    });
    a.show();
    return () => a.remove();
  }, [type, color, strokeWidth, padding, iterations, multiline, animationDuration]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
