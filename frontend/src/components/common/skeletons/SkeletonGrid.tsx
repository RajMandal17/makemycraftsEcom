import React from "react";
import { motion } from "framer-motion";

interface SkeletonGridProps {
  columns?: number;
  count?: number;
  skeletonVariants: any;
}

/**
 * SkeletonGrid - Used for ArtworksPage, ArtistsPage
 * Renders a grid of skeleton cards matching the card layout
 */
const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  columns = 4,
  count = 8,
  skeletonVariants,
}) => {
  return (
    <div
      className="skeleton-grid"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))` }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="skeleton-card"
          variants={skeletonVariants}
          initial="initial"
          animate="animate"
          transition={{
            ...skeletonVariants.transition,
            delay: index * 0.1,
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

            <motion.div
              className="skeleton-line skeleton-text"
              variants={skeletonVariants}
              transition={{
                ...skeletonVariants.transition,
                delay: (index + 0.5) * 0.1,
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
                  delay: (index + 0.5) * 0.05,
                }}
              />
            </motion.div>

            <motion.div
              className="skeleton-line skeleton-price"
              variants={skeletonVariants}
              transition={{
                ...skeletonVariants.transition,
                delay: (index + 1) * 0.1,
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
                  delay: (index + 1) * 0.05,
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonGrid;
