import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[101] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className="w-full max-w-md bg-bg-secondary rounded-2xl border border-border-color shadow-2xl flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="dialog-title" className="text-xl font-bold font-display">{title}</h2>
          <p className="text-sm text-text-secondary mt-2">{message}</p>
        </div>
        <div className="p-4 bg-black/20 rounded-b-2xl flex justify-end items-center gap-4 border-t border-border-color">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors">
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose(); // Assume we always close after confirm
            }}
            className="px-6 py-2 text-sm font-bold rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
