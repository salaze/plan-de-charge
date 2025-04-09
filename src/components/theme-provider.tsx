
"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

// Create a context for the theme to be available throughout the app
const ThemeProviderContext = createContext({})

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Set up the theme provider properly
  return (
    <ThemeProviderContext.Provider value={{}}>
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
    </ThemeProviderContext.Provider>
  )
}

// Helper hook to use the theme context
export const useTheme = () => {
  return useContext(ThemeProviderContext)
}
