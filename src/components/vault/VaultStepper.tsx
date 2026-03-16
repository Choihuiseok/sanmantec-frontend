const VAULT_STEPS = [
  {
    label: "잠금됨",
    desc: "상속 조건이 아직 충족되지 않아 금고가 잠겨 있습니다.",
    value: 0,
  },
  {
    label: "서류 검증 중",
    desc: "사망 확인 및 법적 서류 검증이 진행 중입니다.",
    value: 1,
  },
  {
    label: "Unlock 승인됨",
    desc: "상속 요건이 충족되어 상속자가 출금할 수 있습니다.",
    value: 2,
  },
  {
    label: "상속 완료",
    desc: "금고 내 자산이 모두 상속인에게 이전(출금)되었습니다.",
    value: 3,
  },
];

interface VaultStepperProps {
  current: number;
}

export default function VaultStepper({ current }: VaultStepperProps) {
  return (
    <div className="flex items-center gap-4 mt-2">
      {VAULT_STEPS.map((step, index) => {
        const isActive = current === step.value;
        const isDone = current > step.value;

        return (
          <div
            key={step.value}
            className="relative group flex items-center gap-2"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                isActive
                  ? "bg-blue-600 text-white"
                  : isDone
                  ? "bg-blue-300 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {index + 1}
            </div>

            <span
              className={`text-sm whitespace-nowrap ${
                isActive
                  ? "font-semibold text-blue-600"
                  : isDone
                  ? "text-gray-700"
                  : "text-gray-400"
              }`}
            >
              {step.label}
            </span>

            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-black text-white text-xs rounded-lg px-3 py-2 w-56 z-20">
              {step.desc}
            </div>

            {index < VAULT_STEPS.length - 1 && (
              <div className="w-8 h-px bg-gray-300 mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}