import { useEffect, useState } from "react";

export default function CouponFilter({ onFilterChange }) {

  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    onFilterChange({ status,  dateFrom, dateTo });
  }, [status,  dateFrom, dateTo, onFilterChange]);

  return (
  <div className="flex flex-wrap gap-4 mb-8 p-4">
    
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      className="border border-[#708993] text-[#19183B] px-3 py-2 rounded-lg bg-[#E7F2EF] text-sm font-medium
        focus:border-[#19183B] focus:ring-1 focus:ring-[#19183B] appearance-none transition-colors cursor-pointer"
    >
      <option value="">All Status</option>
      <option value="pending">Pending</option>
      <option value="used">Used</option>
      <option value="expired">Expired</option>
      <option value="disabled">Disabled</option>
    </select>
    <input
      type="date"
      value={dateFrom}
      onChange={(e) => setDateFrom(e.target.value)}
      className="border border-[#708993] text-[#19183B] px-3 py-2 rounded-lg bg-[#E7F2EF] text-sm font-medium
        focus:border-[#19183B] focus:ring-1 focus:ring-[#19183B] transition-colors cursor-pointer"
      aria-label="Filter from date"
    />
    <input
      type="date"
      value={dateTo}
      onChange={(e) => setDateTo(e.target.value)}
      className="border border-[#708993] text-[#19183B] px-3 py-2 rounded-lg bg-[#E7F2EF] text-sm 
        font-medium focus:border-[#19183B]  focus:ring-1 focus:ring-[#19183B]  transition-colors cursor-pointer"
      aria-label="Filter to date"
    />
  </div>
);
}
