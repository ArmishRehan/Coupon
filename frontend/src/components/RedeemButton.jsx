import { useState } from "react";

export default function RedeemButton({ couponId, currentStatus, onRedeem }) {
  const [loading, setLoading] = useState(false);
  if (currentStatus === "used") {
    return (
      <p className="mt-4 text-red-600 font-semibold text-center">
        ✅ Already Redeemed
      </p>
    );
  }

return (
  <button
    disabled={loading}
    className="
      mt-4 w-full 
      px-6 py-2 
      rounded-lg 
      text-sm font-semibold tracking-wider
      bg-[#A1C2BD]                   // Accent color background
      text-[#19183B]                 // Primary dark text
      border border-transparent 
      transition-all duration-300 
      shadow-sm
      hover:bg-[#708993]             // Muted secondary on hover
      hover:text-white
      disabled:opacity-50 
      disabled:cursor-not-allowed
    "
    onClick={async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          `http://localhost:5000/api/coupons/${couponId}/redeem`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          // Success callback (updates local state/UI)
          onRedeem(); 
        } else {
          // Display the server message or a default error
          alert(data.msg || "Error redeeming coupon");
        }
      } catch (err) {
        console.error("Error redeeming coupon:", err);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    }} 
    
  >
    {loading ? "Redeeming..." : "Redeem Coupon"}
  </button>
);
}
