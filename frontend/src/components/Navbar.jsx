import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import { Tickets } from "lucide-react";

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
    <nav className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-secondary shadow-sm shadow-secondary sticky top-0 z-50">

      <div className="flex items-center gap-2 sm:gap-4">

        < Tickets color="#1C352D" />
        <h3 className="text-lg sm:text-xl font-bold whitespace-nowrap">
          <span className="text-primary">CouponMaster</span>
        </h3>

        <h2 className="text-md sm:text-md mt-1 flex items-center">
          <span className="text-[#1C352D] font-medium truncate max-w-[80px] sm:max-w-full hidden md:block">
            {username}
          </span>
        </h2>
      </div>

      <div>
        <LogoutButton />
      </div>
    </nav>
  );



}
