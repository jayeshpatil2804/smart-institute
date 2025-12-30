import React, { useEffect, useRef, useState } from 'react';

const ScrollAnimation = ({ children, className = '', animation = 'fade-up' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    
    switch (animation) {
      case 'fade-up':
        return 'animate-fade-up';
      case 'fade-left':
        return 'animate-fade-left';
      case 'fade-right':
        return 'animate-fade-right';
      case 'scale-up':
        return 'animate-scale-up';
      default:
        return 'animate-fade-up';
    }
  };

  return (
    <div
      ref={ref}
      className={`${className} ${getAnimationClass()}`}
    >
      {children}
    </div>
  );
};

export default ScrollAnimation;
