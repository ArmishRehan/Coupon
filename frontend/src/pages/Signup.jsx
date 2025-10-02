import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "store user",
  });
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
    <div className="min-h-screen bg-base flex flex-col">
      <motion.div
        className="flex-grow flex items-center justify-center px-4 py-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-full max-w-lg p-10 bg-base backdrop-blur-sm border border-secondary/60
                     shadow-xl rounded-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-light mb-8 text-center text-primary">
            <span className="font-semibold">Create</span> Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-primary mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-secondary/50 
                 rounded-lg text-sm font-semibold text-light focus:ring-2 
                 focus:ring-contrast focus:outline-none transition"
                placeholder="Enter your username"
                required
              />
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label className="block text-sm font-medium text-primary mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-secondary/50 
                 rounded-lg text-sm font-semibold text-light focus:ring-2 
                 focus:ring-contrast focus:outline-none transition"
                placeholder="Enter your email"
                required
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-primary mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-secondary/50 
                 rounded-lg text-sm font-semibold text-light focus:ring-2 
                 focus:ring-contrast focus:outline-none transition"
                placeholder="Create a strong password"
                required
              />
            </motion.div>

            {/* Role */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label className="block text-sm font-medium text-primary mb-1">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-secondary/50 
                  rounded-lg text-sm font-semibold text-light focus:ring-2 
                  focus:ring-contrast focus:outline-none transition"
              >
                <option value="store user">Store User</option>
                <option value="admin">Admin</option>
                <option value="creator">Creator</option>
              </select>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                type="submit"
                className="btn"
              >
                Sign up
              </button>
            </motion.div>
          </form>

          <p className="mt-6 text-sm text-center text-primary">
            Already have an account?{" "}
            <span
              className="font-medium text-primary hover:text-secondary cursor-pointer transition"
              onClick={() => navigate("/login")}
            >
              Log in
            </span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
