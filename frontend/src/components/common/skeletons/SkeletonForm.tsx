import React from "react";
import { motion } from "framer-motion";

interface SkeletonFormProps {
  sections?: number;
  skeletonVariants: any;
}

/**
 * SkeletonForm - Used for CheckoutPage, ProfilePage
 * Renders form-like skeleton with input fields
 * Each section has: label and input field
 */
const SkeletonForm: React.FC<SkeletonFormProps> = ({
  sections = 3,
  skeletonVariants,
}) => {
  return (
    <div className="skeleton-form">
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <motion.div
          key={sectionIndex}
          className="skeleton-form-section"
          variants={skeletonVariants}
          initial="initial"
          animate="animate"
          transition={{
            ...skeletonVariants.transition,
            delay: sectionIndex * 0.15,
          }}
        >
          {/* Section Title */}
          <motion.div className="skeleton-line skeleton-form-label" />

          {/* Form Fields */}
          <div className="skeleton-form-fields">
            {Array.from({ length: 2 }).map((_, fieldIndex) => (
              <div key={fieldIndex} style={{ marginBottom: "1rem" }}>
                {/* Field Label */}
                <motion.div
                  className="skeleton-line skeleton-form-label"
                  style={{ marginBottom: "0.5rem", width: "40%" }}
                />

                {/* Field Input */}
                <motion.div className="skeleton-line skeleton-form-input" />
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Submit Button */}
      <motion.div
        className="skeleton-line skeleton-form-button"
        variants={skeletonVariants}
        initial="initial"
        animate="animate"
        transition={{
          ...skeletonVariants.transition,
          delay: sections * 0.15,
        }}
      />
    </div>
  );
};

export default SkeletonForm;
