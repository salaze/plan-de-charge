
import { useState, useEffect } from "react"

// Mobile breakpoint in pixels
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with default value that won't cause hydration mismatch
  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Mark component as mounted
    setIsMounted(true)
    
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

  // Only return the actual value if component is mounted
  return isMounted ? isMobile : false
}
