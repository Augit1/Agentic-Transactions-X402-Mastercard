import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  animationFrom?: {
    opacity?: number;
    x?: number;
    y?: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    scale?: number;
  };
  animationTo?: {
    opacity?: number;
    x?: number;
    y?: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    scale?: number;
  };
  staggerChildren?: number;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className,
  delay = 0,
  animationFrom = { opacity: 0, y: 20 },
  animationTo = { opacity: 1, y: 0 },
  staggerChildren = 0.1,
}) => {
  // Split text into characters while preserving spaces
  const characters = text.split('').map((char, index) => ({
    char: char === ' ' ? '\u00A0' : char, // Use non-breaking space
    index,
  }));

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren: delay,
      },
    },
  };

  const item: Variants = {
    hidden: animationFrom,
    visible: {
      ...animationTo,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
  };

  return (
    <motion.div
      className={cn('inline-block', className)}
      variants={container}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {characters.map(({ char, index }) => (
        <motion.span
          key={index}
          className="inline-block"
          variants={item}
          style={{ display: 'inline-block' }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Alternative component for word-based animations
interface SplitTextWordsProps extends Omit<SplitTextProps, 'staggerChildren'> {
  staggerChildren?: number;
}

export const SplitTextWords: React.FC<SplitTextWordsProps> = ({
  text,
  className,
  delay = 0,
  animationFrom = { opacity: 0, y: 20 },
  animationTo = { opacity: 1, y: 0 },
  staggerChildren = 0.2,
}) => {
  const words = text.split(' ');

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren: delay,
      },
    },
  };

  const item: Variants = {
    hidden: animationFrom,
    visible: {
      ...animationTo,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
  };

  return (
    <motion.div
      className={cn('inline-block', className)}
      variants={container}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <motion.span
            className="inline-block"
            variants={item}
            style={{ display: 'inline-block' }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 && <span> </span>}
        </React.Fragment>
      ))}
    </motion.div>
  );
};

export default SplitText;
