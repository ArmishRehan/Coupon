import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar (){
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
<div>
  <nav className="flex justify-between items-center px-6 py-3 bg-white shadow-md rounded-b-2xl">

    <h3 className="text-lg font-semibold text-gray-800">
      Welcome, <span className="text-[#A594F9]">{username}</span>!
    </h3>


    <button
      onClick={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }}
      className="px-5 py-2 rounded-xl bg-[#A594F9] text-white font-medium 
                 hover:bg-[#CDC1FF] hover:text-gray-800 shadow-md transition"
    >
      Logout
    </button>
  </nav>
</div>

);
}
