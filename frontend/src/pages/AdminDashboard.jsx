import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Pencil } from "lucide-react";


export default function AdminDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editingCoupon, setEditingCoupon] = useState(null); // modal state
  const [formData, setFormData] = useState({});

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

  const handleUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const body = { ...formData, status };

      const res = await fetch(`http://localhost:5000/api/coupons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update coupon");

      alert(`Coupon ${status}!`);
      setEditingCoupon(null);
      setFormData({});
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

// filters status
  const filteredCoupons =
    filter === "all" ? coupons : coupons.filter((c) => c.status === filter);

  return (
    <div className="min-h-screen bg-[#E7F2EF] flex flex-col">
      <Navbar />
      <div className="flex-grow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#19183B]">
            All Coupons (Admin)
          </h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white text-[#19183B]"
          >
            <option value="all">All</option>
            <option value="waiting_for_approval">Waiting for Approval</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="used">Used</option>
            <option value="expired">Expired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredCoupons.length === 0 ? (
          <p>No coupons available.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCoupons.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-xl shadow-md border border-[#708993]/30"
              >
                <h3 className="text-lg font-bold text-[#19183B] mb-2">{c.name}</h3>
                <p className="text-sm text-[#708993] mb-1">
                  Discount: {c.discount}%
                </p>
                <p className="text-sm text-[#708993] mb-1">
                  Brand: {c.brandName} | Branch: {c.branchName}
                </p>
                <p className="text-sm text-[#708993] mb-1">
                  Requested by: {c.storeUser || "N/A"}
                </p>
                <p className="text-sm text-[#708993] mb-1">
                  Created by: {c.creator || "N/A"}
                </p>
                <p className="text-xs text-[#708993] mb-2">
                  {new Date(c.valid_from).toLocaleDateString()} -{" "}
                  {new Date(c.valid_to).toLocaleDateString()}
                </p>
                <p className="mt-2 font-medium">
                  Status:{" "}
                  <span className={getStatusColor(c.status)}>{c.status}</span>
                </p>

                <div className="mt-3 flex gap-2">
                  {c.status === "waiting_for_approval" && (
                    <>
                      <button
                        onClick={() => handleUpdate(c.id, "active")}
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
                    </>
                  )}
                  {(c.status === "approved" || c.status === "active") && (
                    <button
                      onClick={() => handleUpdate(c.id, "disabled")}
                      className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Disable
                    </button>
                  )}
                  {c.status === "disabled" && (
                    <button
                      onClick={() => handleUpdate(c.id, "approved")}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Enable
                    </button>
                  )}
                  {c.status !== "expired" && c.status !== "used" && c.status !== "rejected" && (
                    <button
                      onClick={() => {
                        setEditingCoupon(c.id);
                        setFormData({
                          name: c.name,
                          discount: c.discount,
                          validFrom: c.valid_from?.split("T")[0],
                          validTo: c.valid_to?.split("T")[0],
                        });
                      }}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                      title="Edit Coupon"
                    >
                      <Pencil size={16} />
                    </button>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingCoupon && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96">
              <h2 className="text-lg font-bold mb-4">Edit Coupon</h2>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="number"
                value={formData.discount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, discount: e.target.value }))
                }
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, validFrom: e.target.value }))
                }
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="date"
                value={formData.validTo}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, validTo: e.target.value }))
                }
                className="w-full mb-3 p-2 border rounded"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setEditingCoupon(null)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate(editingCoupon, "active")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save & Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
