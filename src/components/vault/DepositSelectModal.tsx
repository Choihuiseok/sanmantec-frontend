import { ethers } from "ethers";
import Modal from "../common/Modal";

interface DepositSelectModalProps {
  open: boolean;
  vaultId: string;
  maintenanceDeposit: string;
  walletBalance: string;
  assetDepositError: boolean;
  setAssetDepositError: (value: boolean) => void;
  onClose: () => void;
  onSelectMaintenance: () => void;
  onSelectAsset: () => void;
}

export default function DepositSelectModal({
  open,
  vaultId,
  maintenanceDeposit,
  walletBalance,
  assetDepositError,
  setAssetDepositError,
  onClose,
  onSelectMaintenance,
  onSelectAsset,
}: DepositSelectModalProps) {
  return (
    <Modal
      open={open}
      title="입금 유형 선택"
      onClose={() => {
        setAssetDepositError(false);
        onClose();
      }}
    >
      <div className="mb-2 text-xs text-gray-500">
        금고 ID: {vaultId || "-"}
      </div>

      <div className="mb-4 text-sm text-gray-600 text-right">
        잔액:{" "}
        <span className="font-semibold text-gray-900">
          {walletBalance} KAIA
        </span>
      </div>

      <div className="space-y-3">
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
          onClick={() => {
            setAssetDepositError(false);
            onSelectMaintenance();
          }}
          type="button"
        >
          예치금 입금
        </button>

        <button
          className="w-full bg-gray-200 py-2 rounded-lg"
          onClick={() => {
            const minDeposit = ethers.utils.parseEther("1");
            const currentDeposit = ethers.BigNumber.from(maintenanceDeposit);

            if (currentDeposit.lt(minDeposit)) {
              setAssetDepositError(true);
              return;
            }

            setAssetDepositError(false);
            onSelectAsset();
          }}
          type="button"
        >
          자산 입금
        </button>

        {assetDepositError && (
          <p className="text-sm text-red-500 text-center">
            자산 입금시 최소 1 KAIA 예치금이 필요합니다.
          </p>
        )}
      </div>
    </Modal>
  );
}