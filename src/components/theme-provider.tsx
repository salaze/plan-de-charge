
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Define the ThemeContextType to match what's expected from next-themes
type ThemeContextType = {
  theme?: string;
  resolvedTheme?: string;
  setTheme: (theme: string) => void;
}

// Create a default context value
const defaultThemeContext: ThemeContextType = {
  theme: "system",
  resolvedTheme: "system",
  setTheme: () => {}
}

export function useTheme() {
  const [mounted, setMounted] = React.useState(false)
  
  // Create a safe way to access the ThemeContext
  let themeContext: ThemeContextType = defaultThemeContext;
  
  try {
    // Only try to access ThemeContext on the client side
    const { ThemeContext } = require("next-themes");
    themeContext = React.useContext(ThemeContext as React.Context<ThemeContextType>) || defaultThemeContext;
  } catch (e) {
    // If we're on the server or there's an error, use default context
    console.error("Error accessing ThemeContext:", e);
  }
  
  const { resolvedTheme, setTheme, theme } = themeContext;
  
  // After mounting, we have access to the theme
  React.useEffect(() => setMounted(true), [])
  
  return {
    theme: mounted ? theme : "system",
    resolvedTheme: mounted ? resolvedTheme : "system",
    setTheme,
    mounted
  }
}
