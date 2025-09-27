import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function CreateCoupon() {
    const navigate = useNavigate();
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
    const [qrCodeUrl, setQrCodeUrl] = useState(null); 

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
        console.log("Submitting form:", form);
        try {
            const token = localStorage.getItem("token"); // logged in user ka token save hoga
            const res = await fetch("http://localhost:5000/api/coupons", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            })


            const data = await res.json();

            if (res.ok) {
                setQrCodeUrl(data.qrCode); // store QR code URL
                alert("Coupon created successfully!");
                navigate("/User-dashboard")
            } else {
                alert("Failed to create coupon: " + data.error);
            }
        } catch (err) {
            console.error("Error creating coupon:", err);
        }
    };

return (
  <div className="min-h-screen bg-gradient flex flex-col">
    <Navbar />

    <div className="flex-grow flex items-center justify-center px-4">
      <div className="w-full max-w-4xl p-8 bg-white shadow-lg rounded-2xl h-auto max-h-[85vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Create Coupon
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <select
              name="brandId"
              value={form.brandId}
              onChange={handleChange}
              className="input-style"
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

          {/* Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select
              name="branchId"
              value={form.branchId}
              onChange={handleChange}
              className="input-style disabled:bg-gray-100 disabled:cursor-not-allowed"
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

          {/* Coupon Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-style"
              required
            />
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount (%)
            </label>
            <input
              type="number"
              name="discount"
              value={form.discount}
              onChange={handleChange}
              className="input-style"
              required
            />
          </div>

          {/* Valid From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid From
            </label>
            <input
              type="date"
              name="validFrom"
              value={form.validFrom}
              onChange={handleChange}
              className="input-style"
              required
            />
          </div>

          {/* Valid To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid To
            </label>
            <input
              type="date"
              name="validTo"
              value={form.validTo}
              onChange={handleChange}
              className="input-style"
              required
            />
          </div>

          {/* Submit - full width */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              className="btn-purple w-full"
              
            >
              Create Coupon
            </button>
          </div>
        </form>

        {/* QR code preview */}
        {qrCodeUrl && (
          <div className="mt-6 text-center">
            <h3 className="text-lg font-medium mb-2">Scan this QR code:</h3>
            <img
              src={`http://localhost:5000${qrCodeUrl}`}
              alt="Coupon QR Code"
              className="mx-auto rounded-lg shadow w-32 h-32"
            />
          </div>
        )}
      </div>
    </div>
  </div>
);
}