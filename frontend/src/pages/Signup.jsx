import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "user" });
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
    <div className="flex items-center justify-center min-h-screen bg-gradient">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-[#A594F9]">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={form.username}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-200 shadow-sm 
                     focus:ring-[#A594F9] focus:border-[#A594F9] bg-white text-gray-900 placeholder-gray-400 transition"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-200 shadow-sm 
                     focus:ring-[#A594F9] focus:border-[#A594F9] bg-white text-gray-900 placeholder-gray-400 transition"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-200 shadow-sm 
                     focus:ring-[#A594F9] focus:border-[#A594F9] bg-white text-gray-900 placeholder-gray-400 transition"
              placeholder="Create a strong password"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              id="role"
              value={form.role}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 rounded-xl border border-gray-200 shadow-sm 
               focus:ring-[#A594F9] focus:border-[#A594F9] bg-white text-gray-900 transition"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>



          <button
            type="submit"
            className="btn-purple"
          >
            Sign up
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <span
            className="font-medium text-[#A594F9] hover:text-[#CDC1FF] cursor-pointer transition-colors"
            onClick={() => navigate("/login")}
          >
            Log in
          </span>
        </p>
      </div>
    </div>

  );
}
