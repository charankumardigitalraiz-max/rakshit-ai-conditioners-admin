import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  icon: Icon, 
  children, 
  maxWidth = 'max-w-md'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-hidden flex flex-col border border-slate-200`}
          >
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                )}
                <div>
                  {title && <h2 className="text-sm font-bold text-slate-900 leading-tight">{title}</h2>}
                  {subtitle && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{subtitle}</p>}
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
