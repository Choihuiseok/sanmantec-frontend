import { ethers } from "ethers";
import VaultStepper from "./VaultStepper";

interface VaultCardProps {
  id: string;
  state: number;
  assetBalance: string;
  maintenanceDeposit: string;
  onDepositClick: () => void;
  onUnlockClick: () => void;
  onWithdrawClick: () => void;
  onLockedWithdrawClick: () => void;
  onDeleteClick: () => void;
}

export default function VaultCard({
  id,
  state,
  assetBalance,
  maintenanceDeposit,
  onDepositClick,
  onUnlockClick,
  onWithdrawClick,
  onLockedWithdrawClick,
  onDeleteClick,
}: VaultCardProps) {
  const isLocked = state === 0;
  const isReviewing = state === 1;
  const isApproved = state === 2;
  const isDone = state === 3;

  const displayDeposit = isDone ? "0" : maintenanceDeposit;
  const displayAssetBalance = isDone ? "0" : assetBalance;

  return (
    <div className="p-6 border rounded-2xl bg-white shadow space-y-3">
      <div className="flex justify-between items-start">
        <h2 className="font-semibold text-lg">금고 ID: {id}</h2>

        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            {!isReviewing && !isApproved && (
              <button
                className={`px-4 py-2 rounded-lg text-sm ${
                  isDone
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white"
                }`}
                onClick={onDepositClick}
                disabled={isDone}
                type="button"
              >
                입금
              </button>
            )}

            {isLocked && (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                onClick={onLockedWithdrawClick}
                type="button"
              >
                인출
              </button>
            )}

            {isLocked && (
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
                onClick={onUnlockClick}
                type="button"
              >
                Unlock 요청
              </button>
            )}

            {isReviewing && (
              <button
                className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm"
                disabled
                type="button"
              >
                서류 검증중...
              </button>
            )}

            {isApproved && (
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                onClick={onWithdrawClick}
                type="button"
              >
                상속 실행
              </button>
            )}

            {isDone && (
              <button
                className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm"
                disabled
                type="button"
              >
                상속 완료
              </button>
            )}
          </div>
        </div>
      </div>

      <VaultStepper current={state} />

      <p className="text-sm text-gray-500">
        보증금: {ethers.utils.formatEther(displayDeposit)} KAIA
      </p>

      <p className="text-sm text-gray-500">
        자산 잔액: {ethers.utils.formatEther(displayAssetBalance)} KAIA
      </p>

      {isDone && (
        <div className="pt-2 mt-2 border-t flex justify-start">
          <button
            type="button"
            onClick={onDeleteClick}
            className="px-4 py-2 rounded-lg text-sm border border-red-300 text-red-600 hover:bg-red-50"
          >
            금고 삭제
          </button>
        </div>
      )}
    </div>
  );
}