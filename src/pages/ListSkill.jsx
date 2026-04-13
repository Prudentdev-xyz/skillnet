import { useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useWallet } from "../context/WalletContext";
import PageWrapper from "../components/shared/PageWrapper";

export default function ListSkill() {
  const navigate = useNavigate();
  const { walletAddress } = useWallet();

  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    full_description: "",
    category: "",
    price_usdc: "",
    seller_address: walletAddress || "",
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    "Blockchain",
    "Crypto",
    "AI",
    "Web3",
    "Frontend",
    "Backend",
    "Product Design",
    "DeFi",
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith(".zip")) {
      setFile(selected);
      setError(null);
    } else {
      setError("Please upload a .zip file only.");
      setFile(null);
    }
  }

  async function uploadFile() {
    if (!file) return null;

    setUploading(true);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-").toLowerCase()}`;

    const { error: uploadError } = await supabase.storage
      .from("skill-files")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setError("File upload failed. Please try again.");
      setUploading(false);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("skill-files")
      .getPublicUrl(fileName);

    setUploading(false);
    return urlData.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!walletAddress) {
      setError("Please connect your Freighter wallet first.");
      return;
    }

    if (
      !formData.name ||
      !formData.short_description ||
      !formData.full_description ||
      !formData.category ||
      !formData.price_usdc
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!file) {
      setError("Please upload your skill zip file.");
      return;
    }

    setSubmitting(true);

    const fileUrl = await uploadFile();
    if (!fileUrl) {
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/list-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          seller_address: walletAddress,
          price_usdc: parseFloat(formData.price_usdc),
          file_url: fileUrl,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const inputStyle = {
    backgroundColor: "#161618",
    border: "1px solid #ffffff0f",
    color: "#F8FAFC",
    outline: "none",
    width: "100%",
  };

  const labelStyle = {
    color: "#94A3B8",
  };

  return (
    <PageWrapper>
      <div
        style={{ backgroundColor: "#0B0B0C" }}
        className="w-full min-h-screen"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
              Sell Your Work
            </p>
            <h1
              style={{ color: "#F8FAFC" }}
              className="text-3xl sm:text-5xl font-bold leading-tight mb-4"
            >
              List Your Skill
            </h1>
            <p style={{ color: "#94A3B8" }} className="text-sm sm:text-base">
              Fill in the details below. Every download pays you instantly in
              USDC directly to your Stellar wallet.
            </p>
          </motion.div>

          {/* ───── WALLET WARNING ───── */}
          {!walletAddress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                backgroundColor: "#161618",
                border: "1px solid #F59E0B44",
              }}
              className="rounded-xl p-4 mb-8"
            >
              <p style={{ color: "#F59E0B" }} className="text-sm font-medium">
                ⚠ Please connect your Freighter wallet before listing a skill.
                Your wallet address will be used to receive payments.
              </p>
            </motion.div>
          )}

          {/* ───── FORM ───── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-col gap-6">
              {/* Skill Name */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0}
                className="flex flex-col gap-2"
              >
                <label
                  style={labelStyle}
                  className="text-xs font-medium uppercase tracking-wider"
                >
                  Skill Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Live Crypto Price Fetcher"
                  style={inputStyle}
                  className="px-4 py-3 rounded-xl text-sm placeholder:text-[#94A3B8] focus:border-white transition-colors"
                />
              </motion.div>

              {/* Category */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                className="flex flex-col gap-2"
              >
                <label
                  style={labelStyle}
                  className="text-xs font-medium uppercase tracking-wider"
                >
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{ ...inputStyle, appearance: "none" }}
                  className="px-4 py-3 rounded-xl text-sm focus:border-white transition-colors"
                >
                  <option value="" style={{ backgroundColor: "#161618" }}>
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      style={{ backgroundColor: "#161618" }}
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Short Description */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2}
                className="flex flex-col gap-2"
              >
                <label
                  style={labelStyle}
                  className="text-xs font-medium uppercase tracking-wider"
                >
                  Short Description *{" "}
                  <span style={{ color: "#94A3B8" }} className="normal-case">
                    (shown on catalog cards)
                  </span>
                </label>
                <input
                  type="text"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  placeholder="One sentence describing what your skill does"
                  style={inputStyle}
                  className="px-4 py-3 rounded-xl text-sm placeholder:text-[#94A3B8] focus:border-white transition-colors"
                />
              </motion.div>

              {/* Full Description */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3}
                className="flex flex-col gap-2"
              >
                <label
                  style={labelStyle}
                  className="text-xs font-medium uppercase tracking-wider"
                >
                  Full Description *{" "}
                  <span style={{ color: "#94A3B8" }} className="normal-case">
                    (shown on detail page)
                  </span>
                </label>
                <textarea
                  name="full_description"
                  value={formData.full_description}
                  onChange={handleChange}
                  placeholder="Describe what your skill does, how it works, what it returns, and any requirements..."
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical" }}
                  className="px-4 py-3 rounded-xl text-sm placeholder:text-[#94A3B8] focus:border-white transition-colors"
                />
              </motion.div>

              {/* Price */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={4}
                className="flex flex-col gap-2"
              >
                <label
                  style={labelStyle}
                  className="text-xs font-medium uppercase tracking-wider"
                >
                  Price (USDC) *
                </label>
                <div
                  style={{
                    backgroundColor: "#161618",
                    border: "1px solid #ffffff0f",
                  }}
                  className="flex items-center rounded-xl overflow-hidden"
                >
                  <span
                    style={{
                      color: "#00E5FF",
                      borderRight: "1px solid #ffffff0f",
                    }}
                    className="px-4 py-3 text-sm font-bold"
                  >
                    $
                  </span>
                  <input
                    type="number"
                    name="price_usdc"
                    value={formData.price_usdc}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    style={{
                      backgroundColor: "transparent",
                      color: "#F8FAFC",
                      outline: "none",
                      border: "none",
                      width: "100%",
                    }}
                    className="px-4 py-3 text-sm placeholder:text-[#94A3B8]"
                  />
                  <span
                    style={{
                      color: "#94A3B8",
                      borderLeft: "1px solid #ffffff0f",
                    }}
                    className="px-4 py-3 text-xs font-medium"
                  >
                    USDC
                  </span>
                </div>
              </motion.div>

              {/* Wallet Address */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={5}
                className="flex flex-col gap-2"
              >
                <label
                  style={labelStyle}
                  className="text-xs font-medium uppercase tracking-wider"
                >
                  Your Stellar Wallet Address *
                </label>
                <div
                  style={{
                    backgroundColor: "#161618",
                    border: "1px solid #ffffff0f",
                    color: walletAddress ? "#00E5FF" : "#94A3B8",
                  }}
                  className="px-4 py-3 rounded-xl text-sm font-mono"
                >
                  {walletAddress ||
                    "Connect your wallet to auto-fill this field"}
                </div>
                <p style={{ color: "#94A3B8" }} className="text-xs">
                  Payments go directly to this address. Make sure it's correct.
                </p>
              </motion.div>

              {/* File Upload */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={6}
                className="flex flex-col gap-2"
              >
                <label
                  style={labelStyle}
                  className="text-xs font-medium uppercase tracking-wider"
                >
                  Skill File (.zip) *
                </label>
                <label
                  style={{
                    backgroundColor: "#161618",
                    border: `1px dashed ${file ? "#00E5FF" : "#ffffff1a"}`,
                    cursor: "pointer",
                  }}
                  className="flex flex-col items-center justify-center gap-3 px-4 py-8 rounded-xl transition-all hover:border-white"
                >
                  <span className="text-2xl">{file ? "✓" : "📦"}</span>
                  <div className="text-center">
                    <p
                      style={{ color: file ? "#00E5FF" : "#F8FAFC" }}
                      className="text-sm font-medium"
                    >
                      {file
                        ? file.name
                        : "Click to upload your skill .zip file"}
                    </p>
                    <p style={{ color: "#94A3B8" }} className="text-xs mt-1">
                      {file
                        ? `${(file.size / 1024).toFixed(1)} KB`
                        : "Must contain skill.json, index.js, README.md"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </motion.div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    backgroundColor: "#EF444420",
                    border: "1px solid #EF444444",
                  }}
                  className="px-4 py-3 rounded-xl"
                >
                  <p style={{ color: "#EF4444" }} className="text-sm">
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={7}
              >
                <button
                  onClick={handleSubmit}
                  disabled={submitting || uploading || !walletAddress}
                  style={{
                    backgroundColor:
                      submitting || uploading || !walletAddress
                        ? "#161618"
                        : "#311B92",
                    color:
                      submitting || uploading || !walletAddress
                        ? "#94A3B8"
                        : "#F8FAFC",
                    border:
                      submitting || uploading || !walletAddress
                        ? "1px solid #ffffff14"
                        : "none",
                    width: "100%",
                  }}
                  className="py-4 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                >
                  {uploading
                    ? "Uploading file..."
                    : submitting
                      ? "Listing skill..."
                      : "Submit Listing"}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
