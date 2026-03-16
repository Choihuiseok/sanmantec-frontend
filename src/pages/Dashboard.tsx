import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";

import Modal from "../components/common/Modal";
import SuccessModal from "../components/common/SuccessModal";
import AmountModal from "../components/vault/AmountModal";
import VaultCard from "../components/vault/VaultCard";
import UnlockModal from "../components/vault/UnlockModal";
import DepositSelectModal from "../components/vault/DepositSelectModal";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const VAULT_CONTRACT = "0xDc43Eb553C1beA593c710316B51EBa03a0b06777";

const vaultAbi = [
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getVaultsOf",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "vaultId", type: "uint256" }],
    name: "getVaultInfo",
    outputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "heir", type: "address" },
      { internalType: "uint256", name: "assetBalance", type: "uint256" },
      { internalType: "uint256", name: "maintenanceDeposit", type: "uint256" },
      { internalType: "uint256", name: "state", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    name: "depositMaintenanceKLAY",
    type: "function",
    stateMutability: "payable",
    inputs: [{ internalType: "uint256", name: "vaultId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "depositAssetKLAY",
    type: "function",
    stateMutability: "payable",
    inputs: [{ internalType: "uint256", name: "vaultId", type: "uint256" }],
    outputs: [],
  },
  {
    inputs: [{ internalType: "uint256", name: "vaultId", type: "uint256" }],
    name: "withdrawAllKLAY",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

interface VaultRow {
  id: string;
  state: number;
  assetBalance: string;
  maintenanceDeposit: string;
  owner: string;
  heir: string;
}

export default function Dashboard() {
  const [vaults, setVaults] = useState<VaultRow[]>([]);
  const [modal, setModal] = useState({
    open: false,
    message: "",
  });

  const [successOpen, setSuccessOpen] = useState(false);
  const [withdrawSuccessOpen, setWithdrawSuccessOpen] = useState(false);

  const [walletAddress, setWalletAddress] = useState<string | null>(
    localStorage.getItem("walletAddress")
  );

  const [walletBalance, setWalletBalance] = useState<string>("0.00");

  const [amountModal, setAmountModal] = useState<{
    open: boolean;
    vaultId: string;
    type: "maintenance" | "asset" | "";
  }>({
    open: false,
    vaultId: "",
    type: "",
  });

  const [depositSelect, setDepositSelect] = useState<{
    open: boolean;
    vaultId: string;
    maintenanceDeposit: string;
  }>({
    open: false,
    vaultId: "",
    maintenanceDeposit: "0",
  });

  const [assetDepositError, setAssetDepositError] = useState(false);

  const [unlockModal, setUnlockModal] = useState<{
    open: boolean;
    vaultId: string;
    step: 1 | 2;
    file: File | null;
  }>({
    open: false,
    vaultId: "",
    step: 1,
    file: null,
  });

  const [withdrawConfirm, setWithdrawConfirm] = useState<{
    open: boolean;
    vaultId: string;
    mode: "owner" | "heir";
    assetBalance: string;
    owner: string;
    heir: string;
  }>({
    open: false,
    vaultId: "",
    mode: "owner",
    assetBalance: "0",
    owner: "",
    heir: "",
  });

  const getSimKey = (vaultId: string) => `unlockSim_${vaultId}`;

  const getSimState = (
    vaultId: string
  ): "reviewing" | "approved" | "inherited" | null => {
    try {
      const raw = localStorage.getItem(getSimKey(vaultId));

      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);

      if (parsed?.status === "reviewing") {
        return "reviewing";
      }

      if (parsed?.status === "approved") {
        return "approved";
      }

      if (parsed?.status === "inherited") {
        return "inherited";
      }

      return null;
    } catch {
      return null;
    }
  };

  const getDeletedKey = () => "deletedVaults";

  const getDeletedVaultIds = (): string[] => {
    try {
      const raw = localStorage.getItem(getDeletedKey());

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(String);
    } catch {
      return [];
    }
  };

  const addDeletedVaultId = (vaultId: string) => {
    const previous = getDeletedVaultIds();

    if (previous.includes(vaultId)) {
      return;
    }

    const next = [...previous, vaultId];
    localStorage.setItem(getDeletedKey(), JSON.stringify(next));
  };

  const isDeletedVault = (vaultId: string) => {
    const deleted = getDeletedVaultIds();
    return deleted.includes(vaultId);
  };

  useEffect(() => {
    const syncWallet = async () => {
      if (!window.ethereum) {
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      try {
        const address = await signer.getAddress();
        setWalletAddress(address);
        localStorage.setItem("walletAddress", address);

        const balanceBN = await provider.getBalance(address);
        setWalletBalance(Number(ethers.utils.formatEther(balanceBN)).toFixed(2));
      } catch {
        setWalletAddress(null);
        setWalletBalance("0.00");
      }
    };

    syncWallet();
  }, []);

  const loadVaults = async () => {
    if (!window.ethereum || !walletAddress) {
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(VAULT_CONTRACT, vaultAbi, provider);
    const ids = await contract.getVaultsOf(walletAddress);

    const rows: VaultRow[] = await Promise.all(
      ids.map(async (bigNumber: ethers.BigNumber) => {
        const id = bigNumber.toString();
        const info = await contract.getVaultInfo(id);

        const pendingUnlock = localStorage.getItem(`pendingUnlock_${id}`);
        const sim = getSimState(id);

        const chainState = Number(info.state);
        let uiState = chainState;

        if (chainState === 0) {
          if (sim === "inherited") {
            uiState = 3;
          } else if (sim === "approved") {
            uiState = 2;
          } else if (sim === "reviewing" || pendingUnlock === "true") {
            uiState = 1;
          } else {
            uiState = 0;
          }
        }

        return {
          id,
          state: uiState,
          assetBalance: info.assetBalance.toString(),
          maintenanceDeposit: info.maintenanceDeposit.toString(),
          owner: info.owner,
          heir: info.heir,
        };
      })
    );

    const filtered = rows.filter((vault) => !isDeletedVault(vault.id));
    setVaults(filtered);
  };

  const handleDeposit = async (amount: string) => {
    try {
      if (!window.ethereum) {
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(VAULT_CONTRACT, vaultAbi, signer);
      const value = ethers.utils.parseEther(amount);

      if (amountModal.type === "maintenance") {
        await contract.depositMaintenanceKLAY(amountModal.vaultId, { value });
      } else {
        await contract.depositAssetKLAY(amountModal.vaultId, { value });
      }

      setAmountModal({
        open: false,
        vaultId: "",
        type: "",
      });

      await loadVaults();
    } catch {
      setModal({
        open: true,
        message: "입금 중 오류가 발생했습니다.",
      });
    }
  };

  const handleDeleteVault = (vaultId: string) => {
    const ok = window.confirm(
      "상속 완료된 금고를 삭제할까요? (목록에서만 제거됩니다)"
    );

    if (!ok) {
      return;
    }

    addDeletedVaultId(vaultId);

    try {
      localStorage.removeItem(getSimKey(vaultId));
      localStorage.removeItem(`pendingUnlock_${vaultId}`);
    } catch {
      return;
    }

    setVaults((previous) => previous.filter((vault) => vault.id !== vaultId));
  };

  const runWithdrawAll = async () => {
    const { vaultId, mode } = withdrawConfirm;

    if (mode === "heir") {
      if (!vaultId) {
        setModal({
          open: true,
          message: "vaultId가 비어있습니다.",
        });
        return;
      }

      setWithdrawConfirm({
        open: false,
        vaultId: "",
        mode: "owner",
        assetBalance: "0",
        owner: "",
        heir: "",
      });

      localStorage.setItem(
        getSimKey(vaultId),
        JSON.stringify({
          status: "inherited",
          at: Date.now(),
        })
      );

      setVaults((previous) =>
        previous.map((vault) =>
          vault.id === vaultId ? { ...vault, state: 3 } : vault
        )
      );

      setWithdrawSuccessOpen(true);
      return;
    }

    try {
      if (!window.ethereum) {
        return;
      }

      const { vaultId: currentVaultId, owner } = withdrawConfirm;

      if (!currentVaultId) {
        setModal({
          open: true,
          message: "vaultId가 비어있습니다.",
        });
        return;
      }

      if (!owner || owner === ethers.constants.AddressZero) {
        setModal({
          open: true,
          message: "지갑 정보(owner)를 불러오지 못했습니다.",
        });
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      if (address.toLowerCase() !== owner.toLowerCase()) {
        setModal({
          open: true,
          message:
            "피상속자(소유자) 지갑으로 연결되어 있어야 인출할 수 있습니다.",
        });
        return;
      }

      const contract = new ethers.Contract(VAULT_CONTRACT, vaultAbi, signer);
      const tx = await contract.withdrawAllKLAY(currentVaultId);
      await tx.wait();

      setWithdrawConfirm({
        open: false,
        vaultId: "",
        mode: "owner",
        assetBalance: "0",
        owner: "",
        heir: "",
      });

      try {
        const balance = await provider.getBalance(address);
        setWalletBalance(Number(ethers.utils.formatEther(balance)).toFixed(2));
      } catch {
        return;
      }

      await loadVaults();
    } catch {
      setModal({
        open: true,
        message:
          "인출 중 오류가 발생했습니다. (잠금 상태 및 지갑 주소를 확인해주세요.)",
      });
    }
  };

  useEffect(() => {
    loadVaults();
  }, [walletAddress]);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Modal
        open={modal.open}
        message={modal.message}
        onClose={() =>
          setModal({
            open: false,
            message: "",
          })
        }
      />

      <SuccessModal
        open={successOpen}
        message="Unlock 요청이 접수되었습니다."
        variant="warning"
        onClose={() => setSuccessOpen(false)}
      />

      <SuccessModal
        open={withdrawSuccessOpen}
        message="상속 완료되었습니다."
        variant="success"
        onClose={() => setWithdrawSuccessOpen(false)}
      />

      {withdrawConfirm.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold">
              {withdrawConfirm.mode === "owner" ? "인출" : "상속 인출"}
            </h3>

            <p className="text-sm text-gray-600">
              현재 자산:{" "}
              <span className="font-semibold text-gray-900">
                {Number(
                  ethers.utils.formatEther(withdrawConfirm.assetBalance)
                ).toFixed(4)}{" "}
                KAIA
              </span>
            </p>

            <p className="text-xs text-gray-500">
              * 본 컨트랙트는 부분 인출이 아니라 <b>전액 인출</b>만 지원합니다.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700"
                onClick={() =>
                  setWithdrawConfirm({
                    open: false,
                    vaultId: "",
                    mode: "owner",
                    assetBalance: "0",
                    owner: "",
                    heir: "",
                  })
                }
                type="button"
              >
                취소
              </button>

              <button
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white"
                onClick={runWithdrawAll}
                type="button"
              >
                {withdrawConfirm.mode === "heir" ? "전액 상속" : "전액 인출"}
              </button>
            </div>
          </div>
        </div>
      )}

      <DepositSelectModal
        open={depositSelect.open}
        vaultId={depositSelect.vaultId}
        maintenanceDeposit={depositSelect.maintenanceDeposit}
        walletBalance={walletBalance}
        assetDepositError={assetDepositError}
        setAssetDepositError={setAssetDepositError}
        onClose={() =>
          setDepositSelect({
            open: false,
            vaultId: "",
            maintenanceDeposit: "0",
          })
        }
        onSelectMaintenance={() => {
          setDepositSelect({
            open: false,
            vaultId: "",
            maintenanceDeposit: "0",
          });

          setAmountModal({
            open: true,
            vaultId: depositSelect.vaultId,
            type: "maintenance",
          });
        }}
        onSelectAsset={() => {
          setDepositSelect({
            open: false,
            vaultId: "",
            maintenanceDeposit: "0",
          });

          setAmountModal({
            open: true,
            vaultId: depositSelect.vaultId,
            type: "asset",
          });
        }}
      />

      <AmountModal
        open={amountModal.open}
        title={`금고 ${amountModal.vaultId} ${
          amountModal.type === "maintenance" ? "예치금" : "자산"
        } 입금`}
        onConfirm={handleDeposit}
        onClose={() =>
          setAmountModal({
            open: false,
            vaultId: "",
            type: "",
          })
        }
      />

      <UnlockModal
        open={unlockModal.open}
        vaultId={unlockModal.vaultId}
        step={unlockModal.step}
        file={unlockModal.file}
        onClose={() =>
          setUnlockModal({
            open: false,
            vaultId: "",
            step: 1,
            file: null,
          })
        }
        onNext={() =>
          setUnlockModal((previous) => ({
            ...previous,
            step: 2,
          }))
        }
        onPrev={() =>
          setUnlockModal((previous) => ({
            ...previous,
            step: 1,
          }))
        }
        onFileChange={(file) =>
          setUnlockModal((previous) => ({
            ...previous,
            file,
          }))
        }
        onSubmit={async () => {
          const currentVaultId = unlockModal.vaultId;

          if (!currentVaultId) {
            setModal({
              open: true,
              message: "vaultId가 비어있습니다.",
            });
            return;
          }

          localStorage.setItem(`pendingUnlock_${currentVaultId}`, "true");
          localStorage.setItem(
            getSimKey(currentVaultId),
            JSON.stringify({
              status: "reviewing",
              at: Date.now(),
            })
          );

          setVaults((previous) =>
            previous.map((vault) =>
              vault.id === currentVaultId ? { ...vault, state: 1 } : vault
            )
          );

          setUnlockModal({
            open: false,
            vaultId: "",
            step: 1,
            file: null,
          });

          setSuccessOpen(true);

          window.setTimeout(() => {
            localStorage.setItem(
              getSimKey(currentVaultId),
              JSON.stringify({
                status: "approved",
                at: Date.now(),
              })
            );

            setVaults((previous) =>
              previous.map((vault) =>
                vault.id === currentVaultId ? { ...vault, state: 2 } : vault
              )
            );
          }, 5000);
        }}
      />

      <h1 className="text-3xl font-bold text-center">내 금고 목록</h1>

      <Link
        to="/create-vault"
        className="block text-center bg-blue-600 text-white py-3 rounded-xl"
        onClick={(event) => {
          if (!walletAddress) {
            event.preventDefault();
            setModal({
              open: true,
              message: "금고를 생성하려면 지갑을 먼저 연결해주세요.",
            });
          }
        }}
      >
        + 새로운 금고 생성
      </Link>

      {vaults.length === 0 && (
        <div className="bg-white rounded-2xl border p-8 text-center text-gray-500">
          생성된 금고가 없습니다.
        </div>
      )}

      {vaults.map((vault) => (
        <VaultCard
          key={vault.id}
          id={vault.id}
          state={vault.state}
          assetBalance={vault.assetBalance}
          maintenanceDeposit={vault.maintenanceDeposit}
          onDepositClick={() =>
            setDepositSelect({
              open: true,
              vaultId: vault.id,
              maintenanceDeposit: vault.maintenanceDeposit,
            })
          }
          onUnlockClick={() =>
            setUnlockModal({
              open: true,
              vaultId: vault.id,
              step: 1,
              file: null,
            })
          }
          onWithdrawClick={() =>
            setWithdrawConfirm({
              open: true,
              vaultId: vault.id,
              mode: "heir",
              assetBalance: vault.assetBalance,
              owner: vault.owner,
              heir: vault.heir,
            })
          }
          onLockedWithdrawClick={() =>
            setWithdrawConfirm({
              open: true,
              vaultId: vault.id,
              mode: "owner",
              assetBalance: vault.assetBalance,
              owner: vault.owner,
              heir: vault.heir,
            })
          }
          onDeleteClick={() => handleDeleteVault(vault.id)}
        />
      ))}
    </div>
  );
}