import { useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import vaultABI from "../abi/vault_abi.json";

import Modal from "../components/common/Modal";
import SuccessModal from "../components/common/SuccessModal";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = "0xDc43Eb553C1beA593c710316B51EBa03a0b06777";

export default function CreateVault() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    heirName: "",
    heirEmail: "",
    heirWallet: "",
    agentName: "",
    agentEmail: "",
    agentRelation: "",
    noAgent: false,
    agreeTerms: false,
  });

  const [modal, setModal] = useState({
    open: false,
    message: "",
  });

  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
    variant: "success" as "success" | "warning",
  });

  const [termsViewed, setTermsViewed] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const TERMS_TEXT = `제1조 (서비스의 목적 및 성격)
본 서비스는 이용자가 보유한 블록체인 기반 디지털 자산에 대해, 사후(死後)에 지정된 수령인이 안전하게 접근할 수 있도록 돕는 ‘조건부 접근 권한 승인 솔루션’이다.

회사는 「특정 금융거래정보의 보고 및 이용 등에 관한 법률」을 준수하며, 이용자가 사전에 설정한 조건과 제출된 증빙 서류를 관리자가 직접 검토한 후 승인(Unlock)하는 방식으로 서비스를 운영한다.

본 서비스는 민법상 유언의 작성, 공증, 집행을 대리하지 않으며, 법률 자문이나 상속세 신고 대행 서비스를 제공하지 않는다.

제2조 (이용자의 권한과 책임)
이용자는 본인의 디지털 자산에 대한 정당한 소유권자여야 하며, 타인의 자산을 무단으로 등록해서는 안 된다.

이용자는 상속 대상자(수령인)를 지정할 책임이 있으며, 법적 상속인과 다른 제3자를 지정함으로 인해 발생하는 유류분 반환 청구 등 상속 분쟁에 대한 책임은 이용자 본인에게 있다.

서비스 이용을 위해 설정한 개인 키(Private Key) 및 계정 정보의 관리 책임은 이용자에게 있으며, 회사는 이용자의 관리 소홀로 인한 자산 분실에 대해 책임지지 않는다.

제3조 (Unlock 실행 조건 및 절차)
본 서비스는 자동화된 스마트컨트랙트가 아닌, 회사의 ‘서류 검증 및 수동 승인’ 절차를 따른다. Unlock은 다음 각 호의 절차에 의해서만 실행된다.

신청 자격: 이용자의 사망 사실을 증명할 수 있는 직계가족(배우자·직계존비속) 또는 법원의 결정을 받은 대리인만이 Unlock을 신청할 수 있다.

필수 제출 서류:
가족 신청 시: 사망진단서(사체검안서 단독 불가) 및 가족관계증명서.
비가족(제3자) 신청 시: 법원의 유언집행자 선임 결정문, 검인 조서 또는 이에 준하는 확정 판결문.

승인 거절: 회사는 제출된 서류가 위조되었거나, 단순 사체검안서만 제출된 경우, 또는 사적 유언장(사진, 녹음 등)만을 근거로 요청하는 경우 Unlock 승인을 거절한다.

제4조 (서비스 이용 제한 및 금지)
생전 이전 불가: 회사는 이용자의 생존 기간 중에는 어떠한 경우에도 자산의 제3자 이전(Unlock)을 승인하지 않는다.

미성년자 보호: 수령인이 미성년자인 경우, 적법한 법정대리인의 동의서 및 인감증명서가 확인되기 전까지 Unlock을 보류한다.

국고 귀속: 적법한 상속인이나 지정된 수령인이 없는 것으로 확인되는 경우, 관련 법령에 따라 자산 처리가 진행될 수 있다.

제5조 (책임 제한 및 면책)
기술적 한계: 블록체인 네트워크의 장애, 가스비 폭등, 네트워크 분기(Fork) 등 회사의 통제 범위를 벗어난 기술적 요인으로 인한 손해에 대해 회사는 책임을 지지 않는다.

서류의 신뢰: 회사가 육안 및 통상적인 방법으로 서류의 진위를 확인하고 선량한 관리자의 주의 의무를 다하여 Unlock을 승인했다면, 추후 해당 서류가 위조된 것으로 밝혀지더라도 회사는 기실행된 트랜잭션에 대해 책임을 지지 않는다.

법적 분쟁: 본 서비스를 통해 자산이 이전된 후 발생하는 상속인 간의 분쟁, 세금 문제, 채권자의 강제 집행 등에 대해 회사는 개입하지 않으며 책임지지 않는다.

제6조 (개인정보 및 기록 보존)
회사는 자금세탁방지 및 서비스 운영을 위해 필요한 최소한의 개인정보(신원확인 정보, 지갑 주소, 증빙 서류 등)를 수집하며, 이는 관련 법령에 따라 안전하게 관리된다.

이용자가 동의한 경우 서비스 업데이트 및 중요 알림을 전송할 수 있다.

제7조 (기타)
본 약관에 명시되지 않은 사항은 대한민국 법령 및 상관례에 따른다. 서비스 이용과 관련하여 회사와 이용자 간에 분쟁이 발생할 경우, 회사의 본점 소재지 관할 법원을 전속 관할로 한다.`;

  const totalSteps = 4;
  const isLastStep = step === totalSteps;

  const next = () => {
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const back = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const createVaultOnChain = async () => {
    try {
      if (!window.ethereum) {
        setModal({
          open: true,
          message: "메타마스크가 필요합니다.",
        });
        return;
      }

      setModal({
        open: false,
        message: "",
      });

      setSuccessModal({
        open: false,
        message: "",
        variant: "success",
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const ownerAddress = await signer.getAddress();

      const heirWallet =
        formData.heirWallet.trim() !== ""
          ? formData.heirWallet.trim()
          : ownerAddress;

      const needsWill = false;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, vaultABI, signer);

      const tx = await contract.createVault(heirWallet, needsWill);

      setModal({
        open: true,
        message: "트랜잭션 전송됨! 블록 처리 중...",
      });

      const receipt = await tx.wait();

      let vaultId: string | null = null;

      if (receipt?.events) {
        const event = receipt.events.find(
          (item: any) => item.event === "VaultCreated"
        );

        if (event?.args?.vaultId) {
          vaultId = event.args.vaultId.toString();
        }
      }

      if (!vaultId) {
        setModal({
          open: true,
          message: "⚠ 금고는 생성되었으나 vaultId를 읽지 못했습니다.",
        });
        return;
      }

      setSuccessModal({
        open: true,
        message: `금고 생성 완료! 🎉 vaultId = ${vaultId}`,
        variant: "success",
      });

      const saved = JSON.parse(localStorage.getItem("myVaultIds") || "[]");
      saved.push(vaultId);

      localStorage.setItem("myVaultIds", JSON.stringify(saved));
      localStorage.setItem("latestVaultId", vaultId);

      window.setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("금고 생성 오류:", error);
      setModal({
        open: true,
        message: "금고 생성 실패. 콘솔 로그를 확인하세요.",
      });
    }
  };

  const TermsModal = ({
    open,
    onClose,
    text,
  }: {
    open: boolean;
    onClose: () => void;
    text: string;
  }) => {
    if (!open) {
      return null;
    }

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">이용약관</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              type="button"
            >
              닫기
            </button>
          </div>

          <div className="px-6 py-5 max-h-[70vh] overflow-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {text}
            </pre>
          </div>

          <div className="px-6 py-4 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              type="button"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
        variant={successModal.variant}
        onClose={() =>
          setSuccessModal({
            open: false,
            message: "",
            variant: "success",
          })
        }
      />

      <TermsModal
        open={termsModalOpen}
        text={TERMS_TEXT}
        onClose={() => setTermsModalOpen(false)}
      />

      <div className="max-w-3xl mx-auto">
        <div className="relative mb-10 w-full">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-300 -translate-y-1/2 rounded" />

          <div
            className="absolute left-0 top-1/2 h-1 bg-green-600 -translate-y-1/2 rounded"
            style={{
              width: `${totalSteps <= 1 ? 0 : ((step - 1) / (totalSteps - 1)) * 100
                }%`,
            }}
          />

          <div className="relative flex justify-between">
            {Array.from({ length: totalSteps }, (_, index) => index + 1).map(
              (number) => (
                <div
                  key={number}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${number < step
                    ? "bg-green-600"
                    : number === step
                      ? "bg-blue-600"
                      : "bg-gray-300"
                    }`}
                >
                  {number < step ? <Check className="w-5 h-5" /> : number}
                </div>
              )
            )}
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl shadow">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">금고 생성 안내</h2>

              <p className="text-gray-600 leading-relaxed mb-6">
                산만텍 상속지갑(Vault)은 사용자의 온체인 자산을 자동으로
                이전하지 않으며, 법적 절차가 충족된 경우에만 상속자에게
                접근 권한을 이전하는 구조로 설계되었습니다.
              </p>

              <p className="text-gray-700 text-sm leading-relaxed">
                법원 검증 완료 문서만 Unlock 승인됩니다.
              </p>

              <p className="text-gray-700 text-sm leading-relaxed mt-3">
                상속 절차 진행을 위해서는{" "}
                <span className="font-semibold">법원 결정문</span> 등 법적
                효력이 확인된 문서를 제출해야 합니다.
              </p>

              <p className="text-gray-700 text-sm leading-relaxed mt-2">
                금고 생성 후, 금고 대시보드 화면에서{" "}
                <span className="font-semibold">Unlock 요청</span> 버튼을 눌러
                관련 서류를 업로드하여 제출하면 됩니다.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">상속인 정보</h2>

              <input
                className="input border p-3 rounded w-full"
                placeholder="상속인 이름"
                value={formData.heirName}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    heirName: event.target.value,
                  })
                }
              />

              <input
                className="input border p-3 rounded w-full"
                placeholder="상속인 이메일"
                value={formData.heirEmail}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    heirEmail: event.target.value,
                  })
                }
              />

              <input
                className="input border p-3 rounded w-full"
                placeholder="상속인 지갑 주소"
                value={formData.heirWallet}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    heirWallet: event.target.value,
                  })
                }
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">대리인 정보</h2>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.noAgent}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      noAgent: event.target.checked,
                    })
                  }
                />
                대리인 없이 진행
              </label>

              {!formData.noAgent && (
                <>
                  <input
                    className="input border p-3 rounded w-full"
                    placeholder="대리인 이름"
                    value={formData.agentName}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        agentName: event.target.value,
                      })
                    }
                  />

                  <input
                    className="input border p-3 rounded w-full"
                    placeholder="대리인 이메일"
                    value={formData.agentEmail}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        agentEmail: event.target.value,
                      })
                    }
                  />

                  <input
                    className="input border p-3 rounded w-full"
                    placeholder="관계/역할"
                    value={formData.agentRelation}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        agentRelation: event.target.value,
                      })
                    }
                  />
                </>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-4">최종 확인</h2>

              <div className="p-4 bg-gray-50 rounded text-sm space-y-2">
                <p>상속인 이름: {formData.heirName}</p>
                <p>상속인 이메일: {formData.heirEmail}</p>
                <p>대리인: {formData.noAgent ? "없음" : formData.agentName}</p>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setTermsModalOpen(true);
                    setTermsViewed(true);
                  }}
                  className={`w-full py-3 rounded transition font-medium ${termsViewed
                    ? "bg-gray-300 text-gray-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  {termsViewed ? "이용약관 확인 완료" : "이용약관 보기"}
                </button>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    disabled={!termsViewed}
                    onClick={(event) => {
                      if (!termsViewed) {
                        event.preventDefault();
                        setModal({
                          open: true,
                          message: "이용약관을 먼저 확인해 주세요.",
                        });
                      }
                    }}
                    onChange={(event) => {
                      if (!termsViewed) {
                        return;
                      }

                      setFormData({
                        ...formData,
                        agreeTerms: event.target.checked,
                      });
                    }}
                  />
                  이용약관에 동의합니다.
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            className="px-4 py-2 bg-gray-300 rounded flex items-center gap-2"
            onClick={back}
            disabled={step === 1}
            type="button"
          >
            <ChevronLeft />
            이전
          </button>

          {!isLastStep ? (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
              onClick={next}
              type="button"
            >
              다음
              <ChevronRight />
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-green-300"
              disabled={!formData.agreeTerms}
              onClick={createVaultOnChain}
              type="button"
            >
              금고 생성
            </button>
          )}
        </div>
      </div>
    </div>
  );
}