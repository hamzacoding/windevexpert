'use client';

import { useEffect, useState } from 'react';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ children }) => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [isLowPerformanceDevice, setIsLowPerformanceDevice] = useState(false);

  useEffect(() => {
    // Vérifier les préférences utilisateur pour la réduction de mouvement
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Détecter les appareils à faibles performances
    const detectLowPerformance = () => {
      // Vérifier le nombre de cœurs CPU
      const hardwareConcurrency = navigator.hardwareConcurrency || 1;
      
      // Vérifier la mémoire disponible (si supporté)
      const deviceMemory = (navigator as any).deviceMemory || 4;
      
      // Vérifier la connexion réseau
      const connection = (navigator as any).connection;
      const isSlowConnection = connection && 
        (connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g' || 
         connection.effectiveType === '3g');

      // Considérer comme faible performance si :
      // - Moins de 4 cœurs CPU
      // - Moins de 4GB de RAM
      // - Connexion lente
      const isLowPerf = hardwareConcurrency < 4 || deviceMemory < 4 || isSlowConnection;
      
      setIsLowPerformanceDevice(isLowPerf);
    };

    detectLowPerformance();

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Appliquer les optimisations CSS si nécessaire
  useEffect(() => {
    if (shouldReduceMotion || isLowPerformanceDevice) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      document.documentElement.style.setProperty('--animation-delay', '0s');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.style.removeProperty('--animation-delay');
    }
  }, [shouldReduceMotion, isLowPerformanceDevice]);

  return (
    <div 
      data-reduce-motion={shouldReduceMotion}
      data-low-performance={isLowPerformanceDevice}
      style={{
        '--motion-reduce': shouldReduceMotion ? '1' : '0',
        '--low-performance': isLowPerformanceDevice ? '1' : '0',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

export default PerformanceOptimizer;