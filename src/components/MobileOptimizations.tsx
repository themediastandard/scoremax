'use client';

import { useEffect } from 'react';

export default function MobileOptimizations() {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload hero images
      const heroImages = [
        '/logo.avif',
        // Add other critical images here
      ];
      
      heroImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    };

    // Optimize for mobile performance
    const optimizeForMobile = () => {
      // Disable hover effects on touch devices
      if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
      }

      // Optimize scroll performance
      let ticking = false;
      const optimizeScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            // Add any scroll optimizations here
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', optimizeScroll, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', optimizeScroll);
      };
    };

    // Initialize optimizations
    preloadCriticalResources();
    const cleanup = optimizeForMobile();

    return cleanup;
  }, []);

  return null;
}
