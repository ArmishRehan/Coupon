
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import CreateCouponButton from "../components/CreateCouponButton";

export default function CreatorDashboard() {
  const [requests, setRequests] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

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

  // status filter
  const filteredCoupons =
    filter === "all" ? coupons : coupons.filter((c) => c.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting_for_approval": return "text-yellow-600";
      case "active": return "text-green-600";
      case "disabled": return "text-gray-500";
      case "used": return "text-gray-500";
      case "expired": return "text-gray-600";
      case "rejected": return "text-red-600";
      default: return "text- #708993";
    }
  };


  return (
    <div className="min-h-screen bg-[#E7F2EF] flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-6xl mx-auto p-8 w-full">
        {/* Store User Requests */}
        <h2 className="text-3xl font-light mb-6 text-[#19183B]">
          <span className="font-semibold">Store User</span> Requests
        </h2>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#708993] rounded-xl mb-10">
            <p className="text-center text-[#708993] text-lg">No requests found.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {requests.map((r) => (
              <li
                key={r.id}
                className="p-6 bg-white rounded-xl border border-[#708993]/30 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-[#19183B] mb-2">{r.name}</h3>
                <p className="text-sm text-[#708993] mb-1">
                  Requested by: {r.store_username}
                </p>
                <p className="text-sm text-[#708993] mb-1">Status: {r.status}</p>
                <p className="text-xs text-[#708993] mb-3">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
                <CreateCouponButton storeUserId={r.store_user_id}
                  requestId={r.request_id} />
              </li>
            ))}
          </ul>
        )}

        {/* My Coupons */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-light text-[#19183B]">
            <span className="font-semibold">My</span> Coupons
          </h2>

          {/* Filter dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white text-[#19183B]"
          >
            <option value="all">All</option>
            <option value="waiting_for_approval">Waiting for Approval</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {filteredCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#708993] rounded-xl">
            <p className="text-center text-[#708993] text-lg">
              No coupons match this filter.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((c) => (
              <li
                key={c.id}
                className="p-6 bg-white rounded-xl border border-[#708993]/30 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-[#19183B] mb-2">{c.name}</h3>
                <p className="text-sm text-[#708993] mb-1">
                  Brand: {c.brandName} | Branch: {c.branchName}
                </p>
                <p className="text-sm text-[#708993] mb-1">
                  Discount: {c.discount}%
                </p>
                <p className="text-sm text-[#708993] mb-1">
                  Status:{" "}
                  <span className={getStatusColor(c.status)}>{c.status}</span>
                </p>
                <p className="text-sm text-[#708993] mb-1">
                  Requested by: {c.storeUser || "N/A"}
                </p>
                {/* ✅ Show QR when active */}
                {c.status === "active" && c.qr_code && (
                  <img
                    src={`http://localhost:5000${c.qr_code}`}
                    alt="QR Code"
                    className="mt-2 w-20 h-20"
                  />
                )}
                <p className="text-xs text-[#708993]">
                  {new Date(c.valid_from).toLocaleDateString()} -{" "}
                  {new Date(c.valid_to).toLocaleDateString()}
                </p>

              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
