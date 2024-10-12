"use client";
import { motion } from "framer-motion";
import HashLoader from "react-spinners/HashLoader";

export default function Loading() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-green-50 dark:bg-zinc-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <img
        src="/maksab-mini.png"
        alt="Maksab Logo"
        className="mb-8 h-16 w-16"
      />
      <HashLoader color="#22c55e" size={60} />
    </motion.div>
  );
}
