import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function CreateCoupon() {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeUserId, requestId } = location.state || {}; 

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
          status: "waiting_for_approval",
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
    <div className="min-h-screen bg-base flex flex-col">
      <Navbar />

      <motion.div
        className="flex-grow flex items-center justify-center px-4 py-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-full max-w-4xl p-10 bg-base backdrop-blur-sm border border-secondary/60
                     shadow-xl rounded-2xl h-auto"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-light mb-8 text-center text-primary">
            <span className="font-semibold">Create</span> Coupon
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-primary mb-1">
                Brand
              </label>
              <select
                name="brandId"
                value={form.brandId}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-secondary/50 
                 rounded-lg text-sm font-semibold text-light focus:ring-2 focus:ring-contrast focus:outline-none transition"
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
            </motion.div>

            {/* Branch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label className="block text-sm font-medium text-primary mb-1">
                Branch
              </label>
              <select
                name="branchId"
                value={form.branchId}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-secondary/50 
                 rounded-lg text-sm font-semibold text-light focus:ring-2 focus:ring-contrast focus:outline-none transition"
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
            </motion.div>

            {/* Coupon Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-primary mb-1">
                Coupon Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
               className="mt-1 block w-full px-4 py-2 border border-secondary/50 
                 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-contrast focus:outline-none transition"
              />
            </motion.div>

            {/* Discount */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label className="block text-sm font-medium text-primary mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={form.discount}
                onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-secondary/50 
                 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-contrast focus:outline-none transition"
                required
              />
            </motion.div>

            {/* Valid From */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-primary mb-1">
                Valid From
              </label>
              <input
                type="date"
                name="validFrom"
                value={form.validFrom}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-secondary/50 
                 rounded-lg text-sm font-semibold text-light focus:ring-2 focus:ring-contrast focus:outline-none transition"
                required
              />
            </motion.div>

            {/* Valid To */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className="block text-sm font-medium text-primary mb-1">
                Valid To
              </label>
              <input
                type="date"
                name="validTo"
                value={form.validTo}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-secondary/50 
                 rounded-lg text-sm font-semibold text-light focus:ring-2 focus:ring-contrast focus:outline-none transition"
                required
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex justify-center">
              <button
                type="submit"
                className="btn "
              >
                Create Coupon
              </button>
              </div>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
