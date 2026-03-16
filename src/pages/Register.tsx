import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Modal from "../components/common/Modal";
import SuccessModal from "../components/common/SuccessModal";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [modal, setModal] = useState({
    open: false,
    message: "",
  });

  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
  });

  const openModal = (message: string) => {
    setModal({
      open: true,
      message,
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      message: "",
    });
  };

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleRegister = async () => {
    if (!email.trim()) {
      openModal("이메일을 입력하세요.");
      return;
    }

    if (!isValidEmail(email)) {
      openModal("올바른 이메일 형식으로 입력해주세요.");
      return;
    }

    if (!password || !password2) {
      openModal("비밀번호를 입력하세요.");
      return;
    }

    if (password !== password2) {
      openModal("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 8) {
      openModal("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    try {
      await api.post("/auth/register", {
        email,
        password,
      });

      setSuccessModal({
        open: true,
        message: "회원가입 완료! 로그인하세요.",
      });

      window.setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        "회원가입 실패";

      if (message.includes("already exists")) {
        openModal("이미 가입된 이메일입니다.");
        return;
      }

      if (message.includes("Invalid email or password format")) {
        openModal("이메일 또는 비밀번호 형식이 올바르지 않습니다.");
        return;
      }

      openModal(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Modal
        open={modal.open}
        message={modal.message}
        onClose={closeModal}
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

      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">회원가입</h1>

        <input
          type="email"
          placeholder="이메일"
          className="w-full border p-3 rounded mb-4"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="password"
          placeholder="비밀번호"
          className="w-full border p-3 rounded mb-3"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <input
          type="password"
          placeholder="비밀번호 확인"
          className="w-full border p-3 rounded mb-6"
          value={password2}
          onChange={(event) => setPassword2(event.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full py-3 text-white rounded bg-green-600 hover:bg-green-700"
          type="button"
        >
          회원가입 완료
        </button>

        <div className="text-center text-sm text-gray-600 mt-4">
          이미 계정이 있나요?{" "}
          <Link to="/" className="text-blue-600 underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}