
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Helper hook to use the theme with SSR safety
export const useTheme = () => {
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme, setTheme, theme } = React.useContext(
    // @ts-ignore - ThemeContext is not exported from next-themes
    // This is a safe cast because we know the implementation
    require("next-themes").ThemeContext
  )
  
  // After mounting, we have access to the theme
  React.useEffect(() => setMounted(true), [])
  
  return {
    theme: mounted ? theme : undefined,
    resolvedTheme: mounted ? resolvedTheme : undefined,
    setTheme,
    mounted
  }
}
