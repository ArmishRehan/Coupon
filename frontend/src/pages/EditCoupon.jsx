import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function EditCoupon() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState(null);

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

  const updatedCoupon = {
    name: coupon.name,
    discount: Number(coupon.discount),
    valid_from: coupon.valid_from,
    valid_to: coupon.valid_to,
    status: newStatus || coupon.status,
  };

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
    navigate("/Admin-dashboard");
  } catch (err) {
    console.error("Update error:", err);
    alert("Error updating coupon");
  }
};


  if (loading) return <p className="text-center mt-6">Loading coupon...</p>;
  if (!coupon) return <p className="text-center mt-6">Coupon not found</p>;

  const displayStatus = newStatus || coupon.status;

return (
  <div className="min-h-screen bg-[#E7F2EF] flex flex-col">
    <Navbar />

    <div className="flex-grow flex items-center justify-center px-4 py-8"> 

      <div className="w-full max-w-4xl p-8 bg-white shadow-xl rounded-2xl border-t-4 border-[#A1C2BD]">

        <h2 className="text-2xl font-bold mb-6 text-[#19183B] text-center">
          Edit Coupon
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> 

          <div>
            <label className="block text-sm font-medium text-[#708993] mb-1">Name</label>
            <input
              type="text"
              value={coupon.name}
              onChange={(e) => setCoupon({ ...coupon, name: e.target.value })}
              className="mt-1 block w-full p-2.5 border border-[#708993]/50 rounded-xl shadow-sm
                        text-[#19183B] focus:border-[#A1C2BD] focus:ring focus:ring-[#A1C2BD]/50 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#708993] mb-1">Discount %</label>
            <input
              type="number"
              value={coupon.discount}
              onChange={(e) => setCoupon({ ...coupon, discount: e.target.value })}
              className="mt-1 block w-full p-2.5 border border-[#708993]/50 rounded-xl shadow-sm
                        text-[#19183B] focus:border-[#A1C2BD] focus:ring focus:ring-[#A1C2BD]/50 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#708993] mb-1">Valid From</label>
            <input
              type="date"
              value={coupon.valid_from?.split("T")[0] || ""}
              onChange={(e) => setCoupon({ ...coupon, valid_from: e.target.value })}
              className="mt-1 block w-full p-2.5 border border-[#708993]/50 rounded-xl shadow-sm
                        text-[#19183B] focus:border-[#A1C2BD] focus:ring focus:ring-[#A1C2BD]/50 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#708993] mb-1">Valid To</label>
            <input
              type="date"
              value={coupon.valid_to?.split("T")[0] || ""}
              onChange={(e) => setCoupon({ ...coupon, valid_to: e.target.value })}
              className="mt-1 block w-full p-2.5 border border-[#708993]/50 rounded-xl shadow-sm
                        text-[#19183B] focus:border-[#A1C2BD] focus:ring focus:ring-[#A1C2BD]/50 transition"
            />
          </div>

          <div className="lg:col-span-2">
            {coupon.status !== "expired" && (
              <button
                onClick={() =>
                  setNewStatus(displayStatus === "pending" ? "disabled" : "pending")
                }
                className={`px-4 py-2 font-medium rounded-lg text-[#19183B] transition-colors ${
                  displayStatus === "pending"
                    ? "bg-[#19183B]/20 hover:bg-[#19183B]/30"
                    : "bg-[#A1C2BD] hover:bg-[#708993]"
                }`}
              >
                {displayStatus === "pending" ? "Disable Coupon" : "Enable Coupon"}
              </button>
            )}
          </div>

          <div className="lg:col-span-2">
            <button
              onClick={handleSave}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl 
                         shadow-md text-lg font-semibold text-[#19183B] bg-[#A1C2BD] 
                         hover:bg-[#708993] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-[#A1C2BD] transition duration-150 ease-in-out"
            >
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
);
}
