import React from 'react';
import { motion } from 'framer-motion';
import { Youtube } from 'lucide-react';

export default function Preloader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#01040B] flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="text-white mb-4"
        >
          <Youtube size={48} />
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="h-1 bg-white rounded-full"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-lg font-medium text-white"
        >
          Loading YTubeAI...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}