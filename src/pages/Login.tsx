import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import SuccessModal from "../components/common/SuccessModal";

const ADMIN_EMAIL = "admin@sanmantec.com";
const ADMIN_PASSWORD = "admin1234!";

interface LoginProps {
  onSuccess: (user: any) => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
  });

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");
    setFormError("");

    if (!isValidEmail(form.email)) {
      setEmailError("이메일 형식으로 입력해주세요.");
      return;
    }

    if (!form.password) {
      setPasswordError("비밀번호를 입력해주세요.");
      return;
    }

    if (form.email === ADMIN_EMAIL) {
      if (form.password !== ADMIN_PASSWORD) {
        setFormError("관리자 이메일 또는 비밀번호 오류");
        setEmailError(" ");
        setPasswordError(" ");
        return;
      }

      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("token", "admin-demo-token");

      onSuccess({
        email: ADMIN_EMAIL,
        role: "admin",
      });

      setSuccessModal({
        open: true,
        message: "관리자로 로그인했습니다!",
      });

      window.setTimeout(() => {
        navigate("/admin");
      }, 800);

      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", form);
      const token = response.data.token;

      localStorage.setItem("token", token);
      localStorage.removeItem("isAdmin");

      if (response.data.walletAddress) {
        localStorage.setItem("walletAddress", response.data.walletAddress);
      } else {
        localStorage.removeItem("walletAddress");
      }

      onSuccess(response.data.user);

      setSuccessModal({
        open: true,
        message: "로그인에 성공했습니다!",
      });

      window.setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (error: any) {
      const message = error.response?.data?.message || "";

      if (message.includes("이메일") || message.includes("비밀번호")) {
        setFormError("이메일 또는 비밀번호 오류");
        setEmailError(" ");
        setPasswordError(" ");
        return;
      }

      if (message.includes("Invalid email or password")) {
        setFormError("이메일 또는 비밀번호 오류");
        setEmailError(" ");
        setPasswordError(" ");
        return;
      }

      setFormError("로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 relative">
      {loading && <div className="google-loading-bar" />}

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

      <div className="w-[90%] max-w-3xl bg-slate-50 rounded-2xl shadow-md py-12 px-10">
        <h1 className="text-3xl font-bold text-center mb-10">로그인</h1>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleLogin();
          }}
          className="max-w-md mx-auto"
        >
          <input
            type="text"
            placeholder="이메일"
            className={`w-full border p-3 rounded mb-1 ${
              emailError ? "border-red-500" : "border-gray-300"
            }`}
            value={form.email}
            onChange={(event) => {
              setForm({
                ...form,
                email: event.target.value,
              });
              setEmailError("");
              setFormError("");
            }}
          />

          {emailError && (
            <p className="text-red-500 text-sm mb-3">{emailError}</p>
          )}

          <div className="relative mb-1">
            <input
              type={showPass ? "text" : "password"}
              placeholder="비밀번호"
              className={`w-full border p-3 rounded ${
                passwordError ? "border-red-500" : "border-gray-300"
              }`}
              value={form.password}
              onChange={(event) => {
                setForm({
                  ...form,
                  password: event.target.value,
                });
                setPasswordError("");
                setFormError("");
              }}
              autoComplete="off"
            />

            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPass ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {passwordError && (
            <p className="text-red-500 text-sm mb-3">{passwordError}</p>
          )}

          {formError && (
            <p className="text-red-500 text-sm mb-4 text-left">{formError}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 mb-4"
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <div className="text-center text-sm text-gray-600 mt-2">
            계정이 없나요?{" "}
            <Link to="/register" className="text-blue-600 underline">
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}