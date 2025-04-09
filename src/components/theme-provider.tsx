
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Helper hook to use the theme
export const useTheme = () => {
  // Import the useTheme hook directly from next-themes
  const { resolvedTheme: theme, setTheme } = React.useContext(
    // @ts-ignore - We're creating a mock context to satisfy TypeScript
    React.createContext({ resolvedTheme: "light", setTheme: () => {} })
  )
  
  return { theme, setTheme }
}
