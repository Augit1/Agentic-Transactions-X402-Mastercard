import React from 'react';
import SplitText, { SplitTextWords } from './SplitText';

interface TextAnimationProps {
  children: string;
  className?: string;
  delay?: number;
}

// Fade in from bottom
export const FadeInUp: React.FC<TextAnimationProps> = ({
  children,
  className,
  delay = 0,
}) => (
  <SplitText
    text={children}
    className={className}
    delay={delay}
    animationFrom={{ opacity: 0, y: 20 }}
    animationTo={{ opacity: 1, y: 0 }}
    staggerChildren={0.05}
  />
);

// Fade in with rotation
export const RotateIn: React.FC<TextAnimationProps> = ({
  children,
  className,
  delay = 0,
}) => (
  <SplitText
    text={children}
    className={className}
    delay={delay}
    animationFrom={{ opacity: 0, rotateY: 90 }}
    animationTo={{ opacity: 1, rotateY: 0 }}
    staggerChildren={0.1}
  />
);

// Scale in animation
export const ScaleIn: React.FC<TextAnimationProps> = ({
  children,
  className,
  delay = 0,
}) => (
  <SplitText
    text={children}
    className={className}
    delay={delay}
    animationFrom={{ opacity: 0, scale: 0 }}
    animationTo={{ opacity: 1, scale: 1 }}
    staggerChildren={0.1}
  />
);

// Slide in from left
export const SlideInLeft: React.FC<TextAnimationProps> = ({
  children,
  className,
  delay = 0,
}) => (
  <SplitText
    text={children}
    className={className}
    delay={delay}
    animationFrom={{ opacity: 0, y: 0, x: -50 }}
    animationTo={{ opacity: 1, y: 0, x: 0 }}
    staggerChildren={0.05}
  />
);

// Word-based fade in (for longer texts)
export const FadeInWords: React.FC<TextAnimationProps> = ({
  children,
  className,
  delay = 0,
}) => (
  <SplitTextWords
    text={children}
    className={className}
    delay={delay}
    animationFrom={{ opacity: 0, y: 10 }}
    animationTo={{ opacity: 1, y: 0 }}
    staggerChildren={0.2}
  />
);

// Bounce in animation
export const BounceIn: React.FC<TextAnimationProps> = ({
  children,
  className,
  delay = 0,
}) => (
  <SplitText
    text={children}
    className={className}
    delay={delay}
    animationFrom={{ opacity: 0, y: -50, scale: 0.8 }}
    animationTo={{ opacity: 1, y: 0, scale: 1 }}
    staggerChildren={0.08}
  />
);
