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
      className="btn-purple mt-4 w-full disabled:opacity-50"
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
            onRedeem(); 
          } else {
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
