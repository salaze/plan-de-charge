
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { generateId as generateIdUtil } from "@/utils/idUtils"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export generateId for backward compatibility
export const generateId = generateIdUtil;
