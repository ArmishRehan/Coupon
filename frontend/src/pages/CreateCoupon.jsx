import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function CreateCoupon() {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeUserId, requestId } = location.state || {}; // ✅ passed from CreatorDashboard

  const [brands, setBrands] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    brandId: "",
    branchId: "",
    name: "",
    discount: "",
    validFrom: "",
    validTo: "",
  });

  // Load brands
  useEffect(() => {
    fetch("http://localhost:5000/api/brands")
      .then((res) => res.json())
      .then((data) => setBrands(data))
      .catch((err) => console.error("Error fetching brands:", err));
  }, []);

  // Load branches when brand changes
  useEffect(() => {
    if (form.brandId) {
      fetch(`http://localhost:5000/api/brands/${form.brandId}/branches`)
        .then((res) => res.json())
        .then((data) => setBranches(data))
        .catch((err) => console.error("Error fetching branches:", err));
    } else {
      setBranches([]);
    }
  }, [form.brandId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeUserId || !requestId) {
      alert("Missing store user or request info for this coupon!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          storeUserId,
          requestId,
          status: "waiting_for_approval", // ✅ ensure db status
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Coupon submitted! Waiting for approval by Admin.");
        navigate("/Creator-Dashboard");
      } else {
        alert("Failed to create coupon: " + (data.error || data.msg));
      }
    } catch (err) {
      console.error("Error creating coupon:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#E7F2EF] flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl p-8 bg-white shadow-xl rounded-2xl h-auto border border-[#708993]/30">
          <h2 className="text-2xl font-bold mb-6 text-[#19183B] text-center">
            Create Coupon
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm font-medium text-[#708993] mb-1">
                Brand
              </label>
              <select
                name="brandId"
                value={form.brandId}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 rounded-xl border border-[#708993]/50 shadow-sm 
                          focus:ring-[#A1C2BD] focus:border-[#A1C2BD] bg-white text-[#19183B] transition"
                required
              >
                <option value="" disabled>
                  Select Brand
                </option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#708993] mb-1">
                Branch
              </label>
              <select
                name="branchId"
                value={form.branchId}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 rounded-xl border border-[#708993]/50 shadow-sm 
                          focus:ring-[#A1C2BD] focus:border-[#A1C2BD] bg-white text-[#19183B] transition"
                required
                disabled={!form.brandId}
              >
                <option value="" disabled>
                  Select Branch
                </option>
                {branches.map((br) => (
                  <option key={br.id} value={br.id}>
                    {br.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#708993] mb-1">
                Coupon Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 rounded-xl border border-[#708993]/50 shadow-sm 
                          focus:ring-[#A1C2BD] focus:border-[#A1C2BD] bg-white text-[#19183B] transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#708993] mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 rounded-xl border border-[#708993]/50 shadow-sm 
                          focus:ring-[#A1C2BD] focus:border-[#A1C2BD] bg-white text-[#19183B] transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#708993] mb-1">
                Valid From
              </label>
              <input
                type="date"
                name="validFrom"
                value={form.validFrom}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 rounded-xl border border-[#708993]/50 shadow-sm 
                          focus:ring-[#A1C2BD] focus:border-[#A1C2BD] bg-white text-[#19183B] transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#708993] mb-1">
                Valid To
              </label>
              <input
                type="date"
                name="validTo"
                value={form.validTo}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 rounded-xl border border-[#708993]/50 shadow-sm 
                          focus:ring-[#A1C2BD] focus:border-[#A1C2BD] bg-white text-[#19183B] transition"
                required
              />
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl 
                           shadow-md text-lg font-semibold text-[#19183B] bg-[#A1C2BD] 
                           hover:bg-[#708993] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 
                           focus:ring-[#A1C2BD] transition duration-150 ease-in-out"
              >
                Create Coupon
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
