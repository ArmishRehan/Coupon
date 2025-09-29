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
      

//expire status 
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

      return { ...c, status: "expired" }; 
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
  <div className="min-h-screen bg-[#E7F2EF] flex flex-col">
    <Navbar />
    <div className="flex-grow max-w-6xl mx-auto p-6 w-full">
      
      <h2 className="text-3xl font-light mb-6 text-[#19183B]">
        <span className="font-semibold">All User's</span> Coupons
      </h2>

      <CouponFilter onFilterChange={setFilters} coupons={coupons} />

      {filteredCoupons.length === 0 ? (
    
        <p className="text-center text-[#708993] mt-8 p-4 border border-dashed border-[#A1C2BD] rounded-lg">
          No coupons found matching your criteria.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredCoupons.map((c) => (
            <li
              key={c.id}
              className="bg-white rounded-xl border border-[#708993]/30 shadow-sm !p-5 hover:shadow-lg 
                hover:border-[#A1C2BD] cursor-pointer transition-all duration-300"
              onClick={() => setSelectedCoupon(c)}>
              <h3 className="text-lg font-semibold text-[#19183B] mb-1">
                {c.name}
              </h3>
            
              <p className="text-[#708993] text-sm">Brand: {c.brandName}</p>
              <p className="text-[#708993] text-sm">Branch: {c.branchName}</p>
              <p className="text-[#708993] text-sm">
                Discount: <span className="font-medium">{c.discount}%</span>
              </p>
              <p className="text-[#708993] text-sm">
                Valid: {new Date(c.valid_from).toLocaleDateString()} →{" "}
                {new Date(c.valid_to).toLocaleDateString()}
              </p>
              <p className="text-sm text-[#708993] pt-2 border-t border-[#708993]/20">
                User: <span className="font-medium text-[#19183B]">{c.username}</span>
              </p>

              <div className="flex items-center justify-between mt-2">
                <p className="text-sm font-medium">
                  Status:{" "}

                  <span
                    className={`
                      font-bold uppercase tracking-wider text-xs px-2 py-0.5 rounded-full
                      ${
                        c.status === "used"
                          ? "bg-[#708993]/20 text-[#19183B]"
                          : c.status === "expired"
                          ? "bg-[#19183B]/20 text-[#19183B]"
                          : "bg-[#A1C2BD] text-[#19183B]"
                      }
                    `}
                  >
                    {c.status}
                  </span>
                </p>

                {c.status !== "expired" && c.status !== "used" && isAdmin && (
                  <EditCouponButton  couponId={c.id} />
                )}
              </div>
              
            </li>
          ))}
        </ul>
      )}
    </div>

    {selectedCoupon && (
      <div className="fixed inset-0 bg-[#19183B]/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div 
          className="bg-white rounded-3xl shadow-2xl relative max-w-md w-full overflow-y-auto max-h-[90vh] !p-6 
            border-t-4 border-[#A1C2BD]"
        >
          <button
            className="absolute top-4 right-4 text-[#708993] hover:text-[#19183B] font-light text-2xl transition-colors"
            onClick={() => setSelectedCoupon(null)}
            aria-label="Close"
          >
            ✕
          </button>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#19183B] mr-2">
              Coupon Details: {selectedCoupon.name}
            </h2>
            
          </div>

          <p className="mb-1 text-[#708993]">
            Brand: <span className="font-medium text-[#19183B]">{selectedCoupon.brandName || "N/A"}</span>
          </p>
          <p className="mb-1 text-[#708993]">
            Branch: <span className="font-medium text-[#19183B]">{selectedCoupon.branchName || "N/A"}</span>
          </p>
          <p className="mb-1 text-[#708993]">
            Discount: <span className="font-medium text-[#19183B]">{selectedCoupon.discount}%</span>
          </p>
          <p className="mb-1 text-[#708993]">
            Validity:{" "}
            <span className="font-medium text-[#19183B]">
              {new Date(selectedCoupon.valid_from).toLocaleDateString()} →{" "}
              {new Date(selectedCoupon.valid_to).toLocaleDateString()}
            </span>
          </p>
          <p className="mb-2 text-[#708993]">
            User: <span className="font-medium text-[#19183B]">{selectedCoupon.username}</span>
          </p>

          <p className="mb-4 text-[#708993] font-medium border-t pt-4 border-[#A1C2BD]/50">
            Status:{" "} 

            <span
              className={`
                font-bold uppercase tracking-wider text-xs px-2 py-0.5 rounded-full
                ${
                  selectedCoupon.status === "used"
                    ? "bg-[#708993]/20 text-[#19183B]"
                    : selectedCoupon.status === "expired"
                    ? "bg-[#19183B]/20 text-[#19183B]"
                    : "bg-[#A1C2BD] text-[#19183B]"
                }
              `}
            >
              {selectedCoupon.status}
            </span>
          </p>

          {selectedCoupon.status === "pending" && (
            <div className="flex flex-col items-center mt-4 pt-4 border-t border-[#A1C2BD]/50">
              <p className="text-sm font-semibold text-[#19183B] mb-3">Scan QR Code to Redeem</p>
              <img
                src={`http://localhost:5000${selectedCoupon.qr_code}`}
                alt="QR Code"
                className="w-40 h-40 rounded-lg shadow-xl border-4 border-white" 
              />
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
}
