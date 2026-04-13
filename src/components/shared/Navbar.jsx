import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import logo from "@/assets/SkillnetLogo.jpg";
import { useWallet } from "../../context/WalletContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { walletAddress, connecting, connectWallet, disconnectWallet } =
    useWallet();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Catalog", path: "/catalog" },
    { label: "List Skill", path: "/list-skill" },
    { label: "Dashboard", path: "/dashboard" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path;
  };

  const shortAddress = (addr) =>
    addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : "";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        backgroundColor: "#0B0B0C",
        borderBottom: "1px solid #ffffff14",
      }}
      className="w-full sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="SkillNet"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  color: isActive(link.path) ? "#00E5FF" : "#94A3B8",
                  fontWeight: isActive(link.path) ? "500" : "400",
                }}
                className="text-sm transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Connect Wallet Button — Desktop */}
          <div className="hidden md:flex items-center">
            {walletAddress ? (
              <div className="flex items-center gap-3">
                <div
                  style={{
                    backgroundColor: "#161618",
                    border: "1px solid #ffffff14",
                    color: "#00E5FF",
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-medium"
                >
                  ● {shortAddress(walletAddress)}
                </div>
                <button
                  onClick={disconnectWallet}
                  style={{
                    backgroundColor: "transparent",
                    color: "#94A3B8",
                    border: "1px solid #ffffff14",
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-medium hover:text-white hover:border-white transition-all"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={connecting}
                style={{
                  backgroundColor: "#311B92",
                  color: "#F8FAFC",
                  border: "none",
                  opacity: connecting ? 0.7 : 1,
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: "#94A3B8" }}
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8"
          >
            <span
              style={{ backgroundColor: "#94A3B8" }}
              className={`block h-0.5 w-6 transition-all duration-300 ${
                menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              style={{ backgroundColor: "#94A3B8" }}
              className={`block h-0.5 w-6 transition-all duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              style={{ backgroundColor: "#94A3B8" }}
              className={`block h-0.5 w-6 transition-all duration-300 ${
                menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div
          style={{
            backgroundColor: "#0B0B0C",
            borderTop: "1px solid #ffffff14",
          }}
          className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-4"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              style={{
                color: isActive(link.path) ? "#00E5FF" : "#94A3B8",
                fontWeight: isActive(link.path) ? "600" : "400",
              }}
              className="text-sm transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}

          {/* Connect Wallet — Mobile */}
          {walletAddress ? (
            <div className="flex flex-col gap-2">
              <div
                style={{
                  backgroundColor: "#161618",
                  border: "1px solid #ffffff14",
                  color: "#00E5FF",
                }}
                className="px-3 py-2 rounded-lg text-xs font-medium text-center"
              >
                ● {shortAddress(walletAddress)}
              </div>
              <button
                onClick={() => {
                  disconnectWallet();
                  setMenuOpen(false);
                }}
                style={{
                  backgroundColor: "transparent",
                  color: "#94A3B8",
                  border: "1px solid #ffffff14",
                }}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium hover:text-white transition-all text-center"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                connectWallet();
                setMenuOpen(false);
              }}
              disabled={connecting}
              style={{
                backgroundColor: "#311B92",
                color: "#F8FAFC",
                border: "none",
                opacity: connecting ? 0.7 : 1,
              }}
              className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 text-center"
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      )}
    </motion.nav>
  );
}
