import { useState } from "react";
import { usePayment } from "../../hooks/usePayment";
import { useWallet } from "../../context/WalletContext";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function BuyButton({ skill, className }) {
  const { walletAddress } = useWallet();
  const { paying, paymentError, paymentSuccess, initiatePayment } =
    usePayment();
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleBuy() {
    if (!walletAddress) {
      alert("Please connect your Freighter wallet first.");
      return;
    }

    const downloadUrl = await initiatePayment(skill);

    if (downloadUrl) {
      setShowSuccess(true);
      // Trigger file download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${skill.name.replace(/\s+/g, "-").toLowerCase()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setShowSuccess(false), 5000);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  }

  if (showSuccess) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          backgroundColor: "#0B0B0C",
          color: "#00E5FF",
          border: "1px solid #00E5FF",
        }}
        className={`text-xs font-semibold py-2 px-2 rounded-lg transition-all ${className}`}
      >
        Download Complete
      </motion.button>
    );
  }

  if (showError) {
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={handleBuy}
          style={{
            backgroundColor: "#EF4444",
            color: "#F8FAFC",
            border: "none",
          }}
          className={`text-xs font-semibold py-2 rounded-lg ${className}`}
        >
          Retry Payment
        </button>
        {paymentError && (
          <p style={{ color: "#EF4444" }} className="text-xs">
            {paymentError}
          </p>
        )}
      </div>
    );
  }

  return (
    <motion.button
      onClick={handleBuy}
      disabled={paying}
      whileHover={{ scale: paying ? 1 : 1.02 }}
      whileTap={{ scale: paying ? 1 : 0.97 }}
      style={{
        backgroundColor: paying ? "#161618" : "#311B92",
        color: paying ? "#94A3B8" : "#F8FAFC",
        border: paying ? "1px solid #ffffff14" : "none",
        opacity: paying ? 0.8 : 1,
      }}
      className={`text-xs font-semibold py-2 rounded-lg transition-colors ${className}`}
    >
      {paying ? "Processing..." : "Buy Now"}
    </motion.button>
  );
}
