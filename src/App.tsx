import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { Home as HomeIcon, Wallet as WalletIcon, Lock } from "lucide-react";

import SuccessModal from "./components/common/SuccessModal";

import Home from "./pages/Home";
import Wallet from "./pages/Wallet";
import Dashboard from "./pages/Dashboard";
import CreateVault from "./pages/CreateVault";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";

function NavButton({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 pb-2 text-sm font-medium transition ${
          isActive
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-600 hover:text-blue-500"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

function Layout({
  children,
  isLoggedIn,
  showLoginSuccess,
}: {
  children: React.ReactNode;
  isLoggedIn: boolean;
  showLoginSuccess: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const hideHeader =
    location.pathname === "/" || location.pathname === "/register";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("isAdmin");

    navigate("/");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {isLoggedIn && !hideHeader && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Sanmantec</h1>

              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                type="button"
              >
                로그아웃
              </button>
            </div>

            <nav className="flex gap-8 mt-2">
              {localStorage.getItem("isAdmin") !== "true" ? (
                <>
                  <NavButton
                    to="/home"
                    label="홈"
                    icon={<HomeIcon size={18} />}
                  />

                  <NavButton
                    to="/wallet"
                    label="내 지갑"
                    icon={<WalletIcon size={18} />}
                  />

                  <NavButton
                    to="/dashboard"
                    label="내 금고"
                    icon={<Lock size={18} />}
                  />
                </>
              ) : (
                <NavButton
                  to="/admin"
                  label="관리자"
                  icon={<Lock size={18} />}
                />
              )}
            </nav>
          </>
        )}

        <SuccessModal
          open={showLoginSuccess}
          message="로그인 완료되었습니다."
          onClose={() => {}}
        />

        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [wallet, setWallet] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    const savedWallet = localStorage.getItem("walletAddress");
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (savedWallet) {
      setWallet(savedWallet);
    }

    if (token || userId) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleConnected = (address: string) => {
    setWallet(address);

    if (address) {
      localStorage.setItem("walletAddress", address);
    } else {
      localStorage.removeItem("walletAddress");
    }
  };

  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              isAdmin ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/home" />
              )
            ) : (
              <Layout isLoggedIn={false} showLoginSuccess={false}>
                <Login
                  onSuccess={(user) => {
                    localStorage.setItem("userId", user?.id ?? "admin");
                    setIsLoggedIn(true);

                    setLoginSuccess(true);

                    window.setTimeout(() => {
                      setLoginSuccess(false);
                    }, 1500);
                  }}
                />
              </Layout>
            )
          }
        />

        <Route
          path="/register"
          element={
            <Layout isLoggedIn={false} showLoginSuccess={false}>
              <Register />
            </Layout>
          }
        />

        <Route
          path="/home"
          element={
            isLoggedIn ? (
              isAdmin ? (
                <Navigate to="/admin" />
              ) : (
                <Layout isLoggedIn={true} showLoginSuccess={loginSuccess}>
                  <Home />
                </Layout>
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/wallet"
          element={
            isLoggedIn ? (
              isAdmin ? (
                <Navigate to="/admin" />
              ) : (
                <Layout isLoggedIn={true} showLoginSuccess={loginSuccess}>
                  <Wallet onConnected={handleConnected} />
                </Layout>
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              isAdmin ? (
                <Navigate to="/admin" />
              ) : (
                <Layout isLoggedIn={true} showLoginSuccess={loginSuccess}>
                  <Dashboard />
                </Layout>
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/create-vault"
          element={
            isLoggedIn ? (
              isAdmin ? (
                <Navigate to="/admin" />
              ) : (
                <Layout isLoggedIn={true} showLoginSuccess={loginSuccess}>
                  <CreateVault />
                </Layout>
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/admin"
          element={
            isLoggedIn && isAdmin ? (
              <Layout isLoggedIn={true} showLoginSuccess={loginSuccess}>
                <AdminDashboard />
              </Layout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="*"
          element={
            isLoggedIn ? (
              isAdmin ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/home" />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}