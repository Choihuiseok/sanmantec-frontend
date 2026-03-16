import { useEffect, useState } from "react";
import SuccessModal from "../components/common/SuccessModal";

interface PendingVault {
  id: number;
  ownerEmail: string;
  heirEmail: string;
}

interface UnlockRequest {
  id: number;
  vaultId: number;
  heirEmail: string;
  docUrl: string;
}

export default function AdminDashboard() {
  const [pendingVaults, setPendingVaults] = useState<PendingVault[]>([
    {
      id: 15,
      ownerEmail: "godls0739@naver.com",
      heirEmail: "gildong@gmail.com",
    },
  ]);

  const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (!modalOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      setModalOpen(false);
    }, 10000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [modalOpen]);

  const handleApprove = (id: number, type: "vault" | "unlock") => {
    if (type === "vault") {
      setModalMessage(`ID : ${id} 금고 생성을 승인했습니다.`);
      setModalOpen(true);

      setPendingVaults((previous) =>
        previous.filter((vault) => vault.id !== id)
      );

      window.setTimeout(() => {
        setUnlockRequests([
          {
            id: 1,
            vaultId: 15,
            heirEmail: "gildong@gmail.com",
            docUrl: "/document_sample.png",
          },
        ]);
      }, 20000);

      return;
    }

    const targetVaultId =
      unlockRequests.find((request) => request.id === id)?.vaultId ?? id;

    setModalMessage(`${targetVaultId}번 서류 최종 승인이 완료되었습니다.`);
    setModalOpen(true);

    setUnlockRequests((previous) =>
      previous.filter((request) => request.id !== id)
    );
  };

  const handleReject = (id: number, type: "vault" | "unlock") => {
    setModalMessage(`${id}번 요청이 거절되었습니다.`);
    setModalOpen(true);

    if (type === "vault") {
      setPendingVaults((previous) =>
        previous.filter((vault) => vault.id !== id)
      );
      return;
    }

    setUnlockRequests((previous) =>
      previous.filter((request) => request.id !== id)
    );
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <SuccessModal
        open={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />

      <h1 className="text-2xl font-bold border-b pb-4 text-gray-800">
        관리자 페이지
      </h1>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-blue-600">
          금고 생성 요청 목록
        </h2>

        <div className="space-y-4">
          {pendingVaults.length === 0 ? (
            <p className="text-gray-400 text-sm italic">
              대기 중인 요청이 없습니다.
            </p>
          ) : (
            pendingVaults.map((vault) => (
              <div
                key={vault.id}
                className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-5 border rounded-lg bg-white shadow-sm hover:border-blue-200 transition-colors"
              >
                <div className="text-lg font-bold text-gray-800 min-w-[100px]">
                  ID : {vault.id}
                </div>

                <div className="flex flex-col space-y-1 flex-grow md:px-8 md:border-l md:border-r border-gray-100 md:mx-4">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-20 font-medium">
                      피상속인 :
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {vault.ownerEmail}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-20 font-medium">
                      상속인 :
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {vault.heirEmail}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end flex-shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => handleReject(vault.id, "vault")}
                    className="px-4 py-2 bg-white border border-red-500 text-red-500 rounded-md hover:bg-red-50 text-sm font-bold transition-colors"
                    type="button"
                  >
                    승인 거절
                  </button>

                  <button
                    onClick={() => handleApprove(vault.id, "vault")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-bold transition-colors"
                    type="button"
                  >
                    승인
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-red-600">
          Unlock 서류 검토 (2단계 → 3단계)
        </h2>

        <div className="space-y-4">
          {unlockRequests.length === 0 ? (
            <p className="text-gray-400 text-sm italic">
              검토할 서류가 없습니다.
            </p>
          ) : (
            unlockRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-5 border rounded-lg bg-white shadow-sm hover:border-red-200 transition-colors"
              >
                <div className="text-lg font-bold text-gray-800 min-w-[100px]">
                  ID : {request.vaultId}
                </div>

                <div className="flex flex-col space-y-1 flex-grow md:px-8 md:border-l md:border-r border-gray-100 md:mx-4">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-20 font-medium">
                      상속인 :
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {request.heirEmail}
                    </span>
                  </div>

                  <a
                    href={request.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-500 underline mt-1 font-bold"
                  >
                    제출된 법원 결정문/사망진단서 보기
                  </a>
                </div>

                <div className="flex gap-2 justify-end flex-shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => handleReject(request.id, "unlock")}
                    className="px-4 py-2 bg-white border border-gray-400 text-gray-500 rounded-md hover:bg-gray-50 text-sm font-bold transition-colors"
                    type="button"
                  >
                    승인 거절
                  </button>

                  <button
                    onClick={() => handleApprove(request.id, "unlock")}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-bold transition-colors"
                    type="button"
                  >
                    승인
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}