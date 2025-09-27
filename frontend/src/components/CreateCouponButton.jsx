import { useNavigate } from "react-router-dom";

export default function CreateCouponButton() {
  const navigate = useNavigate();

return (
  <button
    onClick={() => navigate("/create-coupon")}
    className="
      px-6 py-2 rounded-lg 
      bg-transparent border border-[#708993] 
      text-[#19183B] font-semibold tracking-wide 
      transition-all duration-200 

      hover:bg-[#19183B] hover:text-[#E7F2EF] 
      hover:border-transparent hover:shadow-lg
    "
  >
    Create Coupon
  </button>
);


}
