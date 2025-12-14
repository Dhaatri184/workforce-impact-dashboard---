// Animation utilities for chart components

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export const ANIMATION_PRESETS = {
  fast: { duration: 200, easing: 'ease-out' },
  normal: { duration: 300, easing: 'ease-in-out' },
  slow: { duration: 500, easing: 'ease-in-out' },
  bounce: { duration: 400, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  smooth: { duration: 250, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
} as const;

export const createStaggeredAnimation = (
  elements: NodeListOf<Element> | Element[],
  config: AnimationConfig,
  staggerDelay: number = 50
): void => {
  Array.from(elements).forEach((element, index) => {
    const delay = (config.delay || 0) + (index * staggerDelay);
    
    if (element instanceof HTMLElement) {
      element.style.animationDelay = `${delay}ms`;
      element.style.animationDuration = `${config.duration}ms`;
      element.style.animationTimingFunction = config.easing;
    }
  });
};

export const fadeIn = (element: HTMLElement, config: AnimationConfig = ANIMATION_PRESETS.normal): void => {
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  element.style.transition = `opacity ${config.duration}ms ${config.easing}, transform ${config.duration}ms ${config.easing}`;
  
  requestAnimationFrame(() => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  });
};

export const slideIn = (
  element: HTMLElement, 
  direction: 'left' | 'right' | 'up' | 'down' = 'up',
  config: AnimationConfig = ANIMATION_PRESETS.normal
): void => {
  const transforms = {
    left: 'translateX(-100%)',
    right: 'translateX(100%)',
    up: 'translateY(-100%)',
    down: 'translateY(100%)'
  };
  
  element.style.transform = transforms[direction];
  element.style.transition = `transform ${config.duration}ms ${config.easing}`;
  
  requestAnimationFrame(() => {
    element.style.transform = 'translateX(0) translateY(0)';
  });
};

export const scaleIn = (element: HTMLElement, config: AnimationConfig = ANIMATION_PRESETS.bounce): void => {
  element.style.transform = 'scale(0.8)';
  element.style.opacity = '0';
  element.style.transition = `transform ${config.duration}ms ${config.easing}, opacity ${config.duration}ms ${config.easing}`;
  
  requestAnimationFrame(() => {
    element.style.transform = 'scale(1)';
    element.style.opacity = '1';
  });
};

export const pulseHighlight = (element: HTMLElement, color: string = '#3B82F6'): void => {
  const originalBoxShadow = element.style.boxShadow;
  
  element.style.transition = 'box-shadow 200ms ease-in-out';
  element.style.boxShadow = `0 0 0 4px ${color}40, 0 0 20px ${color}20`;
  
  setTimeout(() => {
    element.style.boxShadow = originalBoxShadow;
  }, 600);
};

// Chart-specific animations
export const animateChartEntry = (chartContainer: HTMLElement): void => {
  const chartElements = chartContainer.querySelectorAll('.recharts-layer, .recharts-line, .recharts-bar, .recharts-scatter');
  
  chartElements.forEach((element, index) => {
    if (element instanceof HTMLElement) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
      element.style.transitionDelay = `${index * 100}ms`;
      
      requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      });
    }
  });
};

export const animateDataUpdate = (chartContainer: HTMLElement): void => {
  const chartElements = chartContainer.querySelectorAll('.recharts-line, .recharts-bar, .recharts-scatter');
  
  chartElements.forEach((element) => {
    if (element instanceof HTMLElement) {
      element.style.transition = 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Add a subtle pulse effect
      element.style.transform = 'scale(1.02)';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 200);
    }
  });
};

// Tooltip animations
export const animateTooltip = (tooltipElement: HTMLElement, show: boolean): void => {
  if (show) {
    tooltipElement.style.opacity = '0';
    tooltipElement.style.transform = 'translateY(10px) scale(0.95)';
    tooltipElement.style.transition = 'opacity 150ms ease-out, transform 150ms ease-out';
    
    requestAnimationFrame(() => {
      tooltipElement.style.opacity = '1';
      tooltipElement.style.transform = 'translateY(0) scale(1)';
    });
  } else {
    tooltipElement.style.transition = 'opacity 100ms ease-in, transform 100ms ease-in';
    tooltipElement.style.opacity = '0';
    tooltipElement.style.transform = 'translateY(5px) scale(0.98)';
  }
};

// Loading animations
export const createLoadingAnimation = (element: HTMLElement): void => {
  element.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)';
  element.style.backgroundSize = '200% 100%';
  element.style.animation = 'shimmer 1.5s infinite';
  
  // Add shimmer keyframes if not already present
  if (!document.querySelector('#shimmer-keyframes')) {
    const style = document.createElement('style');
    style.id = 'shimmer-keyframes';
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
};

export const removeLoadingAnimation = (element: HTMLElement): void => {
  element.style.background = '';
  element.style.backgroundSize = '';
  element.style.animation = '';
};

// Intersection Observer for scroll animations
export const createScrollAnimationObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = { threshold: 0.1, rootMargin: '50px' }
): IntersectionObserver => {
  return new IntersectionObserver(callback, options);
};

export const animateOnScroll = (elements: Element[], animationType: 'fadeIn' | 'slideIn' | 'scaleIn' = 'fadeIn'): void => {
  const observer = createScrollAnimationObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target instanceof HTMLElement) {
        switch (animationType) {
          case 'fadeIn':
            fadeIn(entry.target);
            break;
          case 'slideIn':
            slideIn(entry.target);
            break;
          case 'scaleIn':
            scaleIn(entry.target);
            break;
        }
        observer.unobserve(entry.target);
      }
    });
  });
  
  elements.forEach((element) => observer.observe(element));
};