import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CreateCouponButton from "../components/CreateCouponButton";
import { motion, AnimatePresence } from "framer-motion";
import { CircleX } from 'lucide-react';

export default function CreatorDashboard() {
  const [requests, setRequests] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const fetchRequests = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/coupons/request/creator", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setRequests(data.filter((r) => r.status === "requested"));
    }
  };

  const fetchCoupons = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/coupons/creator", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCoupons(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    fetchCoupons();
  }, []);

  if (loading) return <p className="text-center mt-6">Loading dashboard...</p>;

  const filteredCoupons =
    filter === "all" ? coupons : coupons.filter((c) => c.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting_for_approval": return "text-waiting";
      case "active": return "text-active";
      case "disabled": return "text-disabled";
      case "used": return "text-used";
      case "expired": return "text-expired";
      case "rejected": return "text-rejected";
      default: return "text-light";
    }
  };

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-6xl mx-auto p-8 w-full">
        {/* Store User Requests */}
        
        <h2 className="text-3xl font-light mb-6 text-primary">
          <span className="font-semibold">Coupon</span> Requests
        </h2>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-light rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm mb-10">
            <p className="text-center text-primary text-lg">No requests found.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {requests.map((r) => (
              <li
                key={r.id}
                className="p-6 bg-white rounded-2xl border border-secondary/40 shadow-md hover:shadow-lg hover:border-secondary/70 transition"
              >
                <h3 className="text-xl font-semibold text-primary mb-2">{r.name}</h3>
                <p className="text-sm text-light mb-1">
                  Requested by: {r.store_username}
                </p>
                <p className="text-sm text-light mb-1">Status: {r.status}</p>
                <p className="text-xs text-light mb-3">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
                <CreateCouponButton
                  storeUserId={r.store_user_id}
                  requestId={r.request_id}
                />
              </li>
            ))}
          </ul>
        )}

        {/* My Coupons */}
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

        {filteredCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-secondary rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm">
            <p className="text-center text-primary text-lg">
              No coupons match this filter.
            </p>
          </div>
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
                    <h3 className="text-lg font-semibold text-primary">{c.name}</h3>
                    <p className="text-sm text-light">
                      Requested By: {c.storeUser}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
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
                onClick={() => setSelectedCoupon(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-secondary/20 hover:bg-secondary/40 transition text-dark"
              >
                <CircleX size={20} />
              </button>


              {/* Coupon Content */}
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-primary">
                  {selectedCoupon.name}
                </h3>
                {/* Discount Badge */}
                <motion.div
                  className="sticky top-0 mx-auto bg-contrast text-dark font-bold text-lg px-6 py-2 rounded-full shadow-md mb-6 w-max"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                >
                  {selectedCoupon.discount}% OFF
                </motion.div>
                <p className="text-sm text-light">
                  Brand: {selectedCoupon.brandName} | Branch: {selectedCoupon.branchName}
                </p>

                <p className="text-sm text-light">
                  Requested by: {selectedCoupon.storeUser || "N/A"}
                </p>

                <p className="text-sm text-light">
                  Status:{" "}
                  <span className={getStatusColor(selectedCoupon.status)}>
                    {selectedCoupon.status}
                    
                  </span>
                </p>

                <p className="text-sm font-bold text-light">
                  Validity: {new Date(selectedCoupon.valid_from).toLocaleDateString()} –{" "}
                  {new Date(selectedCoupon.valid_to).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
