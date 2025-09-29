import { useNavigate } from "react-router-dom";
    import { Pencil } from 'lucide-react';
export default function EditCouponButton ({ couponId }){

      const navigate = useNavigate();
return (
  <div>
    <Pencil
      size={18} 
      className="text-[#19183B] cursor-pointer transition-colors duration-200 hover:text-[#A1C2BD]"
      onClick={(e) => {
        e.stopPropagation(); 
        navigate(`/edit-coupon/${couponId}`);
      }}
      aria-label="Edit Coupon"
    />
  </div>
);
}