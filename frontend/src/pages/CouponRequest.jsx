import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function CouponRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "creator") {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/api/coupons?status=requested", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching requests:", err);
        setLoading(false);
      });
  }, [navigate]);

  const handleCreateCoupon = async (reqId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/coupons/${reqId}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "waiting_for_approval",
        }),
      });

      if (res.ok) {
        alert("Coupon created and sent for admin approval!");
        setRequests((prev) => prev.filter((r) => r.id !== reqId)); // remove from list
      } else {
        alert("Failed to create coupon");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-6">Loading requests...</p>;

  return (
    <div className="min-h-screen bg-[#E7F2EF]">

      <div className="max-w-5xl mx-auto p-8">
        <h2 className="text-3xl font-light mb-6 text-[#19183B]">
          <span className="font-semibold">Coupon</span> Requests
        </h2>

        {requests.length === 0 ? (
          <p className="text-[#708993]">No requests found.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex justify-between items-center p-4 bg-white rounded-lg border border-[#708993]/30 shadow-sm"
              >
                <div>
                  <p className="font-semibold">{req.name}</p>
                  <p className="text-sm text-[#708993]">
                    Store User ID: {req.store_user_id} | Discount: {req.discount}%
                  </p>
                  <p className="text-xs text-[#708993]">
                    Valid: {req.valid_from} → {req.valid_to}
                  </p>
                </div>
                <button
                  onClick={() => handleCreateCoupon(req.id)}
                  className="px-4 py-2 rounded-lg bg-[#19183B] text-white text-sm hover:bg-[#A1C2BD] hover:text-[#19183B] transition"
                >
                  Create Coupon
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
