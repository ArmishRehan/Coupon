import { useNavigate } from "react-router-dom";

export default function CouponButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/create-coupon")}
      className="px-5 py-2 rounded-xl bg-[#A594F9] text-white font-medium 
                 hover:bg-[#CDC1FF] hover:text-gray-800 shadow-md transition"
    >
      Create Coupon
    </button>
  );
}
