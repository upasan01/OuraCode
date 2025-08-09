import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function AnimatedButton({
  show,
  more,
  onClick,
  className = "",
}) {
  const [isHovered, setIsHovered] = React.useState(false);
  const textVariants = {
    hidden: {
      opacity: 0,
      x: -5,
      width: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      x: 0,
      width: "auto",
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  return (
    <motion.button
      layout 
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-300 z-20 ${className}`}
      style={{
        padding: '1rem', 
      }}
    >
    
      <motion.div layout="position">{show}</motion.div>

      <AnimatePresence>
        {isHovered && (
          <motion.span
            // NOTE: No layout prop here. Let the parent handle it.
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="ml-2 whitespace-nowrap overflow-hidden" 
          >
            {more}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}