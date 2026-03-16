import WalletConnect from "../components/wallet/WalletConnect";

interface WalletPageProps {
  onConnected: (addr: string) => void;
}

export default function Wallet({ onConnected }: WalletPageProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">내 지갑</h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          Sanmantec 서비스에서 사용할 지갑을 연결하거나 해제할 수 있습니다.
          연결된 지갑을 기준으로 상속 금고 생성 및 자산 관리가 진행됩니다.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <WalletConnect onConnected={onConnected} mode="page" />
      </div>

      <div className="text-xs text-gray-500 leading-relaxed">
        ※ 지갑을 변경할 경우 기존 금고와의 연결 상태에 영향을 줄 수 있습니다.
        자산 관리 전 연결된 지갑 주소를 반드시 확인하세요.
      </div>
    </div>
  );
}