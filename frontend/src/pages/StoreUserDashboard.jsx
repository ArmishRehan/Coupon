
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function StoreUserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [filter, setFilter] = useState("active");

  // Check login role
  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (!loggedUser || loggedUser.role !== "store user") {
      navigate("/login");
    } else {
      setUser(loggedUser);
      fetchCoupons();
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
      setCoupons(data); // ✅ fetch all statuses
    } catch (err) {
      console.error("Error fetching coupons:", err);
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

  return (
    <div className="min-h-screen bg-[#E7F2EF] flex flex-col">
      <Navbar />
      <div className="flex-grow p-6 max-w-6xl mx-auto w-full">
        {/* Coupon Request Form */}
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-10">
          <h2 className="text-2xl font-bold text-[#19183B] mb-6">
            Request a Coupon
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Coupon Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#A1C2BD]"
              required
            />
            <button
              type="submit"
              className="w-full bg-[#19183B] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#A1C2BD] hover:text-gray-900 transition"
            >
              Submit Request
            </button>
          </form>
        </div>

        {/* Coupons Section with Filter */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#19183B]">My Coupons</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white text-[#19183B]"
          >
            <option value="active">Active</option>
            <option value="used">Used</option>
            <option value="disabled">Disabled</option>
            <option value="all">All</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {filteredCoupons.length === 0 ? (
          <p className="text-center text-[#708993]">
            No coupons available for this filter.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((c) => (
              <li
                key={c.id}
                className="p-6 bg-white rounded-xl shadow-md border border-[#708993]/30"
              >
                <h3 className="text-lg font-semibold text-[#19183B] mb-2">
                  {c.name}
                </h3>
                <p className="text-sm text-[#708993] mb-1">
                  Brand: {c.brandName} | Branch: {c.branchName}
                </p>
                <p className="text-sm text-[#708993] mb-1">
                  Discount: {c.discount}%
                </p>
                <p className="text-sm text-[#708993] mb-1">
                  Valid: {new Date(c.valid_from).toLocaleDateString()} →{" "}
                  {new Date(c.valid_to).toLocaleDateString()}
                </p>

                <p className="text-sm font-medium mb-2">
                  Status:{" "}
                  <span
                    className={`${
                      isExpired(c.valid_to)
                        ? "text-red-600"
                        : c.status === "active"
                        ? "text-blue-600"
                        : c.status === "used"
                        ? "text-gray-600"
                        : "text-gray-500"
                    }`}
                  >
                    {isExpired(c.valid_to) ? "expired" : c.status}
                  </span>
                </p>

                {/* Show QR only if active & valid */}
                {c.status === "active" && !isExpired(c.valid_to) && c.qr_code && (
                  <img
                    src={`http://localhost:5000${c.qr_code}`}
                    alt="QR Code"
                    className="mt-2 w-20 h-20"
                  />
                )}

                {/* Redeem Button */}
                {c.status === "active" && !isExpired(c.valid_to) && (
                  <button
                    onClick={() => redeemCoupon(c.id)}
                    className="mt-3 px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                  >
                    Redeem
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
