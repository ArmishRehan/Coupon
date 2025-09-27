import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CouponFilter from "../components/CouponFilter";
import EditCouponButton from "../components/EditCouponButton";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  //fetch role from localStorage (saved after login)
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/coupons/all", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${text}`);
        }
        return res.json();
      })
      

      //expire status (only frontend)
.then((data) => {
  const token = localStorage.getItem("token");
  const now = new Date();

  const updated = data.map((c) => {
    if (c.status === "pending" && new Date(c.valid_to) < now) {
      
      fetch(`http://localhost:5000/api/coupons/${c.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "expired" }),
      }).catch((err) => console.error("Error updating status in DB:", err));

      return { ...c, status: "expired" }; // UI change
    }
    return c;
  });

  setCoupons(updated);
  setLoading(false);
})


      .catch((err) => {
        console.error("Error fetching coupons:", err);
        setLoading(false);
      });
  }, []);


  //date filter
  const filteredCoupons = coupons.filter((c) => {
    const { status, dateFrom, dateTo } = filters;
    const statusOk = status ? String(c.status) === String(status) : true;

    function normalizeDateToDay(date) {
      if (!date) return null;
      const d = new Date(date);
      if (isNaN(d)) return null;
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    const couponFrom = normalizeDateToDay(c.valid_from || c.validFrom);
    const couponTo = normalizeDateToDay(c.valid_to || c.validTo);

    let validityOk = true;

    if (dateFrom && dateTo) {
      const dFrom = normalizeDateToDay(dateFrom);
      const dTo = normalizeDateToDay(dateTo);
      if (couponFrom && couponTo) {
        validityOk = couponFrom >= dFrom && couponTo <= dTo;
      } else {
        validityOk = false;
      }
    } else if (dateFrom) {
      const dFrom = normalizeDateToDay(dateFrom);
      validityOk = couponFrom ? couponFrom >= dFrom : false;
    } else if (dateTo) {
      const dTo = normalizeDateToDay(dateTo);
      validityOk = couponTo ? couponTo <= dTo : false;
    }

    return statusOk && validityOk;
  });

  if (loading) return <p className="text-center mt-6">Loading coupons...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#CDC1FF] to-white flex flex-col">
      <Navbar />

      <div className="flex-grow max-w-6xl mx-auto p-6 w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center md:text-left">
          All Users' Coupons
        </h2>

        <CouponFilter onFilterChange={setFilters} coupons={coupons} />

        {filteredCoupons.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No coupons found.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {filteredCoupons.map((c) => (
              <li
                key={c.id}
                className="p-5 bg-white rounded-2xl shadow-md hover:shadow-lg cursor-pointer transition-shadow"
                onClick={() => setSelectedCoupon(c)}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{c.name}</h3>
                <p className="text-gray-600 text-sm">Brand: {c.brandName}</p>
                <p className="text-gray-600 text-sm">Branch: {c.branchName}</p>
                <p className="text-gray-600 text-sm">Discount: {c.discount}%</p>
                <p className="text-gray-600 text-sm">
                  Valid: {new Date(c.valid_from).toLocaleDateString()} →{" "}
                  {new Date(c.valid_to).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  User: <span className="font-medium">{c.username}</span>
                </p>
                <p className="text-sm mt-1">
                  Status:{" "}
                  <span
                    className={
                      c.status === "used"
                        ? "text-red-600 font-semibold"
                        : c.status === "expired"
                          ? "text-gray-400 font-semibold"
                          : "text-green-600 font-semibold"
                    }
                  >
                    {c.status}
                  </span>
                </p>

                {c.status !== "expired"  && c.status !== "used" && isAdmin && (
                 <EditCouponButton couponId={c.id}/>
                )}

              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg relative max-w-md w-full p-6 overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold text-xl"
              onClick={() => setSelectedCoupon(null)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-2 text-gray-800">{selectedCoupon.name}</h2>
            <p className="mb-1 text-gray-600">Brand: {selectedCoupon.brandName || "N/A"}</p>
            <p className="mb-1 text-gray-600">Branch: {selectedCoupon.branchName || "N/A"}</p>
            <p className="mb-1 text-gray-600">Discount: {selectedCoupon.discount}%</p>
            <p className="mb-1 text-gray-600">
              Validity:{" "}
              {new Date(selectedCoupon.valid_from).toLocaleDateString()} →{" "}
              {new Date(selectedCoupon.valid_to).toLocaleDateString()}
            </p>
            <p className="mb-1 text-gray-600">User: {selectedCoupon.username}</p>
            <p className="mb-2 text-gray-600">
              Status:{" "}
              <span
                className={
                  selectedCoupon.status === "used"
                    ? "text-red-600 font-semibold"
                    : selectedCoupon.status === "expired"
                      ? "text-gray-400 font-semibold"
                      : "text-green-600 font-semibold"
                }
              >
                {selectedCoupon.status}
              </span>
            </p>
                  
            {selectedCoupon.status === "pending" && (
              <div className="flex flex-col items-center mt-4 gap-4">
                <img
                  src={`http://localhost:5000${selectedCoupon.qr_code}`}
                  alt="QR Code"
                  className="w-36 h-36 rounded-lg shadow"
                />
              
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
