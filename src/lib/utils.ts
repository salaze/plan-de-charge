
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ajoute un style CSS global à la page
 */
export function addGlobalStyle(css: string) {
  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);
  
  return style;
}
