import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "store user" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.msg);
        navigate("/login");
      } else {
        alert(data.msg || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

return (
  <div className="flex items-center justify-center min-h-screen bg-[#E7F2EF]">
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-[#708993]/30">
      <h2 className="text-3xl font-bold text-center text-[#19183B]">
        Create an Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-[#708993]"
          >
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            value={form.username}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 rounded-xl border border-[#708993]/50 shadow-sm 
                    focus:ring-[#A1C2BD] focus:border-[#A1C2BD] bg-white text-[#19183B] placeholder-[#708993] transition"
            placeholder="Enter your username"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#708993]"
          >
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 rounded-xl border border-[#708993]/50 shadow-sm 
                    focus:ring-[#A1C2BD] focus:border-[#A1C2BD] bg-white text-[#19183B] placeholder-[#708993] transition"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#708993]"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 rounded-xl border border-[#708993]/50 shadow-sm 
                    focus:ring-[#A1C2BD] focus:border-[#A1C2BD] bg-white text-[#19183B] placeholder-[#708993] transition"
            placeholder="Create a strong password"
            required
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-[#708993]">
            Role
          </label>
          <select
            name="role"
            id="role"
            value={form.role}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 rounded-xl border border-[#708993]/50 shadow-sm 
              focus:ring-[#A1C2BD] focus:border-[#A1C2BD] bg-white text-[#19183B] transition"
          >
            <option value="store user">Store User</option>
            <option value="admin">Admin</option>
            <option value="creator">Creator</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl 
                     shadow-md text-lg font-semibold text-[#19183B] bg-[#A1C2BD] 
                     hover:bg-[#708993] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-[#A1C2BD] transition duration-150 ease-in-out"
        >
          Sign up
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-[#708993]">
        Already have an account?{" "}
        <span
          className="font-medium text-[#19183B] hover:text-[#A1C2BD] cursor-pointer transition-colors"
          onClick={() => navigate("/login")}
        >
          Log in
        </span>
      </p>
    </div>
  </div>
);
}
