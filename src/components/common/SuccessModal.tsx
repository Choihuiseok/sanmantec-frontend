import { useEffect } from "react";

interface SuccessModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
  variant?: "success" | "warning";
}

export default function SuccessModal({
  open,
  message,
  onClose,
  variant = "success",
}: SuccessModalProps) {
  const duration = 1500;
  const isWarning = variant === "warning";

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-sm w-full text-center animate-fadeIn">
        <div className="flex justify-center mb-4">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              isWarning ? "bg-orange-100" : "bg-green-100"
            }`}
          >
            <span
              className={`text-3xl ${
                isWarning ? "text-orange-600" : "text-green-600"
              }`}
            >
              ✓
            </span>
          </div>
        </div>

        <p className="text-lg font-semibold">{message}</p>
      </div>
    </div>
  );
}