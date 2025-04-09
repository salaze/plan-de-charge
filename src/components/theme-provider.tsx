
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}

// Helper hook to use the theme
export const useTheme = () => {
  const { theme, setTheme } = React.useContext(
    React.createContext({
      theme: "light",
      setTheme: (theme: string) => {},
    })
  )
  return { theme, setTheme }
}
