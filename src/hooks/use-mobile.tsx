
import { useState, useEffect } from "react"

// Mobile breakpoint in pixels
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with undefined to prevent hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    // Function to check if window is mobile size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Initial check
    checkMobile()
    
    // Add event listener
    window.addEventListener("resize", checkMobile)
    
    // Clean up
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Return false as a default if not yet determined
  return isMobile === null ? false : isMobile
}
