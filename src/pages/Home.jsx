import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [stats, setStats] = useState({
    totalSkills: 0,
    totalDownloads: 0,
    totalSellers: 0,
  });
  const [featuredSkills, setFeaturedSkills] = useState([]);

  const headlineVariants = [
    { first: "Skill", second: "AI Agents" },
    { first: "Tool", second: "Developers" },
  ];

  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % headlineVariants.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const { data: skills } = await supabase
        .from("skills")
        .select("*")
        .order("rating", { ascending: false })
        .limit(4);

      if (skills) {
        setFeaturedSkills(skills);
        const totalDownloads = skills.reduce((acc, s) => acc + s.downloads, 0);
        setStats({
          totalSkills: 24,
          totalDownloads: totalDownloads,
          totalSellers: 12,
        });
      }
    }
    fetchData();
  }, []);

  const categories = [
    { label: "Blockchain", icon: "⛓️" },
    { label: "Crypto", icon: "₿" },
    { label: "AI", icon: "🤖" },
    { label: "Web3", icon: "🌐" },
    { label: "Frontend", icon: "🖥️" },
    { label: "Backend", icon: "⚙️" },
    { label: "Product Design", icon: "🎨" },
    { label: "DeFi", icon: "✦" },
  ];

  const steps = [
    {
      number: "01",
      title: "Browse the Catalog",
      description:
        "Search and filter through pre-built AI agent skills across 8 categories.",
    },
    {
      number: "02",
      title: "Connect Your Wallet",
      description:
        "Connect your Freighter wallet in one click. No account, no email, no forms.",
    },
    {
      number: "03",
      title: "Pay Instantly",
      description:
        "A tiny USDC micropayment settles on Stellar in under 5 seconds via x402.",
    },
    {
      number: "04",
      title: "Download & Deploy",
      description:
        "Your skill file downloads immediately. Plug it into your agent and ship.",
    },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <div style={{ backgroundColor: "#0B0B0C" }} className="w-full">
      {/* ───── HERO ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 flex flex-col items-center text-center gap-8">

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          style={{ color: "#F8FAFC" }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight max-w-4xl tracking-tight"
        >
          The{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={headlineVariants[headlineIndex].first}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              style={{ color: "#00E5FF" }}
            >
              {headlineVariants[headlineIndex].first}
            </motion.span>
          </AnimatePresence>{" "}
          Marketplace
          <br />
          for{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={headlineVariants[headlineIndex].second}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{ color: "#F8FAFC" }}
            >
              {headlineVariants[headlineIndex].second}
            </motion.span>
          </AnimatePresence>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          style={{ color: "#94A3B8" }}
          className="text-base sm:text-lg max-w-xl leading-relaxed"
        >
          Buy and sell pre-built AI agent skills with instant USDC micropayments
          on Stellar. No subscriptions. No billing forms. Just skills.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2"
        >
          <Link
            to="/catalog"
            style={{ backgroundColor: "#311B92", color: "#F8FAFC" }}
            className="px-8 py-3.5 rounded-lg font-semibold text-sm text-center hover:opacity-90 transition-opacity"
          >
            Browse Skills
          </Link>
          <Link
            to="/list-skill"
            style={{
              backgroundColor: "transparent",
              color: "#94A3B8",
              border: "1px solid #ffffff18",
            }}
            className="px-8 py-3.5 rounded-lg font-semibold text-sm text-center hover:text-white hover:border-white transition-all"
          >
            List Your Skill
          </Link>
        </motion.div>
      </section>

      {/* ───── STATS BAR ───── */}
      <section
        style={{
          borderTop: "1px solid #ffffff0a",
          borderBottom: "1px solid #ffffff0a",
        }}
        className="w-full py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-3 gap-6 text-center">
          {[
            { label: "Skills Listed", value: stats.totalSkills + "+" },
            { label: "Total Downloads", value: stats.totalDownloads + "+" },
            { label: "Active Sellers", value: stats.totalSellers + "+" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="flex flex-col gap-2"
            >
              <span
                style={{ color: "#F8FAFC" }}
                className="text-2xl sm:text-4xl font-bold tracking-tight"
              >
                {stat.value}
              </span>
              <span style={{ color: "#94A3B8" }} className="text-xs sm:text-sm">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16"
        >
          <p
            style={{ color: "#00E5FF" }}
            className="text-xs font-semibold tracking-widest uppercase mb-3"
          >
            How It Works
          </p>
          <h2
            style={{ color: "#F8FAFC" }}
            className="text-2xl sm:text-4xl font-bold max-w-md leading-tight"
          >
            From discovery to deployment in 30 seconds
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              style={{
                backgroundColor: "#161618",
                border: "1px solid #ffffff0a",
              }}
              className="rounded-2xl p-7 flex flex-col gap-5"
            >
              <span
                style={{ color: "#ffffff18" }}
                className="text-4xl font-bold"
              >
                {step.number}
              </span>
              <h3
                style={{ color: "#F8FAFC" }}
                className="text-base font-semibold"
              >
                {step.title}
              </h3>
              <p
                style={{ color: "#94A3B8" }}
                className="text-sm leading-relaxed"
              >
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── CATEGORIES ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16"
        >
          <p
            style={{ color: "#00E5FF" }}
            className="text-xs font-semibold tracking-widest uppercase mb-3"
          >
            Categories
          </p>
          <h2
            style={{ color: "#F8FAFC" }}
            className="text-2xl sm:text-4xl font-bold leading-tight"
          >
            8 categories. Every skill
            <br />
            your agent needs.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i * 0.3}
              whileHover={{ scale: 1.02 }}
            >
              <Link
                to={`/catalog?category=${cat.label}`}
                style={{
                  backgroundColor: "#161618",
                  border: "1px solid #ffffff0a",
                  color: "#F8FAFC",
                }}
                className="flex flex-col items-start gap-3 p-5 rounded-2xl hover:border-white transition-all"
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-sm font-medium">{cat.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── FEATURED SKILLS ───── */}
      <section
        style={{ borderTop: "1px solid #ffffff0a" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex items-end justify-between mb-16"
        >
          <div>
            <p
              style={{ color: "#00E5FF" }}
              className="text-xs font-semibold tracking-widest uppercase mb-3"
            >
              Top Rated
            </p>
            <h2
              style={{ color: "#F8FAFC" }}
              className="text-2xl sm:text-4xl font-bold leading-tight"
            >
              Skills developers
              <br />
              trust most
            </h2>
          </div>
          <Link
            to="/catalog"
            style={{ color: "#94A3B8" }}
            className="text-sm font-medium hover:text-white transition-colors hidden sm:block pb-1"
          >
            View all →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredSkills.map((skill, i) => (
            <motion.div
              key={skill.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              whileHover={{ y: -4 }}
              style={{
                backgroundColor: "#161618",
                border: "1px solid #ffffff0a",
              }}
              className="rounded-2xl p-5 flex flex-col gap-4"
            >
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

              <h3
                style={{ color: "#F8FAFC" }}
                className="text-sm font-semibold leading-snug"
              >
                {skill.name}
              </h3>

              <p
                style={{ color: "#94A3B8" }}
                className="text-xs leading-relaxed line-clamp-2 flex-1"
              >
                {skill.short_description}
              </p>

              <div className="flex items-center gap-3">
                <span
                  style={{ color: "#F59E0B" }}
                  className="text-xs font-medium"
                >
                  ★ {skill.rating}
                </span>
                <span style={{ color: "#94A3B8" }} className="text-xs">
                  {skill.downloads} downloads
                </span>
              </div>

              <div
                style={{ backgroundColor: "#ffffff0a" }}
                className="w-full h-px"
              />

              <div className="flex items-center justify-between">
                <span
                  style={{ color: "#00E5FF" }}
                  className="text-sm font-bold"
                >
                  ${skill.price_usdc} USDC
                </span>
                <Link
                  to={`/skills/${skill.id}`}
                  style={{ backgroundColor: "#311B92", color: "#F8FAFC" }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  View
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            to="/catalog"
            style={{ color: "#94A3B8" }}
            className="text-sm font-medium"
          >
            View all skills →
          </Link>
        </div>
      </section>

      {/* ───── BOTTOM CTA ───── */}
      <section
        style={{ borderTop: "1px solid #ffffff0a" }}
        className="w-full py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-7">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ color: "#00E5FF" }}
            className="text-xs font-semibold tracking-widest uppercase"
          >
            For Developers
          </motion.p>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            style={{ color: "#F8FAFC" }}
            className="text-2xl sm:text-4xl font-bold max-w-xl leading-tight"
          >
            Ready to monetize your skills?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={2}
            style={{ color: "#94A3B8" }}
            className="text-sm sm:text-base max-w-lg leading-relaxed"
          >
            List your skill in 2 minutes. Every download pays you instantly in
            USDC directly to your Stellar wallet. No invoices. No waiting.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={3}
          >
            <Link
              to="/list-skill"
              style={{ backgroundColor: "#311B92", color: "#F8FAFC" }}
              className="px-8 py-3.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              List Your Skill
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
