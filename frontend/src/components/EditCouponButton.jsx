import { useNavigate } from "react-router-dom";

export default function EditCouponButton ({ couponId }){

      const navigate = useNavigate();
return (
    <div>
      <button
        className="
          px-4 py-1.5 
          rounded-lg                   // Slightly smaller rounding for integration on a card
          text-sm font-semibold 
          bg-[#A1C2BD]                   // Accent color background
          text-[#19183B]                 // Primary dark text
          border border-transparent 
          shadow-sm transition-all duration-300
          hover:bg-[#708993]             // Muted secondary on hover
          hover:text-white
        "
        onClick={(e) => {
          // Prevents the coupon card click event from firing when clicking the button
          e.stopPropagation(); 
          navigate(`/edit-coupon/${couponId}`);
        }}
      >
        Edit Coupon
      </button>
    </div>
);
}