import Modal from "../common/Modal";

interface UnlockModalProps {
  open: boolean;
  vaultId: string;
  step: 1 | 2;
  file: File | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
}

export default function UnlockModal({
  open,
  vaultId,
  step,
  file,
  onClose,
  onNext,
  onPrev,
  onFileChange,
  onSubmit,
}: UnlockModalProps) {
  return (
    <Modal open={open} title="Unlock 요청" onClose={onClose}>
      <div className="max-w-lg mx-auto">
        <div className="mb-3 text-xs text-gray-500">
          금고 ID: {vaultId || "-"}
        </div>

        {step === 1 ? (
          <>
            <p className="text-sm text-gray-600 leading-relaxed">
              상속 절차를 시작하기 위해 사망확인 서류 제출을 진행합니다.
              <br />
              아래 버튼을 누르면 법원의 결정문
              <br />
              (검인 결정문 또는 유언집행자 선임 결정문)을
              <br />
              제출하는 단계로 이동합니다.
              <br />
              <br />
              제출된 서류와 법적 요건이 확인된 경우에만 Unlock 절차가
              진행됩니다.
            </p>

            <button
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg"
              onClick={onNext}
              type="button"
            >
              다음
            </button>
          </>
        ) : (
          <>
            <label className="block text-sm font-medium mb-2">
              법원 결정문 첨부
            </label>

            <input
              type="file"
              className="w-full mb-4"
              accept="image/*,application/pdf"
              onChange={(event) =>
                onFileChange(event.target.files?.[0] || null)
              }
            />

            <div className="flex gap-2">
              <button
                className="flex-1 bg-gray-200 py-2 rounded"
                onClick={onPrev}
                type="button"
              >
                이전
              </button>

              <button
                className="flex-1 bg-blue-600 text-white py-2 rounded disabled:bg-blue-300"
                disabled={!file}
                onClick={onSubmit}
                type="button"
              >
                Unlock 요청
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}