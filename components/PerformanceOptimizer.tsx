"use client"

import { useEffect } from 'react'
import Head from 'next/head'

export function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    const criticalResources = [
      '/manifest.json',
      '/sw.js',
      '/icons/icon-192x192.svg',
    ]

    criticalResources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource
      link.as = resource.endsWith('.json') ? 'fetch' : 'image'
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })

    // Preload critical fonts
    const fontLinks = [
      { rel: 'preload', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', as: 'style' },
    ]

    fontLinks.forEach(font => {
      const link = document.createElement('link')
      Object.assign(link, font)
      document.head.appendChild(link)
    })

    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              console.log('LCP:', entry.startTime)
            }
            if (entry.entryType === 'first-input') {
              const firstInputEntry = entry as PerformanceEventTiming
              console.log('FID:', firstInputEntry.processingStart - firstInputEntry.startTime)
            }
            if (entry.entryType === 'layout-shift') {
              const layoutShiftEntry = entry as any
              console.log('CLS:', layoutShiftEntry.value)
            }
          }
        })
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
      } catch (error) {
        console.warn('Performance monitoring not supported:', error)
      }
    }

    return () => {
      // Cleanup if needed
    }
  }, [])

  return null
} 