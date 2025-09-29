import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import RedeemButton from "../components/RedeemButton";
import CouponFilter from "../components/CouponFilter";

export default function UserDashboard() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/coupons/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${text}`);
        }
        return res.json();
      })

      //expire
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



  const filteredCoupons = coupons.filter((c) => {
  const { status, dateFrom, dateTo } = filters;

    // status filter
    const statusOk = status ? String(c.status) === String(status) : true;


    // coupons 
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

    <div className="flex-grow max-w-6xl mx-auto p-8 w-full">

      <h2 className="text-3xl font-light mb-6 text-[#19183B]">
        <span className="font-semibold">My</span> Coupons
      </h2>

      <CouponFilter onFilterChange={setFilters} coupons={coupons} />

      {filteredCoupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#708993] rounded-xl mt-6">
          <p className="text-center text-[#708993] text-lg">
            No coupons found matching your filters.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredCoupons.map((c) => (
            <li
              key={c.id}
              className="p-6 bg-white rounded-xl border border-[#708993]/30 shadow-sm hover:shadow-lg hover:border-[#A1C2BD]
                cursor-pointer transition-all duration-300"
              onClick={() => setSelectedCoupon(c)}
            >
              <h3 className="text-xl font-semibold text-[#19183B] mb-2">{c.name}</h3>

              <div className="text-sm space-y-1 text-[#708993] mb-4">
                <p>Brand: <span className="text-[#19183B] font-medium">{c.brandName}</span></p>
                <p>Branch: <span className="text-[#19183B] font-medium">{c.branchName}</span></p>
                <p>Discount: <span className="text-[#19183B] font-medium">{c.discount}%</span></p>
              </div>

              <p className="text-xs text-[#708993] border-t pt-3 border-[#708993]/20">
                Valid: {new Date(c.valid_from).toLocaleDateString()} →{" "}
                {new Date(c.valid_to).toLocaleDateString()}
              </p>
              
              <p className="text-sm mt-2 font-medium">
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
            </li>
          ))}
        </ul>
      )}
    </div>

{selectedCoupon && (
  <div className="fixed inset-0 bg-[#19183B]/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
     <div 
          className="bg-white rounded-3xl shadow-2xl relative max-w-md w-full max-h-[100vh] !p-6 
            border-t-4 border-[#A1C2BD]"
        >
      <button
        className="absolute top-4 right-4 text-[#708993] hover:text-[#19183B] font-light text-2xl transition-colors"
        onClick={() => setSelectedCoupon(null)}
      >
        ✕
      </button>

      <h2 className="text-2xl font-semibold mb-4 text-[#19183B]">{selectedCoupon.name}</h2>
      
      <div className="text-[#19183B] space-y-2 mb-4">
        <p className="text-sm font-medium">Brand: <span className="text-[#708993] font-normal">{selectedCoupon.brandName || "N/A"}</span></p>
        <p className="text-sm font-medium">Branch: <span className="text-[#708993] font-normal">{selectedCoupon.branchName || "N/A"}</span></p>
        <p className="text-sm font-medium">Discount: <span className="text-[#708993] font-normal">{selectedCoupon.discount}%</span></p>
      </div>

      <div className="p-4 rounded-lg bg-[#E7F2EF] border border-[#708993]/30 mb-6">
        <p className="text-sm mb-2 font-medium text-[#19183B]">
          Validity:{" "}
          <span className="font-normal text-[#708993]">
            {new Date(selectedCoupon.valid_from).toLocaleDateString()} →{" "}
            {new Date(selectedCoupon.valid_to).toLocaleDateString()}
          </span>
        </p>
        <p className="text-sm font-medium text-[#19183B]">
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
      </div>

      {selectedCoupon.status === "pending" && (
        <div className="flex flex-col items-center mt-4 gap-6 p-4 border border-dashed border-[#A1C2BD] rounded-lg">
          <p className="text-sm text-[#708993] font-medium">Scan QR Code to redeem</p>
          <img
            src={`http://localhost:5000${selectedCoupon.qr_code}`}
            alt="QR Code"
            className="w-40 h-40 rounded-lg border-4 border-white shadow-xl"
          />
          <RedeemButton
            couponId={selectedCoupon.id}
            currentStatus={selectedCoupon.status}
            onRedeem={() => {
              setSelectedCoupon({ ...selectedCoupon, status: "used" });
              setCoupons((prev) =>
                prev.map((c) =>
                  c.id === selectedCoupon.id ? { ...c, status: "used" } : c
                )
              );
            }}
          />
        </div>
      )}
    </div>
  </div>
)}
  </div>
);
}