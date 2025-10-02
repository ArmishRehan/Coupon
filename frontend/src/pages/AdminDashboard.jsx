import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Pencil } from "lucide-react";

export default function AdminDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editingCoupon, setEditingCoupon] = useState(null); 
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
      case "waiting_for_approval": return "text-[var(--color-secondary)]";
      case "active": return "text-[var(--color-primary)]";
      case "disabled": return "text-gray-500";
      case "used": return "text-gray-500";
      case "expired": return "text-gray-600";
      case "rejected": return "text-red-600";
      default: return "text-[var(--color-dark)]";
    }
  };

  const filteredCoupons =
    filter === "all" ? coupons : coupons.filter((c) => c.status === filter);

  return (
    <div className="min-h-screen bg-[var(--color-base)] flex flex-col">
      <Navbar />

      <div className="flex-grow p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)]">
            All Coupons
          </h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white text-[var(--color-dark)] shadow-sm focus:ring-2 focus:ring-[var(--color-contrast)] focus:border-[var(--color-contrast)] w-full sm:w-auto"
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

        {/* Coupons Grid */}
        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : filteredCoupons.length === 0 ? (
          <p className="text-center text-gray-600">No coupons available.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCoupons.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                {/* Info */}
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-primary)] mb-2">
                    {c.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Discount:{" "}
                    <span className="font-medium text-[var(--color-contrast)]">
                      {c.discount}%
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Brand: {c.brandName} | Branch: {c.branchName}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Requested by: {c.storeUser || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Created by: {c.creator || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(c.valid_from).toLocaleDateString()} -{" "}
                    {new Date(c.valid_to).toLocaleDateString()}
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">
                    Status:{" "}
                    <span className={getStatusColor(c.status)}>{c.status}</span>
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {c.status === "waiting_for_approval" && (
                      <>
                        <button
                          onClick={() => handleUpdate(c.id, "active")}
                          className="px-3 py-1 bg-[var(--color-primary)] text-white rounded-lg shadow hover:bg-opacity-90 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdate(c.id, "rejected")}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {(c.status === "approved" || c.status === "active") && (
                      <button
                        onClick={() => handleUpdate(c.id, "disabled")}
                        className="px-3 py-1 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition"
                      >
                        Disable
                      </button>
                    )}
                    {c.status === "disabled" && (
                      <button
                        onClick={() => handleUpdate(c.id, "approved")}
                        className="px-3 py-1 bg-[var(--color-primary)] text-white rounded-lg shadow hover:bg-opacity-90 transition"
                      >
                        Enable
                      </button>
                    )}
                    {c.status !== "expired" &&
                      c.status !== "used" &&
                      c.status !== "rejected" && (
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
                          className="p-2 bg-[var(--color-contrast)] text-[var(--color-dark)] rounded-lg flex items-center justify-center hover:bg-opacity-80 transition"
                          title="Edit Coupon"
                        >
                          <Pencil size={20} />
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingCoupon && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md mx-2">
              <h2 className="text-lg font-bold text-primary mb-4">
                Edit Coupon
              </h2>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full mb-3 p-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-contrast)] focus:border-[var(--color-contrast)]"
              />
              <input
                type="number"
                value={formData.discount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, discount: e.target.value }))
                }
                className="w-full mb-3 p-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-contrast)] focus:border-[var(--color-contrast)]"
              />
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, validFrom: e.target.value }))
                }
                className="w-full mb-3 p-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-contrast)] focus:border-[var(--color-contrast)]"
              />
              <input
                type="date"
                value={formData.validTo}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, validTo: e.target.value }))
                }
                className="w-full mb-3 p-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-contrast)] focus:border-[var(--color-contrast)]"
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
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-opacity-90 shadow-sm"
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
