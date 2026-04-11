import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

export default function Catalog() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchParams] = useSearchParams();

  const categories = [
    "All",
    "Blockchain",
    "Crypto",
    "AI",
    "Web3",
    "Frontend",
    "Backend",
    "Product Design",
    "DeFi",
  ];

  useEffect(() => {
    async function fetchSkills() {
      setLoading(true);
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("rating", { ascending: false });

      console.log("data:", data);
      console.log("error:", error);

      if (!error && data) {
        setSkills(data);
      }
      setLoading(false);
    }
    fetchSkills();
  }, []);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setActiveCategory(categoryFromUrl);
    }
  }, [searchParams]); 

  const filtered = useMemo(() => {
    let result = skills;

    if (activeCategory !== "All") {
      result = result.filter((s) => s.category === activeCategory);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.short_description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      );
    }

    return result;
  }, [activeCategory, searchQuery, skills]);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" },
    }),
  };

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
            Marketplace
          </p>
          <h1
            style={{ color: "#F8FAFC" }}
            className="text-3xl sm:text-5xl font-bold leading-tight mb-4"
          >
            Browse Skills
          </h1>
          <p
            style={{ color: "#94A3B8" }}
            className="text-sm sm:text-base max-w-xl"
          >
            {skills.length} skills available across {categories.length - 1}{" "}
            categories. Find the right tool for your agent.
          </p>
        </motion.div>

        {/* ───── SEARCH BAR ───── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div
            style={{
              backgroundColor: "#161618",
              border: "1px solid #ffffff0f",
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full max-w-lg"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: "transparent",
                color: "#F8FAFC",
                outline: "none",
                border: "none",
                width: "100%",
              }}
              className="text-sm placeholder:text-[#94A3B8]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ color: "#94A3B8" }}
                className="text-xs hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>

        {/* ───── CATEGORY FILTER TABS ───── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10 overflow-x-auto"
        >
          <div className="flex items-center gap-2 pb-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  backgroundColor:
                    activeCategory === cat ? "#311B92" : "#161618",
                  color: activeCategory === cat ? "#F8FAFC" : "#94A3B8",
                  border:
                    activeCategory === cat
                      ? "1px solid #311B92"
                      : "1px solid #ffffff0f",
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-all hover:text-white whitespace-nowrap"
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ───── RESULTS COUNT ───── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6"
        >
          <p style={{ color: "#94A3B8" }} className="text-xs">
            {filtered.length} skill{filtered.length !== 1 ? "s" : ""} found
            {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
            {searchQuery ? ` for "${searchQuery}"` : ""}
          </p>
        </motion.div>

        {/* ───── LOADING STATE ───── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#161618",
                  border: "1px solid #ffffff0a",
                }}
                className="rounded-2xl p-5 h-64 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* ───── EMPTY STATE ───── */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <span className="text-4xl">🔍</span>
            <p style={{ color: "#F8FAFC" }} className="text-base font-semibold">
              No skills found
            </p>
            <p
              style={{ color: "#94A3B8" }}
              className="text-sm text-center max-w-xs"
            >
              Try a different search term or browse a different category.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
              style={{
                backgroundColor: "#311B92",
                color: "#F8FAFC",
              }}
              className="mt-2 px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* ───── SKILL CARDS GRID ───── */}
        {!loading && filtered.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filtered.map((skill, i) => (
                <motion.div
                  key={skill.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  whileHover={{ y: -4 }}
                  style={{
                    backgroundColor: "#161618",
                    border: "1px solid #ffffff0a",
                  }}
                  className="rounded-2xl p-5 flex flex-col gap-4"
                >
                  {/* Top row — category + rating */}
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        backgroundColor: "#0B0B0C",
                        color: "#94A3B8",
                        border: "1px solid #ffffff0f",
                      }}
                      className="text-xs font-medium px-2 py-1 rounded-md"
                    >
                      {skill.category}
                    </span>
                    <span
                      style={{ color: "#F59E0B" }}
                      className="text-xs font-medium"
                    >
                      ★ {skill.rating}
                    </span>
                  </div>

                  {/* Skill name */}
                  <h3
                    style={{ color: "#F8FAFC" }}
                    className="text-sm font-semibold leading-snug"
                  >
                    {skill.name}
                  </h3>

                  {/* Description */}
                  <p
                    style={{ color: "#94A3B8" }}
                    className="text-xs leading-relaxed line-clamp-3 flex-1"
                  >
                    {skill.short_description}
                  </p>

                  {/* Downloads */}
                  <p style={{ color: "#94A3B8" }} className="text-xs">
                    {skill.downloads.toLocaleString()} downloads
                  </p>

                  {/* Divider */}
                  <div
                    style={{ backgroundColor: "#ffffff0a" }}
                    className="w-full h-px"
                  />

                  {/* Price */}
                  <span
                    style={{ color: "#00E5FF" }}
                    className="text-sm font-bold"
                  >
                    ${skill.price_usdc} USDC
                  </span>

                  {/* Two Buttons */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/skills/${skill.id}`}
                      style={{
                        backgroundColor: "transparent",
                        color: "#F8FAFC",
                        border: "1px solid #ffffff18",
                      }}
                      className="flex-1 text-xs font-semibold py-2 rounded-lg text-center hover:border-white transition-all"
                    >
                      View Details
                    </Link>
                    <button
                      style={{
                        backgroundColor: "#311B92",
                        color: "#F8FAFC",
                        border: "none",
                      }}
                      className="flex-1 text-xs font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Buy Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
