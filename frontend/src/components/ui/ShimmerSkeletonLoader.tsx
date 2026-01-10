import React from "react";
import { motion } from "framer-motion";
import "./ShimmerSkeletonLoader.css";

interface ShimmerSkeletonLoaderProps {
  message?: string;
}

const ShimmerSkeletonLoader: React.FC<ShimmerSkeletonLoaderProps> = ({
  message = "Loading beautiful artworks...",
}) => {
  const skeletonVariants = {
    initial: { opacity: 0.6 },
    animate: { opacity: 1 },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  };

  const messageVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <motion.div
      className="shimmer-overlay"
      initial="initial"
      animate="animate"
      variants={containerVariants}
    >
      <div className="shimmer-container">
        {/* Loading Message */}
        <motion.div
          className="shimmer-message"
          variants={messageVariants}
          initial="initial"
          animate="animate"
        >
          <h3>{message}</h3>
        </motion.div>

        {/* Skeleton Cards Grid */}
        <div className="skeleton-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <motion.div
              key={index}
              className="skeleton-card"
              variants={skeletonVariants}
              initial="initial"
              animate="animate"
              transition={{
                ...skeletonVariants.transition,
                delay: (index - 1) * 0.1,
              }}
            >
              {/* Image Skeleton */}
              <div className="skeleton-image">
                <motion.div
                  className="shimmer-effect"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>

              {/* Content Skeleton */}
              <div className="skeleton-content">
                <motion.div
                  className="skeleton-line skeleton-title"
                  variants={skeletonVariants}
                  transition={{
                    ...skeletonVariants.transition,
                    delay: (index - 1) * 0.1,
                  }}
                >
                  <motion.div
                    className="shimmer-effect"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: (index - 1) * 0.05,
                    }}
                  />
                </motion.div>

                <motion.div
                  className="skeleton-line skeleton-text"
                  variants={skeletonVariants}
                  transition={{
                    ...skeletonVariants.transition,
                    delay: (index - 0.5) * 0.1,
                  }}
                >
                  <motion.div
                    className="shimmer-effect"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: (index - 0.5) * 0.05,
                    }}
                  />
                </motion.div>

                <motion.div
                  className="skeleton-line skeleton-price"
                  variants={skeletonVariants}
                  transition={{
                    ...skeletonVariants.transition,
                    delay: index * 0.1,
                  }}
                >
                  <motion.div
                    className="shimmer-effect"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: index * 0.05,
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animated Loading Dots */}
        <motion.div className="loading-dots-shimmer">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="dot-shimmer"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: index * 0.1,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ShimmerSkeletonLoader;
