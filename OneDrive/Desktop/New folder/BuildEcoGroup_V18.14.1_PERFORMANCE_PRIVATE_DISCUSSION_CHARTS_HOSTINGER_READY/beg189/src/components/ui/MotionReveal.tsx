import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/cn';

interface MotionRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}

/** Subtle, one-time entrance motion that fully respects reduced-motion preferences. */
export const MotionReveal: React.FC<MotionRevealProps> = ({
  children,
  className,
  delay = 0,
  distance = 22,
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={reduceMotion ? false : { opacity: 0, y: distance }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.62, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedHeadlineProps {
  text: string;
  className?: string;
}

export const AnimatedHeadline: React.FC<AnimatedHeadlineProps> = ({ text, className }) => {
  const reduceMotion = useReducedMotion();
  const words = text.split(' ');

  return (
    <h1 className={cn(className)} aria-label={text}>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <motion.span
            key={`${text}-${index}`}
            className="inline-block"
            initial={reduceMotion ? false : { opacity: 0, y: '0.55em' }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: 0.05 + index * 0.055, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}{index < words.length - 1 ? '\u00a0' : ''}
          </motion.span>
        ))}
      </span>
    </h1>
  );
};
