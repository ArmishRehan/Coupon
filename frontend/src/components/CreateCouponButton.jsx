import { useNavigate } from "react-router-dom";

export default function CreateCouponButton({ storeUserId, requestId }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() =>
        navigate("/create-coupon", { state: { storeUserId, requestId } })
      }
      className="btn"
    >
      Create Coupon
    </button>
  );
}
