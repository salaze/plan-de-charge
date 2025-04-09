
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

// Create a proper theme context with default values
const ThemeProviderContext = React.createContext<{
  theme?: string;
  setTheme?: (theme: string) => void;
}>({
  theme: undefined,
  setTheme: () => {},
})

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<string | undefined>(undefined)
  
  // Use NextThemesProvider directly
  return (
    <NextThemesProvider {...props}>
      <ThemeProviderContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeProviderContext.Provider>
    </NextThemesProvider>
  )
}

// Helper hook to use the theme context
export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
