import React from "react";
import { motion } from "framer-motion";

interface SkeletonListProps {
  items?: number;
  skeletonVariants: any;
}

/**
 * SkeletonList - Used for ReviewsPage, CommentsPage
 * Renders a list of skeleton items stacked vertically
 * Each item has: avatar, title, content
 */
const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  skeletonVariants,
}) => {
  return (
    <div className="skeleton-list">
      {Array.from({ length: items }).map((_, index) => (
        <motion.div
          key={index}
          className="skeleton-list-item"
          variants={skeletonVariants}
          initial="initial"
          animate="animate"
          transition={{
            ...skeletonVariants.transition,
            delay: index * 0.1,
          }}
        >
          {/* Avatar */}
          <div className="skeleton-avatar" />

          {/* Content */}
          <div className="skeleton-list-content">
            {/* Name/Title */}
            <motion.div
              className="skeleton-line skeleton-list-title"
              style={{ width: "30%", marginBottom: "0.5rem" }}
            />

            {/* Description/Comment */}
            <motion.div
              className="skeleton-line"
              style={{ marginBottom: "0.5rem" }}
            />
            <motion.div className="skeleton-line" style={{ width: "90%" }} />

            {/* Meta (date, rating, etc) */}
            <motion.div
              className="skeleton-line skeleton-text"
              style={{ marginTop: "0.75rem", width: "50%" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonList;
