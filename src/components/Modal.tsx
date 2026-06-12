import React, { useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Wider variant for content-heavy modals (guide carousel). */
  wide?: boolean;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, wide = false }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const onBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgb(4_8_16/0.8)] p-4 sm:p-6"
      onClick={onBackdropClick}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`rise-in my-4 w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} rounded-xl border border-edge bg-surface shadow-raised`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-edge p-4 sm:px-6">
          <h2 className="display-caps text-lg font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-raised hover:text-ink"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
