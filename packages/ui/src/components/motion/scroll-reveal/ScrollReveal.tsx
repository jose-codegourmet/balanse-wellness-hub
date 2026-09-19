"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";

type ScrollRevealDirection = "up" | "down" | "left" | "right";

type ScrollRevealProps = {
  children: ReactNode;
  delay?: number;
  direction?: ScrollRevealDirection;
  className?: string;
  once?: boolean;
};

const OFFSET = 24;

function getOffset(direction: ScrollRevealDirection) {
  switch (direction) {
    case "up":
      return { x: 0, y: OFFSET };
    case "down":
      return { x: 0, y: -OFFSET };
    case "left":
      return { x: OFFSET, y: 0 };
    case "right":
      return { x: -OFFSET, y: 0 };
  }
}

function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className,
  once = true,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const offset = getOffset(direction);

  if (prefersReducedMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export { ScrollReveal };
