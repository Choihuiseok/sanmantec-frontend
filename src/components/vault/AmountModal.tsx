import { useEffect, useState } from "react";
import Modal from "../common/Modal";

interface AmountModalProps {
  open: boolean;
  title: string;
  onConfirm: (amount: string) => void;
  onClose: () => void;
}

export default function AmountModal({
  open,
  title,
  onConfirm,
  onClose,
}: AmountModalProps) {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (open) {
      setAmount("");
    }
  }, [open]);

  const numericAmount = Number(amount);
  const isValidAmount =
    amount.trim() !== "" && !Number.isNaN(numericAmount) && numericAmount > 0;

  const handleConfirm = () => {
    if (!isValidAmount) {
      return;
    }

    onConfirm(amount.trim());
  };

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <input
        type="number"
        step="any"
        inputMode="decimal"
        placeholder="입금할 KAIA 금액"
        className="w-full border p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleConfirm();
          }
        }}
        aria-label="입금 금액 입력"
      />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
        >
          취소
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isValidAmount}
          className={`px-4 py-2 rounded text-white transition ${
            isValidAmount
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
          }`}
        >
          확인
        </button>
      </div>
    </Modal>
  );
}