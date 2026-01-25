import { useEffect, useState } from 'react';

interface LogoProps {
  className?: string;
  height?: number;
}

export function Logo({ className = '', height = 32 }: LogoProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return (
    <img
      src={isDark ? '/SnapCard_logo_dark_bg.png' : '/SnapCard_logo_light_bg.png'}
      alt="SnapCard"
      height={height}
      className={className}
      style={{ height: `${height}px`, width: 'auto' }}
    />
  );
}
