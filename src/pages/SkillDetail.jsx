import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import BuyButton from "../components/shared/BuyButton";
import { supabase } from "../lib/supabase";

export default function SkillDetail() {
  const { id } = useParams();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchSkill() {
      setLoading(true);
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setSkill(data);
      }
      setLoading(false);
    }
    fetchSkill();
  }, [id]);

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div
        style={{ backgroundColor: "#0B0B0C" }}
        className="w-full min-h-screen flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div
            style={{ borderColor: "#311B92" }}
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          />
          <p style={{ color: "#94A3B8" }} className="text-sm">
            Loading skill...
          </p>
        </div>
      </div>
    );
  }

  // ── NOT FOUND STATE ──
  if (notFound) {
    return (
      <div
        style={{ backgroundColor: "#0B0B0C" }}
        className="w-full min-h-screen flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4">
          <span className="text-4xl">🔍</span>
          <p style={{ color: "#F8FAFC" }} className="text-lg font-semibold">
            Skill not found
          </p>
          <p style={{ color: "#94A3B8" }} className="text-sm">
            This skill may have been removed or the link is incorrect.
          </p>
          <Link
            to="/catalog"
            style={{ backgroundColor: "#311B92", color: "#F8FAFC" }}
            className="mt-2 px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#0B0B0C" }} className="w-full min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ── BACK BUTTON ── */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-10"
        >
          <Link
            to="/catalog"
            style={{ color: "#94A3B8" }}
            className="flex items-center gap-2 text-sm hover:text-white transition-colors w-fit"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Catalog
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT COLUMN — Main info ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            {/* Category + Rating */}
            <div className="flex items-center gap-3">
              <span
                style={{
                  backgroundColor: "#161618",
                  color: "#94A3B8",
                  border: "1px solid #ffffff0f",
                }}
                className="text-xs font-medium px-3 py-1 rounded-md"
              >
                {skill.category}
              </span>
              <span
                style={{ color: "#F59E0B" }}
                className="text-xs font-medium"
              >
                ★ {skill.rating}
              </span>
              <span style={{ color: "#94A3B8" }} className="text-xs">
                {skill.downloads.toLocaleString()} downloads
              </span>
            </div>

            {/* Skill Name */}
            <h1
              style={{ color: "#F8FAFC" }}
              className="text-3xl sm:text-4xl font-bold leading-tight"
            >
              {skill.name}
            </h1>

            {/* Short Description */}
            <p
              style={{ color: "#94A3B8" }}
              className="text-base leading-relaxed"
            >
              {skill.short_description}
            </p>

            {/* Divider */}
            <div
              style={{ backgroundColor: "#ffffff0a" }}
              className="w-full h-px"
            />

            {/* Full Description */}
            <div className="flex flex-col gap-3">
              <h2
                style={{ color: "#F8FAFC" }}
                className="text-base font-semibold"
              >
                About this skill
              </h2>
              <p
                style={{ color: "#94A3B8" }}
                className="text-sm leading-relaxed"
              >
                {skill.full_description}
              </p>
            </div>

            {/* Divider */}
            <div
              style={{ backgroundColor: "#ffffff0a" }}
              className="w-full h-px"
            />

            {/* File Structure */}
            <div className="flex flex-col gap-3">
              <h2
                style={{ color: "#F8FAFC" }}
                className="text-base font-semibold"
              >
                What you get
              </h2>
              <div
                style={{
                  backgroundColor: "#161618",
                  border: "1px solid #ffffff0a",
                }}
                className="rounded-xl p-4 flex flex-col gap-3"
              >
                {[
                  {
                    file: "skill.json",
                    desc: "Skill manifest — name, version, category, metadata",
                  },
                  {
                    file: "index.js",
                    desc: "The skill logic — ready to plug into your agent",
                  },
                  {
                    file: "README.md",
                    desc: "How to install and use this skill",
                  },
                  {
                    file: "example.js",
                    desc: "Usage example — copy and run immediately",
                  },
                ].map((item) => (
                  <div key={item.file} className="flex items-start gap-3">
                    <span
                      style={{
                        backgroundColor: "#0B0B0C",
                        color: "#00E5FF",
                        border: "1px solid #ffffff0f",
                      }}
                      className="text-xs font-mono px-2 py-0.5 rounded mt-0.5 whitespace-nowrap"
                    >
                      {item.file}
                    </span>
                    <span
                      style={{ color: "#94A3B8" }}
                      className="text-xs leading-relaxed"
                    >
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller Address */}
            <div className="flex flex-col gap-2">
              <h2
                style={{ color: "#F8FAFC" }}
                className="text-base font-semibold"
              >
                Seller
              </h2>
              <div className="flex items-center gap-2">
                <div
                  style={{
                    backgroundColor: "#311B92",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                  }}
                  className="flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F8FAFC"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span
                  style={{ color: "#94A3B8" }}
                  className="text-xs font-mono"
                >
                  {skill.seller_address.slice(0, 6)}...
                  {skill.seller_address.slice(-6)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT COLUMN — Purchase card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-1"
          >
            <div
              style={{
                backgroundColor: "#161618",
                border: "1px solid #ffffff0a",
                position: "sticky",
                top: "6rem",
              }}
              className="rounded-2xl p-6 flex flex-col gap-5"
            >
              {/* Price */}
              <div className="flex flex-col gap-1">
                <p style={{ color: "#94A3B8" }} className="text-xs">
                  Price
                </p>
                <p style={{ color: "#00E5FF" }} className="text-3xl font-bold">
                  ${skill.price_usdc}
                  <span
                    style={{ color: "#94A3B8" }}
                    className="text-sm font-normal ml-1"
                  >
                    USDC
                  </span>
                </p>
              </div>

              {/* Divider */}
              <div
                style={{ backgroundColor: "#ffffff0a" }}
                className="w-full h-px"
              />

              {/* Stats */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span style={{ color: "#94A3B8" }} className="text-xs">
                    Rating
                  </span>
                  <span
                    style={{ color: "#F59E0B" }}
                    className="text-xs font-medium"
                  >
                    ★ {skill.rating} / 5.0
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "#94A3B8" }} className="text-xs">
                    Downloads
                  </span>
                  <span
                    style={{ color: "#F8FAFC" }}
                    className="text-xs font-medium"
                  >
                    {skill.downloads.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "#94A3B8" }} className="text-xs">
                    Category
                  </span>
                  <span
                    style={{ color: "#F8FAFC" }}
                    className="text-xs font-medium"
                  >
                    {skill.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "#94A3B8" }} className="text-xs">
                    Payment
                  </span>
                  <span
                    style={{ color: "#00E5FF" }}
                    className="text-xs font-medium"
                  >
                    USDC on Stellar
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div
                style={{ backgroundColor: "#ffffff0a" }}
                className="w-full h-px"
              />

              {/* Download Button */}
              <BuyButton skill={skill} className="w-full px-6" />

              {/* Info note */}
              <p
                style={{ color: "#94A3B8" }}
                className="text-xs text-center leading-relaxed"
              >
                Payment settles on Stellar in ~5 seconds. You receive a .zip
                file instantly after confirmation.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
