import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  children?: ReactNode;
}

export default function Modal({
  open,
  title,
  message,
  onClose,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEsc);

    return () => {
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div
        className="relative z-10 bg-white w-80 md:w-96 rounded-xl shadow-lg p-6 animate-fadeIn pointer-events-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="닫기"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        {title && (
          <h2 className="text-xl font-bold mb-3 text-gray-800">
            {title}
          </h2>
        )}

        {children ? (
          children
        ) : (
          <>
            {message && (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {message}
              </p>
            )}

            <button
              onClick={onClose}
              className="mt-6 w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition"
              type="button"
            >
              확인
            </button>
          </>
        )}
      </div>
    </div>
  );
}