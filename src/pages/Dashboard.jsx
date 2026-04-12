import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useWallet } from "../context/WalletContext";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const { walletAddress, connectWallet } = useWallet();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSkills: 0,
    totalDownloads: 0,
    totalEarnings: 0,
  });

  async function fetchDashboardData() {
    setLoading(true);

    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("seller_address", walletAddress)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSkills(data);

      const totalDownloads = data.reduce((acc, s) => acc + s.downloads, 0);
      const totalEarnings = data.reduce(
        (acc, s) => acc + s.downloads * s.price_usdc,
        0
      );

      setStats({
        totalSkills: data.length,
        totalDownloads,
        totalEarnings: totalEarnings.toFixed(2),
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!walletAddress) {
      setSkills([]);
      setStats({
        totalSkills: 0,
        totalDownloads: 0,
        totalEarnings: 0,
      });
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, [walletAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  if (!walletAddress) {
    return (
      <div
        style={{ backgroundColor: "#0B0B0C" }}
        className="w-full min-h-screen flex flex-col items-center justify-center gap-6 px-4"
      >
        <h2
          style={{ color: "#F8FAFC" }}
          className="text-xl font-bold text-center"
        >
          Connect your wallet to view your dashboard
        </h2>
        <p
          style={{ color: "#94A3B8" }}
          className="text-sm text-center max-w-xs"
        >
          Your dashboard shows earnings and skills linked to your Stellar wallet
          address.
        </p>
        <button
          onClick={connectWallet}
          style={{ backgroundColor: "#311B92", color: "#F8FAFC" }}
          className="px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#0B0B0C" }} className="w-full min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* ───── PAGE HEADER ───── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p
            style={{ color: "#00E5FF" }}
            className="text-xs font-semibold tracking-widest uppercase mb-3"
          >
            Seller Dashboard
          </p>
          <h1
            style={{ color: "#F8FAFC" }}
            className="text-3xl sm:text-5xl font-bold leading-tight mb-4"
          >
            Your Skills
          </h1>
          <div
            style={{
              backgroundColor: "#161618",
              border: "1px solid #ffffff0f",
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
          >
            <div
              style={{ backgroundColor: "#00E5FF" }}
              className="w-1.5 h-1.5 rounded-full"
            />
            <p style={{ color: "#94A3B8" }} className="text-xs font-mono">
              {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
            </p>
          </div>
        </motion.div>

        {/* ───── STATS CARDS ───── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {[
            {
              label: "Total Earnings",
              value: `$${stats.totalEarnings} USDC`,
              color: "#00E5FF",
            },
            {
              label: "Total Downloads",
              value: stats.totalDownloads,
              color: "#F8FAFC",
            },
            {
              label: "Skills Listed",
              value: stats.totalSkills,
              color: "#F8FAFC",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
              style={{
                backgroundColor: "#161618",
                border: "1px solid #ffffff0a",
              }}
              className="rounded-2xl p-6 flex flex-col gap-3"
            >
              <span className="text-2xl">{stat.icon}</span>
              <span
                style={{ color: stat.color }}
                className="text-2xl font-bold"
              >
                {stat.value}
              </span>
              <span style={{ color: "#94A3B8" }} className="text-xs">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* ───── LIST SKILL BUTTON ───── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="mb-10 flex items-center justify-between"
        >
          <h2
            style={{ color: "#F8FAFC" }}
            className="text-lg font-semibold"
          >
            Listed Skills
          </h2>
          <Link
            to="/list-skill"
            style={{ backgroundColor: "#311B92", color: "#F8FAFC" }}
            className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            + List New Skill
          </Link>
        </motion.div>

        {/* ───── LOADING STATE ───── */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#161618",
                  border: "1px solid #ffffff0a",
                }}
                className="rounded-2xl p-5 h-20 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* ───── EMPTY STATE ───── */}
        {!loading && skills.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              backgroundColor: "#161618",
              border: "1px solid #ffffff0a",
            }}
            className="rounded-2xl p-16 flex flex-col items-center gap-4"
          >
            <span className="text-4xl">📦</span>
            <p
              style={{ color: "#F8FAFC" }}
              className="text-base font-semibold"
            >
              No skills listed yet
            </p>
            <p
              style={{ color: "#94A3B8" }}
              className="text-sm text-center max-w-xs"
            >
              List your first skill and start earning USDC on every download.
            </p>
            <Link
              to="/list-skill"
              style={{ backgroundColor: "#311B92", color: "#F8FAFC" }}
              className="mt-2 px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              List Your First Skill
            </Link>
          </motion.div>
        )}

        {/* ───── SKILLS TABLE ───── */}
        {!loading && skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Desktop Table */}
            <div
              style={{
                backgroundColor: "#161618",
                border: "1px solid #ffffff0a",
              }}
              className="rounded-2xl overflow-hidden hidden sm:block"
            >
              {/* Table Header */}
              <div
                style={{ borderBottom: "1px solid #ffffff0a" }}
                className="grid grid-cols-6 px-6 py-4"
              >
                {["Skill", "Category", "Price", "Downloads", "Earnings", "Date"].map(
                  (header) => (
                    <p
                      key={header}
                      style={{ color: "#94A3B8" }}
                      className="text-xs font-medium uppercase tracking-wider"
                    >
                      {header}
                    </p>
                  )
                )}
              </div>

              {/* Table Rows */}
              {skills.map((skill, i) => (
                <motion.div
                  key={skill.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  style={{
                    borderBottom:
                      i < skills.length - 1
                        ? "1px solid #ffffff0a"
                        : "none",
                  }}
                  className="grid grid-cols-6 px-6 py-4 items-center hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <p
                      style={{ color: "#F8FAFC" }}
                      className="text-sm font-medium"
                    >
                      {skill.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <span style={{ color: "#F59E0B" }} className="text-xs">
                        ★
                      </span>
                      <span style={{ color: "#94A3B8" }} className="text-xs">
                        {skill.rating || "0.0"}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      backgroundColor: "#0B0B0C",
                      color: "#94A3B8",
                      border: "1px solid #ffffff0f",
                    }}
                    className="text-xs font-medium px-2 py-1 rounded-md w-fit"
                  >
                    {skill.category}
                  </span>
                  <p
                    style={{ color: "#00E5FF" }}
                    className="text-sm font-bold"
                  >
                    ${skill.price_usdc}
                  </p>
                  <p style={{ color: "#F8FAFC" }} className="text-sm">
                    {skill.downloads.toLocaleString()}
                  </p>
                  <p
                    style={{ color: "#00E5FF" }}
                    className="text-sm font-medium"
                  >
                    ${(skill.downloads * skill.price_usdc).toFixed(2)}
                  </p>
                  <p style={{ color: "#94A3B8" }} className="text-xs">
                    {new Date(skill.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-4 sm:hidden">
              {skills.map((skill, i) => (
                <motion.div
                  key={skill.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  style={{
                    backgroundColor: "#161618",
                    border: "1px solid #ffffff0a",
                  }}
                  className="rounded-2xl p-5 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <p
                        style={{ color: "#F8FAFC" }}
                        className="text-sm font-semibold"
                      >
                        {skill.name}
                      </p>
                      <span
                        style={{
                          backgroundColor: "#0B0B0C",
                          color: "#94A3B8",
                          border: "1px solid #ffffff0f",
                        }}
                        className="text-xs px-2 py-0.5 rounded-md w-fit"
                      >
                        {skill.category}
                      </span>
                    </div>
                    <p
                      style={{ color: "#00E5FF" }}
                      className="text-sm font-bold"
                    >
                      ${skill.price_usdc}
                    </p>
                  </div>

                  <div
                    style={{ backgroundColor: "#ffffff0a" }}
                    className="w-full h-px"
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <p style={{ color: "#94A3B8" }} className="text-xs">
                        Downloads
                      </p>
                      <p
                        style={{ color: "#F8FAFC" }}
                        className="text-sm font-medium"
                      >
                        {skill.downloads}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p style={{ color: "#94A3B8" }} className="text-xs">
                        Earnings
                      </p>
                      <p
                        style={{ color: "#00E5FF" }}
                        className="text-sm font-medium"
                      >
                        ${(skill.downloads * skill.price_usdc).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p style={{ color: "#94A3B8" }} className="text-xs">
                        Rating
                      </p>
                      <p
                        style={{ color: "#F59E0B" }}
                        className="text-sm font-medium"
                      >
                        ★ {skill.rating || "0.0"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}