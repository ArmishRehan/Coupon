import { useNavigate } from "react-router-dom";

export default function CreateCouponButton({ storeUserId, requestId }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() =>
        navigate("/create-coupon", { state: { storeUserId, requestId } })
      }
      className="mt-3 px-4 py-2 bg-[#19183B] text-white rounded-lg shadow hover:bg-[#A1C2BD] hover:text-gray-900 transition"
    >
      Create Coupon
    </button>
  );
}
