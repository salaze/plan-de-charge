
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export const ThemeProviderContext = React.createContext<{
  theme: string | undefined;
  setTheme: (theme: string) => void;
}>({
  theme: undefined,
  setTheme: () => {},
})

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Use React.useState to properly initialize state
  const [theme, setTheme] = React.useState<string | undefined>(props.defaultTheme)
  
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
