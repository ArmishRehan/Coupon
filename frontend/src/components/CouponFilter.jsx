import { useEffect, useState } from "react";

export default function CouponFilter({ onFilterChange }) {

  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/brands")
      .then((res) => res.json())
      .then((data) => setBrands(data))
      .catch((err) => console.error("Error fetching brands:", err));
  }, []);

  


  useEffect(() => {
    onFilterChange({ status,  dateFrom, dateTo });
  }, [status,  dateFrom, dateTo, onFilterChange]);

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border px-2 py-1 rounded"
      >
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="used">Used</option>
        <option value="expired">Expired</option>
      </select>



      <input
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        className="border px-2 py-1 rounded"
      />

      <input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        className="border px-2 py-1 rounded"
      />
    </div>
  );
}
