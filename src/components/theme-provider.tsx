
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function useTheme() {
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme, setTheme, theme } = React.useContext(
    // @ts-ignore - ThemeContext exists in next-themes
    window.React !== undefined ? 
      require("next-themes").ThemeContext : 
      React.createContext({ theme: "system", resolvedTheme: "system", setTheme: () => {} })
  )
  
  // After mounting, we have access to the theme
  React.useEffect(() => setMounted(true), [])
  
  return {
    theme: mounted ? theme : "system",
    resolvedTheme: mounted ? resolvedTheme : "system",
    setTheme,
    mounted
  }
}
