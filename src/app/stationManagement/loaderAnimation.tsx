import { motion } from "framer-motion";
import React from "react";

const LoadingDot = {
  display: "block",
  width: "0.35rem",
  height: "0.35rem",
  backgroundColor: "#7C7E8C",
  borderRadius: "50%"
};

const LoadingContainer = {
  width: "3rem",
  display: "flex",
  justifyContent: "space-around"
};

const ContainerVariants = {
  initial: {
    transition: {
      staggerChildren: 0.2
    }
  },
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const DotVariants = {
  initial: {
    y: "0%"
  },
  animate: {
    y: "150%"
  }
};
const DotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse" as const, 
    ease: "easeInOut"
  };

export default function ThreeDotsWave() {
  return (
    <div
      style={{
        width: "20%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop:'5px',
        marginLeft:'5px'
      }}
    >
      <motion.div
        style={LoadingContainer}
        variants={ContainerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.span
          style={LoadingDot}
          variants={DotVariants}
          transition={DotTransition}
        />
        <motion.span
          style={LoadingDot}
          variants={DotVariants}
          transition={DotTransition}
        />
        <motion.span
          style={LoadingDot}
          variants={DotVariants}
          transition={DotTransition}
        />
      </motion.div>
    </div>
  );
}
