import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateCouponButton from "./CreateCouponButton";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();


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
    className="flex items-center justify-between px-8 py-4 bg-[#E7F2EF] border-[#708993] shadow-lg"
  >

    <h3 className="text-xl font-light text-[#19183B]">
      Welcome, <span className="font-semibold text-[#A1C2BD]">{username}</span>
      <span className="text-[#19183B]">!</span>
    </h3>

    <div className="flex items-center space-x-4">
      <LogoutButton />
    </div>
  </nav>
);

}
