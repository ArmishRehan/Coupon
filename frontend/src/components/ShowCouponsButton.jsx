
import { useNavigate } from "react-router-dom";

export default function ShowCouponButton() {
  const navigate = useNavigate();

  return (
    <button
      className="px-5 py-2 rounded-xl bg-[#A594F9] text-white font-medium 
                 hover:bg-[#CDC1FF] hover:text-gray-800 shadow-md transition"
      onClick={() => navigate("/coupons")}
    >
      Show Coupons
    </button>
  );
}
