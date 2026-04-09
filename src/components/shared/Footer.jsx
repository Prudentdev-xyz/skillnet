import { Link } from "react-router-dom";
import logo from "@/assets/SkillnetLogo.jpg";

export default function Footer() {
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Catalog", path: "/catalog" },
    { label: "List Skill", path: "/list-skill" },
    { label: "Dashboard", path: "/dashboard" },
  ];

  return (
    <footer
      style={{
        borderTop: "1px solid #ffffff14",
      }}
      className="w-full mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top section — Logo + Nav Links */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Logo + tagline */}
          <div className="flex flex-col gap-3">
            <Link to="/">
              <img
                src={logo}
                alt="SkillNet"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p style={{ color: "#94A3B8" }} className="text-sm max-w-xs">
              Skills for developers. Tools for agents. Payments on Stellar.
            </p>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-3">
            <p style={{ color: "#F8FAFC" }} className="text-sm font-semibold">
              Navigation
            </p>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{ color: "#94A3B8" }}
                className="text-sm hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Built on Stellar */}
          <div className="flex flex-col gap-3">
            <p style={{ color: "#F8FAFC" }} className="text-sm font-semibold">
              Powered By
            </p>
            <p style={{ color: "#94A3B8" }} className="text-sm">
              Stellar Network
            </p>
            <p style={{ color: "#94A3B8" }} className="text-sm">
              x402 Protocol
            </p>
            <p style={{ color: "#94A3B8" }} className="text-sm">
              Supabase
            </p>
            <p style={{ color: "#94A3B8" }} className="text-sm">
              Freighter Wallet
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{ backgroundColor: "#ffffff14" }}
          className="w-full h-px my-8"
        />

        {/* Bottom section — copyright */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p style={{ color: "#94A3B8" }} className="text-xs">
            © {new Date().getFullYear()} SkillNet. Built for the Stellar x402
            Hackathon.
          </p>
          <p style={{ color: "#00E5FF" }} className="text-xs font-medium">
            Payments on Stellar Testnet
          </p>
        </div>
      </div>
    </footer>
  );
}
