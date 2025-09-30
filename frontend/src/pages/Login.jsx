import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
   setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // Save both token and user
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "admin") {
          navigate("/Admin-Dashboard");
        } 
        else if (data.user.role === "creator") {
          navigate("/Creator-Dashboard");
        }
        else if (data.user.role === "store user"){
          navigate("/StoreUser-Dashboard");
        }
       else {
        alert(data.msg || "Login failed");
      }
    }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error");
    }
  };

return (
  <div className="flex items-center justify-center min-h-screen bg-[#E7F2EF]">
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-[#708993]/30">

      <h2 className="text-3xl font-bold text-center text-[#19183B]">
        Welcome Back!
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>

          <label className="block text-sm font-medium text-[#708993]">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 rounded-xl border border-[#708993]/50 shadow-sm 
                        focus:ring-[#A1C2BD] focus:border-[#A1C2BD] bg-white text-[#19183B] placeholder-[#708993] transition"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#708993]">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 rounded-xl border border-[#708993]/50 shadow-sm 
                        focus:ring-[#A1C2BD] focus:border-[#A1C2BD] bg-white text-[#19183B] placeholder-[#708993] transition"
            placeholder="Enter your password"
            required
          />
        </div>

        <button 
          type="submit" 
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl 
                     shadow-md text-lg font-semibold text-[#19183B] bg-[#A1C2BD] 
                     hover:bg-[#708993] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-[#A1C2BD] transition duration-150 ease-in-out"
        >
          Login
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-[#708993]">
        Don’t have an account?{" "}

        <span
          className="font-medium text-[#19183B] hover:text-[#A1C2BD] cursor-pointer transition-colors"
          onClick={() => navigate("/signup")}
        >
          Sign up
        </span>
      </p>
    </div>
  </div>
);
}
