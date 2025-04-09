
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Helper hook to use the theme
export const useTheme = () => {
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme, setTheme } = useNextTheme()
  
  // After mounting, we have access to the theme
  React.useEffect(() => setMounted(true), [])
  
  return {
    theme: mounted ? resolvedTheme : undefined,
    setTheme,
    mounted
  }
}

// Re-export the useTheme hook from next-themes
import { useTheme as useNextTheme } from "next-themes"
