import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedCoupons, setEditedCoupons] = useState({});

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/coupons/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (id, field, value) => {
    setEditedCoupons((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const body = { ...editedCoupons[id] };
      if (status) body.status = status;

      const res = await fetch(`http://localhost:5000/api/coupons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update coupon");

      alert("Coupon updated!");
      setEditedCoupons((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      fetchCoupons();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Server error");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting_for_approval": return "text-yellow-600";
      case "approved": return "text-green-600";
      case "active": return "text-blue-600";
      case "disabled": return "text-gray-500";
      case "used": return "text-gray-600";
      case "expired": return "text-red-500";
      case "rejected": return "text-red-600";
      default: return "text-black";
    }
  };

  return (
    <div className="min-h-screen bg-[#E7F2EF] flex flex-col">
      <Navbar />
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-4 text-[#19183B]">
          All Coupons (Admin)
        </h1>

        {loading ? (
          <p>Loading...</p>
        ) : coupons.length === 0 ? (
          <p>No coupons available.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coupons.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded-xl shadow-md border border-[#708993]/30">
                {/* Editable fields */}
                <input
                  type="text"
                  defaultValue={c.name}
                  onChange={(e) => handleEditChange(c.id, "name", e.target.value)}
                  className="w-full mb-2 p-2 border rounded"
                />

                <input
                  type="number"
                  defaultValue={c.discount}
                  onChange={(e) => handleEditChange(c.id, "discount", e.target.value)}
                  className="w-full mb-2 p-2 border rounded"
                />

                <input
                  type="date"
                  defaultValue={c.valid_from?.split("T")[0]}
                  onChange={(e) => handleEditChange(c.id, "validFrom", e.target.value)}
                  className="w-full mb-2 p-2 border rounded"
                />

                <input
                  type="date"
                  defaultValue={c.valid_to?.split("T")[0]}
                  onChange={(e) => handleEditChange(c.id, "validTo", e.target.value)}
                  className="w-full mb-2 p-2 border rounded"
                />

                <p className="mt-2 font-medium">
                  Status: <span className={getStatusColor(c.status)}>{c.status}</span>
                </p>

                {/* Buttons */}
                {c.status === "waiting_for_approval" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleUpdate(c.id, "approved")}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdate(c.id, "rejected")}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {(c.status === "approved" || c.status === "active") && (
                  <button
                    onClick={() => handleUpdate(c.id, "disabled")}
                    className="mt-3 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Disable
                  </button>
                )}

                {c.status === "disabled" && (
                  <button
                    onClick={() => handleUpdate(c.id, "approved")}
                    className="mt-3 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Enable
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={fetchCoupons}
          className="mt-6 px-4 py-2 bg-[#A1C2BD] text-white rounded-xl hover:bg-[#708993] transition"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
