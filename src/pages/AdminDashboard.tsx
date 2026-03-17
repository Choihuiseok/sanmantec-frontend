import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import SuccessModal from "../components/common/SuccessModal";

interface PendingVault {
  id: number;
  ownerEmail: string;
  heirEmail: string;
  state: string;
}

interface RawVaultRequest {
  id?: number | string;
  vaultId?: number | string;
  vault_id?: number | string;
  ownerEmail?: string;
  owner_email?: string;
  heirEmail?: string;
  heir_email?: string;
  state?: string;
  status?: string;
  owner?: {
    email?: string;
  };
  heir?: {
    email?: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractArray(response: unknown): RawVaultRequest[] {
  if (!isRecord(response)) return [];

  const data = response.data;

  if (Array.isArray(data)) {
    return data as RawVaultRequest[];
  }

  if (isRecord(data) && Array.isArray(data.data)) {
    return data.data as RawVaultRequest[];
  }

  if (isRecord(data) && Array.isArray(data.requests)) {
    return data.requests as RawVaultRequest[];
  }

  return [];
}

function normalizeVaultRequests(items: RawVaultRequest[]): PendingVault[] {
  return items.map((item) => ({
    id: Number(item.id ?? item.vaultId ?? item.vault_id ?? 0),
    ownerEmail:
      item.ownerEmail ??
      item.owner_email ??
      item.owner?.email ??
      "",
    heirEmail:
      item.heirEmail ??
      item.heir_email ??
      item.heir?.email ??
      "",
    state: item.state ?? item.status ?? "pending",
  }));
}

function getErrorStatus(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;

  const response = error.response;
  if (!isRecord(response)) return undefined;

  const status = response.status;
  return typeof status === "number" ? status : undefined;
}

export default function AdminDashboard() {
  const [pendingVaults, setPendingVaults] = useState<PendingVault[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchPendingVaults = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setErrorMessage("");

      const response = await api.get("/admin/vault-requests/pending");
      const items = extractArray(response);
      const normalized = normalizeVaultRequests(items);

      setPendingVaults(normalized);
    } catch (error: unknown) {
      console.error("금고 승인 요청 목록 조회 실패:", error);

      const status = getErrorStatus(error);

      if (status === 401 || status === 403) {
        setErrorMessage("관리자 권한이 없거나 관리자 토큰이 올바르지 않습니다.");
      } else if (status === 404) {
        setErrorMessage("금고 생성 요청 목록을 아직 불러올 수 없습니다.");
      } else {
        setErrorMessage("금고 승인 요청 목록을 불러오지 못했습니다.");
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchPendingVaults(true);
  }, [fetchPendingVaults]);

  useEffect(() => {
    if (!modalOpen) return;

    const timer = window.setTimeout(() => {
      setModalOpen(false);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [modalOpen]);

  const handleApprove = async (vaultId: number) => {
    try {
      setActionLoadingId(vaultId);

      await api.post(`/admin/vault-requests/${vaultId}/approve`);

      setModalMessage(`ID : ${vaultId} 금고 생성 요청을 승인했습니다.`);
      setModalOpen(true);

      await fetchPendingVaults(false);
    } catch (error: unknown) {
      console.error("금고 승인 실패:", error);

      const status = getErrorStatus(error);

      if (status === 401 || status === 403) {
        setModalMessage("관리자 권한이 없거나 관리자 토큰이 올바르지 않습니다.");
      } else {
        setModalMessage("금고 승인 처리 중 오류가 발생했습니다.");
      }

      setModalOpen(true);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (vaultId: number) => {
    try {
      setActionLoadingId(vaultId);

      await api.post(`/admin/vault-requests/${vaultId}/reject`);

      setModalMessage(`ID : ${vaultId} 금고 생성 요청을 거절했습니다.`);
      setModalOpen(true);

      await fetchPendingVaults(false);
    } catch (error: unknown) {
      console.error("금고 거절 실패:", error);

      const status = getErrorStatus(error);

      if (status === 401 || status === 403) {
        setModalMessage("관리자 권한이 없거나 관리자 토큰이 올바르지 않습니다.");
      } else {
        setModalMessage("금고 거절 처리 중 오류가 발생했습니다.");
      }

      setModalOpen(true);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      <SuccessModal
        open={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />

      <h1 className="text-2xl font-bold border-b pb-4 text-gray-800">
        관리자 페이지
      </h1>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-blue-600">
            금고 생성 요청 목록
          </h2>

          <button
            type="button"
            onClick={() => {
              void fetchPendingVaults(true);
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            새로고침
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <p className="text-sm italic text-gray-400">불러오는 중입니다...</p>
          ) : pendingVaults.length === 0 ? (
            <p className="text-sm italic text-gray-400">
              대기 중인 요청이 없습니다.
            </p>
          ) : (
            pendingVaults.map((vault) => (
              <div
                key={vault.id}
                className="flex flex-col gap-4 rounded-lg border bg-white p-5 shadow-sm hover:border-blue-200 transition-colors md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-[100px] text-lg font-bold text-gray-800">
                  ID : {vault.id}
                </div>

                <div className="flex-grow space-y-1 md:mx-4 md:border-x md:border-gray-100 md:px-8">
                  <div className="flex items-center text-sm">
                    <span className="w-20 font-medium text-gray-500">
                      피상속인 :
                    </span>
                    <span className="font-semibold text-gray-800">
                      {vault.ownerEmail || "-"}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <span className="w-20 font-medium text-gray-500">
                      상속인 :
                    </span>
                    <span className="font-semibold text-gray-800">
                      {vault.heirEmail || "-"}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <span className="w-20 font-medium text-gray-500">
                      상태 :
                    </span>
                    <span className="font-semibold text-gray-800">
                      {vault.state || "-"}
                    </span>
                  </div>
                </div>

                <div className="flex w-full flex-shrink-0 justify-end gap-2 md:w-auto">
                  <button
                    type="button"
                    disabled={actionLoadingId === vault.id}
                    onClick={() => {
                      void handleReject(vault.id);
                    }}
                    className="rounded-md border border-red-500 bg-white px-4 py-2 text-sm font-bold text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoadingId === vault.id ? "처리 중..." : "승인 거절"}
                  </button>

                  <button
                    type="button"
                    disabled={actionLoadingId === vault.id}
                    onClick={() => {
                      void handleApprove(vault.id);
                    }}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoadingId === vault.id ? "처리 중..." : "승인"}
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