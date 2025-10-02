import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Pencil, Ban, CircleX, Play } from "lucide-react";

export default function AdminDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
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
      // merge edits into approval
      const body =
        status === "active"
          ? { ...formData, status }
          : { status };

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
      setSelectedCoupon(null);
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
      case "waiting_for_approval":
        return "text-waiting";
      case "active":
        return "text-active";
      case "disabled":
        return "text-disabled";
      case "used":
        return "text-used";
      case "expired":
        return "text-expired";
      case "rejected":
        return "text-rejected";
      default:
        return "text-dark";
    }
  };

  const filteredCoupons =
    filter === "all" ? coupons : coupons.filter((c) => c.status === filter);

  const waitingCoupons = coupons.filter(
    (c) => c.status === "waiting_for_approval"
  );
  const historyCoupons = coupons.filter(
    (c) => c.status !== "waiting_for_approval"
  );

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <Navbar />

      <div className="flex-grow max-w-6xl mx-auto p-6 w-full">
        
        

        {/* Waiting for Approval */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Waiting for Approval
          </h2>
          <AnimatePresence>
            {waitingCoupons.length === 0 ? (
              <motion.p
                key="empty"
                className="text-light text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No coupons waiting for approval.
              </motion.p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {waitingCoupons.map((c) => (
                  <motion.div
                    key={c.id}
                    className="bg-white p-5 rounded-2xl shadow-md border border-secondary/30 cursor-pointer hover:shadow-xl transition"
                    onClick={() => setSelectedCoupon(c)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {c.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      Discount:{" "}
                      <span className="font-medium text-contrast">
                        {c.discount}%
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Brand: {c.brandName} | Branch: {c.branchName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Requested by: {c.storeUser || "N/A"}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Coupon History */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-3xl font-light text-primary">
            <span className="font-semibold">Coupon </span>History
          </h2>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-secondary/50 rounded-xl bg-base text-primary focus:ring-2 focus:ring-contrast focus:outline-none"
          >
            <option value="all">All</option>
            <option value="waiting_for_approval">Waiting for Approval</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>


          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : historyCoupons.length === 0 ? (
            <p className="text-center text-gray-600">No coupons available.</p>
          ) : (
            <div className="bg-white/70 border border-secondary/40 rounded-2xl shadow-md overflow-hidden">
              <ul className="divide-y divide-secondary/30">
                {filteredCoupons.map((c) => (
                  <li
                    key={c.id}
                    className="p-5 hover:bg-contrast/10 transition cursor-pointer flex justify-between items-center"
                    onClick={() => setSelectedCoupon(c)}
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-primary">
                        {c.name}
                      </h3>
                      <p className="text-sm text-light">
                        Requested By: {c.storeUser}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-medium ${getStatusColor(
                        c.status
                      )}`}
                    >
                      {c.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Coupon Modal */}

<AnimatePresence>
  {selectedCoupon && (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-dashed border-secondary/70 shadow-2xl p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            setSelectedCoupon(null);
            setEditingCoupon(null);
            setFormData({});
          }}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-secondary/20 hover:bg-secondary/40 transition text-dark"
        >
          <CircleX size={20} />
        </button>

        {/* Content */}
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold text-primary">
            {editingCoupon === selectedCoupon.id ? "Edit Coupon" : selectedCoupon.name}
          </h3>

          {!editingCoupon && (
            <motion.div
              className="mx-auto bg-contrast text-dark font-bold text-lg px-6 py-2 rounded-full shadow-md mb-6 w-max"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              {selectedCoupon.discount}% OFF
            </motion.div>
          )}

          {/* Edit Form */}
          {editingCoupon === selectedCoupon.id ? (
            <div className="mt-4 space-y-3 text-left">
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Coupon Name"
                className="mt-1 block w-full px-4 py-2 border border-secondary/50 
                 rounded-lg text-sm font-semibold text-light focus:ring-2 focus:ring-contrast focus:outline-none transition"
              />
              <input
                type="number"
                value={formData.discount || ""}
                onChange={(e) =>
                  setFormData({ ...formData, discount: e.target.value })
                }
                placeholder="Discount %"
                className="mt-1 block w-full px-4 py-2 border border-secondary/50 
                 rounded-lg text-sm font-semibold text-light focus:ring-2 focus:ring-contrast focus:outline-none transition"
              />
              <div className="flex gap-3">
                <input
                  type="date"
                  value={formData.valid_from || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      valid_from: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-4 py-2 border border-secondary/50 
                 rounded-lg text-sm font-semibold text-light focus:ring-2 focus:ring-contrast focus:outline-none transition"
                />
                <input
                  type="date"
                  value={formData.valid_to || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      valid_to: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-4 py-2 border border-secondary/50 
                 rounded-lg text-sm font-semibold text-light focus:ring-2 focus:ring-contrast focus:outline-none transition"
                />
              </div>

              {/* Save & Cancel buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setEditingCoupon(null);
                    setFormData({});
                  }}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleUpdate(selectedCoupon.id, selectedCoupon.status); // Save only
                    setEditingCoupon(null);
                  }}
                  className="btn"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-light">
                Brand: {selectedCoupon.brandName} | Branch:{" "}
                {selectedCoupon.branchName}
              </p>
              <p className="text-sm text-light">
                Status:{" "}
                <span className={getStatusColor(selectedCoupon.status)}>
                  {selectedCoupon.status}
                </span>
              </p>
              <p className="text-sm font-bold text-light">
                Validity:{" "}
                {new Date(selectedCoupon.valid_from).toLocaleDateString()} –{" "}
                {new Date(selectedCoupon.valid_to).toLocaleDateString()}
              </p>
            </>
          )}

          {/* Actions */}
          {!editingCoupon && (
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {selectedCoupon.status === "waiting_for_approval" && (
                <>
                  <button
                    onClick={() => handleUpdate(selectedCoupon.id, "active")}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700"
                  >
                    <Check size={18} /> Approve
                  </button>
                  <button
                    onClick={() => handleUpdate(selectedCoupon.id, "rejected")}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700"
                  >
                    <X size={18} /> Reject
                  </button>
                </>
              )}

              {(selectedCoupon.status === "active" ||
                selectedCoupon.status === "waiting_for_approval") && (
                <button
                  onClick={() => {
                    setEditingCoupon(selectedCoupon.id);
                    setFormData({
                      name: selectedCoupon.name,
                      discount: selectedCoupon.discount,
                      valid_from: selectedCoupon.valid_from?.split("T")[0],
                      valid_to: selectedCoupon.valid_to?.split("T")[0],
                    });
                  }}
                  className="px-3 py-2 bg-contrast text-dark rounded-lg flex items-center gap-2 hover:bg-opacity-80"
                >
                  <Pencil size={18} /> Edit
                </button>
              )}

              {selectedCoupon.status === "active" && (
                <button
                  onClick={() => handleUpdate(selectedCoupon.id, "disabled")}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg flex items-center gap-2 hover:bg-gray-700"
                >
                  <Ban size={18} /> Disable
                </button>
              )}

              {selectedCoupon.status === "disabled" && (
                <button
                  onClick={() => handleUpdate(selectedCoupon.id, "active")}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700"
                >
                  <Play size={18} /> Enable
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
}
