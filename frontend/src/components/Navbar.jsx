import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateCouponButton from "./CreateCouponButton";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  // for displaying the logged in username in the navbar

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setUsername(user.username);
    } catch {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);


return (
  <nav 
    className="
      flex items-center justify-between 
      px-8 py-4 
      bg-[#E7F2EF] 
      border-b border-[#708993]
      shadow-sm // Use a softer shadow for a light-mode feel
    "
  >
    {/* Left - Greeting */}
    <h3 className="text-xl font-light text-[#19183B]">
      Welcome, <span className="font-semibold text-[#A1C2BD]">{username}</span>
      <span className="text-[#19183B]">!</span>
    </h3>

    {/* Right - Actions */}
    <div className="flex items-center space-x-4">
      {/* Assuming these buttons are styled to match the previous minimalist button */}
      <LogoutButton />
      <CreateCouponButton /> 
    </div>
  </nav>
);

}
