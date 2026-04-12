import { useState } from "react";
import { usePayment } from "../../hooks/usePayment";
import { useWallet } from "../../context/WalletContext";

export default function BuyButton({ skill, className }) {
  const { walletAddress } = useWallet();
  const { paying, paymentError, paymentSuccess, initiatePayment } = usePayment();
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
      <button
        style={{
          backgroundColor: "#0B0B0C",
          color: "#00E5FF",
          border: "1px solid #00E5FF",
        }}
        className={`text-xs font-semibold py-2 rounded-lg transition-all ${className}`}
      >
        ✓ Downloaded!
      </button>
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
    <button
      onClick={handleBuy}
      disabled={paying}
      style={{
        backgroundColor: paying ? "#161618" : "#311B92",
        color: paying ? "#94A3B8" : "#F8FAFC",
        border: paying ? "1px solid #ffffff14" : "none",
        opacity: paying ? 0.8 : 1,
      }}
      className={`text-xs font-semibold py-2 rounded-lg hover:opacity-90 transition-all ${className}`}
    >
      {paying ? "Processing..." : "Buy Now"}
    </button>
  );
}