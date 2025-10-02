import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CircleX } from "lucide-react";

export default function StoreUserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [requestedCoupons, setRequestedCoupons] = useState([]);
  const [filter, setFilter] = useState("active");
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Check login role
  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (!loggedUser || loggedUser.role !== "store user") {
      navigate("/login");
    } else {
      setUser(loggedUser);
      fetchCoupons();
      fetchRequestedCoupons();
    }
  }, [navigate]);

  // Fetch coupons for this store user
  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/coupons/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    }
  };

  // Fetch requested coupons separately
  const fetchRequestedCoupons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/coupons/requests/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      

      if (!res.ok) throw new Error("Failed to fetch requested coupons");
      const data = await res.json();
      console.log("Requested coupons from API:", data);
      setRequestedCoupons(data);
    } catch (err) {
      console.error("Error fetching requested coupons:", err);
    }
  };

  // Handle request submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/coupons/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        alert("Coupon request submitted successfully!");
        setName("");
        fetchRequestedCoupons(); // refresh requests
      } else {
        const errData = await res.json();
        alert("Failed to submit request: " + (errData.msg || res.statusText));
      }
    } catch (err) {
      console.error("Error submitting request:", err);
    }
  };

  // Redeem coupon
  const redeemCoupon = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/coupons/${id}/redeem`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || "Failed to redeem coupon");
      }

      alert("Coupon redeemed successfully!");
      fetchCoupons();
    } catch (err) {
      console.error("Error redeeming coupon:", err);
      alert(err.message);
    }
  };

  // Check if coupon expired
  const isExpired = (validTo) => new Date(validTo) < new Date();

  // Apply filter
  const filteredCoupons =
    filter === "all" ? coupons : coupons.filter((c) => c.status === filter);

  const getStatusColor = (status, validTo) => {
    if (isExpired(validTo)) return "text-expired";
    switch (status) {
      case "active": return "text-active";
      case "used": return "text-used";
      case "disabled": return "text-disabled";
      default: return "text-light";
    }
  };

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-6xl mx-auto p-8 w-full">
        
        {/* Coupon Request + Requested Coupons in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2 mb-10">
          
          {/* Coupon Request Form */}
          <div className="bg-base w-full backdrop-blur-sm border border-secondary/40 shadow-md rounded-2xl p-8">
            <h2 className="text-3xl font-light text-primary mb-6">
              <span className="font-semibold">Request</span> a Coupon
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                name="name"
                placeholder="Enter Coupon Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 border border-secondary/50 px-5 py-2 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-contrast focus:outline-none"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-secondary hover:text-dark transition"
              >
                Submit Request
              </button>
            </form>
          </div>

          {/* Requested Coupons */}
          <div className="bg-base w-full backdrop-blur-sm border border-secondary/40 shadow-md rounded-2xl p-8">
  <h2 className="text-3xl font-light text-primary mb-6">
    <span className="font-semibold">Requested</span> Coupons
  </h2>

  {requestedCoupons.filter(r => r.status === "requested").length === 0 ? (
    <p className="text-light text-center">No pending requests.</p>
  ) : (
    <ul className="space-y-3">
      {requestedCoupons
        .filter(r => r.status === "requested")
        .map((r) => (
          <li
            key={r.id}
            className="px-4 py-3 bg-white/70 border border-secondary/30 rounded-lg shadow-sm flex justify-between items-center"
          >
            <span className="text-primary font-medium">{r.name}</span>
            <span className="text-sm text-light">{r.status}</span>
          </li>
        ))}
    </ul>
  )}
</div>

        </div>

        {/* Coupons Section with Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-3xl font-light text-primary">
            <span className="font-semibold">My</span> Coupons
          </h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-secondary/50 rounded-xl bg-base text-primary focus:ring-2 focus:ring-contrast focus:outline-none"
          >
            <option value="active">Active</option>
            <option value="used">Used</option>
            <option value="disabled">Disabled</option>
            <option value="expired">Expired</option>
            <option value="all">All</option>
          </select>
        </div>

        {filteredCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-secondary rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm">
            <p className="text-center text-primary text-lg">
              No coupons available for this filter.
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
                      Brand: {c.brandName} | Branch: {c.branchName}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(c.status, c.valid_to)}`}>
                    {isExpired(c.valid_to) ? "expired" : c.status}
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
                <h3 className="text-2xl font-bold text-primary">{selectedCoupon.name}</h3>

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
                  Brand: {selectedCoupon.brandName}
                </p>
                <p className="text-sm text-light">
                  Branch: {selectedCoupon.branchName}
                </p>
                <p className="text-sm text-light">
                  Status:{" "}
                  <span className={getStatusColor(selectedCoupon.status, selectedCoupon.valid_to)}>
                    {isExpired(selectedCoupon.valid_to) ? "expired" : selectedCoupon.status}
                  </span>
                </p>

                <p className="text-sm font-bold text-light">
                  Validity: {new Date(selectedCoupon.valid_from).toLocaleDateString()} –{" "}
                  {new Date(selectedCoupon.valid_to).toLocaleDateString()}
                </p>

                {/* QR Code */}
                {selectedCoupon.status === "active" &&
                  !isExpired(selectedCoupon.valid_to) &&
                  selectedCoupon.qr_code && (
                    <img
                      src={`http://localhost:5000${selectedCoupon.qr_code}`}
                      alt="QR Code"
                      className="mx-auto mt-4 w-32 h-32 rounded-xl border border-secondary/40 shadow-sm"
                    />
                  )}

                {/* Redeem Button */}
                {selectedCoupon.status === "active" &&
                  !isExpired(selectedCoupon.valid_to) && (
                    <button
                      onClick={() => redeemCoupon(selectedCoupon.id)}
                      className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                    >
                      Redeem
                    </button>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
