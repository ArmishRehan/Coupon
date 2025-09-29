import { useNavigate } from "react-router-dom";

export default function CreateCouponButton() {
  const navigate = useNavigate();

return (
  <button
    onClick={() => navigate("/create-coupon")}
    className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-[#A1C2BD] text-[#19183B] border border-transparent 
          shadow-sm transition-all duration-300 hover:bg-[#708993] hover:text-white"
  >
    Create Coupon
  </button>
);


}
