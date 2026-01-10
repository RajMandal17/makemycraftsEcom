import React from "react";
import { motion } from "framer-motion";

interface SkeletonTableProps {
  rows?: number;
  skeletonVariants: any;
}

/**
 * SkeletonTable - Used for CartPage, OrdersPage
 * Renders a table-like skeleton structure with rows
 * Each row has: image, title, quantity, price, action
 */
const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 3,
  skeletonVariants,
}) => {
  return (
    <div className="skeleton-table">
      {/* Table Header */}
      <div className="skeleton-table-header">
        <div className="skeleton-col" style={{ flex: 2 }}>
          <motion.div
            className="skeleton-line"
            variants={skeletonVariants}
            initial="initial"
            animate="animate"
          >
            <motion.div className="shimmer-effect" />
          </motion.div>
        </div>
        <div className="skeleton-col">
          <motion.div
            className="skeleton-line"
            variants={skeletonVariants}
            initial="initial"
            animate="animate"
          >
            <motion.div className="shimmer-effect" />
          </motion.div>
        </div>
        <div className="skeleton-col">
          <motion.div
            className="skeleton-line"
            variants={skeletonVariants}
            initial="initial"
            animate="animate"
          >
            <motion.div className="shimmer-effect" />
          </motion.div>
        </div>
        <div className="skeleton-col">
          <motion.div
            className="skeleton-line"
            variants={skeletonVariants}
            initial="initial"
            animate="animate"
          >
            <motion.div className="shimmer-effect" />
          </motion.div>
        </div>
      </div>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <motion.div
          key={index}
          className="skeleton-table-row"
          variants={skeletonVariants}
          initial="initial"
          animate="animate"
          transition={{
            ...skeletonVariants.transition,
            delay: index * 0.1,
          }}
        >
          {/* Item Info (Image + Title) */}
          <div
            className="skeleton-col"
            style={{ flex: 2, display: "flex", gap: "1rem" }}
          >
            <div className="skeleton-image-small" />
            <div style={{ flex: 1 }}>
              <motion.div className="skeleton-line skeleton-title" />
              <motion.div
                className="skeleton-line skeleton-text"
                style={{ marginTop: "0.5rem" }}
              />
            </div>
          </div>

          {/* Quantity */}
          <div className="skeleton-col">
            <motion.div className="skeleton-line" style={{ width: "60%" }} />
          </div>

          {/* Price */}
          <div className="skeleton-col">
            <motion.div className="skeleton-line" style={{ width: "80%" }} />
          </div>

          {/* Action Button */}
          <div className="skeleton-col">
            <motion.div className="skeleton-line skeleton-button" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonTable;
