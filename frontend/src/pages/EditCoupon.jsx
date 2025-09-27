import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditCoupon() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState(null); // temporary status until save

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:5000/api/coupons/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCoupon(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching coupon:", err);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    // Merge newStatus if set, otherwise keep original
    const updatedCoupon = {
      ...coupon,
      status: newStatus || coupon.status,
    };

    console.log("Sending coupon data:", updatedCoupon);

    try {
      const res = await fetch(`http://localhost:5000/api/coupons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedCoupon),
      });

      const data = await res.json();
      console.log("Update response:", data);

      if (!res.ok) throw new Error(data.msg || "Failed to update coupon");

      alert("Coupon updated successfully!");
      navigate("/Admin-Coupons");
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating coupon");
    }
  };

  if (loading) return <p className="text-center mt-6">Loading coupon...</p>;
  if (!coupon) return <p className="text-center mt-6">Coupon not found</p>;

  // Decide what status to show in UI
  const displayStatus = newStatus || coupon.status;

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Edit Coupon</h2>

      <label className="block mb-2 font-medium">Name</label>
      <input
        type="text"
        value={coupon.name}
        onChange={(e) => setCoupon({ ...coupon, name: e.target.value })}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 font-medium">Discount %</label>
      <input
        type="number"
        value={coupon.discount}
        onChange={(e) => setCoupon({ ...coupon, discount: e.target.value })}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 font-medium">Valid From</label>
      <input
        type="date"
        value={coupon.valid_from?.split("T")[0] || ""}
        onChange={(e) => setCoupon({ ...coupon, valid_from: e.target.value })}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 font-medium">Valid To</label>
      <input
        type="date"
        value={coupon.valid_to?.split("T")[0] || ""}
        onChange={(e) => setCoupon({ ...coupon, valid_to: e.target.value })}
        className="w-full p-2 border rounded mb-4"
      />

      {/* Show enable/disable toggle only if coupon is not expired */}
      {coupon.status !== "expired" && (
        <button
          onClick={() =>
            setNewStatus(displayStatus === "pending" ? "disabled" : "pending")
          }
          className={`mb-4 px-4 py-2 rounded text-white ${
            displayStatus === "pending"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {displayStatus === "pending" ? "Disable Coupon" : "Enable Coupon"}
        </button>
      )}

      {/* Save button should ALWAYS be visible */}
      <button
        onClick={handleSave}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  );
}
