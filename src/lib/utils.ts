
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { generateId as generateIdUtil, ensureValidUuid as ensureValidUuidUtil } from "@/utils/idUtils"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export generateId and ensureValidUuid for backward compatibility
export const generateId = generateIdUtil;
export const ensureValidUuid = ensureValidUuidUtil;
