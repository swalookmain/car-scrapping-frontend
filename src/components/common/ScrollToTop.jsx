import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = ({ behavior = 'auto' }) => {
  const { pathname } = useLocation()

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior })
    } catch (e) {
      // Fallback for environments that don't support options object
      window.scrollTo(0, 0)
    }
  }, [pathname, behavior])

  return null
}

export default ScrollToTop
