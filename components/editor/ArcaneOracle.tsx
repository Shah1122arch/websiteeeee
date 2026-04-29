"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Wand2, Plus, RotateCw } from "lucide-react";

interface ArcaneOracleProps {
  isOpen: boolean;
  onClose: () => void;
  twists: string[];
  isLoading: boolean;
  onRegenerate: () => void;
  onInsert: (twist: string) => void;
}

export const ArcaneOracle = ({
  isOpen,
  onClose,
  twists,
  isLoading,
  onRegenerate,
  onInsert,
}: ArcaneOracleProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-2xl bg-surface/90 glassmorphism border border-primary/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">Arcane Oracle</h3>
                  <p className="text-[10px] uppercase tracking-widest text-muted">Consulting the narrative spirits</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-muted transition-colors"
                title="Close Oracle"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 min-h-[300px]">
              {isLoading ? (
                <div className="h-48 flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary opacity-50" size={24} />
                  </div>
                  <p className="text-sm font-medium text-primary animate-pulse uppercase tracking-[0.2em]">Consulting the Oracle...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {twists.map((twist, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative bg-white/5 border border-white/5 rounded-xl p-5 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer shadow-sm hover:shadow-primary/5"
                      onClick={() => onInsert(twist)}
                    >
                      <div className="flex gap-4">
                        <span className="text-primary/40 font-bold text-xl select-none">0{index + 1}</span>
                        <p className="text-sm leading-relaxed text-foreground/90 pr-8">{twist}</p>
                      </div>
                      
                      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                         <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            <Plus size={12} />
                            Insert
                         </button>
                      </div>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!isLoading && (
              <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex justify-center">
                <button 
                  onClick={onRegenerate}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted hover:text-primary transition-colors"
                >
                  <RotateCw size={14} />
                  Consult the Oracle Again
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
