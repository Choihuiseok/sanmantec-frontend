import { useState, useEffect } from "react";
import { Wallet, RefreshCcw, Copy } from "lucide-react";
import Modal from "../common/Modal";
import SuccessModal from "../common/SuccessModal";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const API_BASE = "http://localhost:3001";

interface WalletConnectProps {
  onConnected: (address: string) => void;
  mode?: "header" | "page";
}

export default function WalletConnect({
  onConnected,
  mode = "header",
}: WalletConnectProps) {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<string>("");

  const [modal, setModal] = useState({
    open: false,
    message: "",
  });

  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
  });

  const fetchBalance = async (addr: string) => {
    if (!window.ethereum || !addr) {
      return;
    }

    try {
      const balanceHex = await window.ethereum.request({
        method: "eth_getBalance",
        params: [addr, "latest"],
      });

      const kaia = Number(BigInt(balanceHex)) / 1e18;
      setBalance(kaia.toFixed(6));
    } catch (error) {
      console.error("잔액 조회 실패", error);
      setBalance("");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("walletAddress");

    if (saved) {
      setAddress(saved);
      fetchBalance(saved);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setModal({
        open: true,
        message: "메타마스크가 필요합니다.",
      });
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const selected = accounts[0];
      const userId = localStorage.getItem("userId");

      if (userId) {
        await fetch(`${API_BASE}/wallet/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            address: selected,
          }),
        });
      }

      setAddress(selected);
      localStorage.setItem("walletAddress", selected);

      await fetchBalance(selected);

      window.setTimeout(() => {
        setSuccessModal({
          open: true,
          message: "지갑이 성공적으로 연결되었습니다.",
        });
      }, 500);

      window.setTimeout(() => {
        setSuccessModal({
          open: false,
          message: "",
        });
        onConnected(selected);
      }, 2000);
    } catch (error) {
      console.error(error);
      setModal({
        open: true,
        message: "지갑 연결 중 문제가 발생했습니다.",
      });
    }
  };

  const disconnectWallet = () => {
    setAddress("");
    setBalance("");
    localStorage.removeItem("walletAddress");

    window.setTimeout(() => {
      setSuccessModal({
        open: true,
        message: "지갑 연결이 해제되었습니다.",
      });
    }, 500);

    window.setTimeout(() => {
      setSuccessModal({
        open: false,
        message: "",
      });
      onConnected("");
    }, 2000);
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setSuccessModal({
        open: true,
        message: "지갑 주소가 복사되었습니다.",
      });

      window.setTimeout(() => {
        setSuccessModal({
          open: false,
          message: "",
        });
      }, 1500);
    } catch (error) {
      console.error(error);
    }
  };

  const InfoCard = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">연결된 지갑</h3>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-gray-500 min-w-[90px]">지갑 주소</span>

            <div className="flex items-center gap-2">
              <span className="font-mono break-all text-gray-900">
                {address}
              </span>

              <button
                onClick={copyAddress}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-500 min-w-[90px]">잔액 (KAIA)</span>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {balance !== "" ? balance : "조회 중..."}
              </span>

              <button
                onClick={() => fetchBalance(address)}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={disconnectWallet}
            className="text-red-500 text-xs underline hover:text-red-600 pt-2"
            type="button"
          >
            연결 해제
          </button>
        </div>
      </div>
    );
  };

  if (mode === "page") {
    return (
      <div className="w-full">
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
          open={successModal.open}
          message={successModal.message}
          onClose={() =>
            setSuccessModal({
              open: false,
              message: "",
            })
          }
        />

        {!address ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center space-y-5">
            <h3 className="text-lg font-semibold">
              지갑이 아직 연결되지 않았습니다
            </h3>

            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 상속 금고 생성 및 관리</li>
              <li>• KAIA 자산 입금 및 관리</li>
              <li>• 상속 진행 상태 확인</li>
            </ul>

            <button
              onClick={connectWallet}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              type="button"
            >
              <Wallet className="w-4 h-4" />
              지갑 연결
            </button>

            <p className="text-xs text-gray-400">
              지갑 주소 외의 정보는 저장되지 않으며 언제든 연결을 해제할 수
              있습니다.
            </p>
          </div>
        ) : (
          <InfoCard />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow px-4 py-3">
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
        open={successModal.open}
        message={successModal.message}
        onClose={() =>
          setSuccessModal({
            open: false,
            message: "",
          })
        }
      />

      {address ? (
        <InfoCard />
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          type="button"
        >
          <Wallet className="w-4 h-4" />
          지갑 연결
        </button>
      )}
    </div>
  );
}