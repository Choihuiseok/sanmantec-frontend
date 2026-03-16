import { Link } from "react-router-dom";

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 space-y-4 hover:shadow-md hover:-translate-y-1 transition">
      <div className="text-4xl">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function ProcessStep({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
      <div className="text-blue-600 font-bold text-sm">
        STEP {step}
      </div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-gray-600 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-24 space-y-20">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            블록체인 기반{" "}
            <span className="text-blue-600">
              상속 자산 관리 서비스
            </span>
          </h2>

          <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
            Sanmantec는 사망 이후에도 자산이 안전하게 보호되고,
            법적 절차에 따라 상속인에게 이전되도록 설계된
            블록체인 기반 상속 지갑 서비스입니다.
          </p>

          <div className="pt-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-700 transition"
            >
              내 금고 바로가기 →
            </Link>
          </div>
        </div>

        <div className="hidden md:flex justify-center">
          <div className="w-72 h-72 rounded-3xl bg-blue-50 flex items-center justify-center text-6xl">
            🔐
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">
            왜 Sanmantec인가?
          </h3>
          <p className="text-gray-600 text-sm">
            디지털 자산 상속에서 발생하는 구조적 공백을 해결합니다
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                ✓ 기술적으로
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 개인키 접근 불가 문제 해결</li>
                <li>• 스마트컨트랙트의 한계 보완</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                ✓ 법적으로
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 기존 상속 절차 존중</li>
                <li>• 자동 전송이 아닌 “검증 기반 실행”</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                ✓ 구조적으로
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 비수탁(Non-Custodial) 구조</li>
                <li>• 서비스가 사라져도 자산은 유지</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-blue-500 pl-4 text-gray-700">
          <p className="font-medium">
            Sanmantec는 “누군가 대신 해주는 서비스”가 아니라
          </p>
          <p className="font-semibold">
            “상속이 가능해지도록 구조를 만들어주는 서비스”입니다.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <FeatureCard
          icon="🔒"
          title="자산 잠금"
          description="사망 전까지 자산은 본인만 접근 가능하며 스마트컨트랙트를 통해 안전하게 보호됩니다."
        />

        <FeatureCard
          icon="📄"
          title="서류 검증"
          description="사망 확인 및 법적 서류 검증을 통해 상속 절차가 단계적으로 개시됩니다."
        />

        <FeatureCard
          icon="🔓"
          title="자동 Unlock"
          description="모든 조건이 충족되면 별도 개입 없이 자산이 상속인에게 이전됩니다."
        />
      </section>

      <section className="space-y-10">
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold">
            상속 절차는 다음과 같이 진행됩니다
          </h3>
          <p className="text-gray-600 text-sm">
            Sanmantec는 자산을 대신 보관하지 않고,
            검증된 조건 하에서 접근 권한만을 이전합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ProcessStep
            step="01"
            title="금고 생성"
            description="사용자는 생전에 상속 전용 금고를 생성하고 상속인을 미리 지정합니다."
          />
          <ProcessStep
            step="02"
            title="자산 잠금"
            description="금고에 보관된 자산은 사망 전까지 소유자만 접근할 수 있도록 잠금됩니다."
          />
          <ProcessStep
            step="03"
            title="사망·서류 검증"
            description="사망 확인 및 법적 서류가 검증되면 상속 절차가 개시됩니다."
          />
          <ProcessStep
            step="04"
            title="권한 이전"
            description="모든 조건이 충족되면 금고의 제어 권한이 상속인에게 이전됩니다."
          />
        </div>
      </section>

      <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-sm text-gray-600 leading-relaxed">
        <p>
          ※ 본 서비스는 실제 법적 상속 절차를 대체하지 않으며,
          사전 정의된 조건과 검증 과정을 기반으로
          자산 이전을 보조하는 구조로 설계되었습니다.
        </p>
      </section>
    </div>
  );
}