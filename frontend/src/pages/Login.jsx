import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(""); // <-- error state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error on typing
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
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "admin") {
          navigate("/Admin-Dashboard");
        } else if (data.user.role === "creator") {
          navigate("/Creator-Dashboard");
        } else if (data.user.role === "store user") {
          navigate("/StoreUser-Dashboard");
        }
      } else {
        // Show incorrect credentials error
        setError(data.msg || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
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
                     shadow-xl rounded-2xl "
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-light mb-8 text-center text-primary">
            <span className="font-semibold">Welcome</span> Back!
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
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
            </div>

            {/* Password */}
            <div>
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
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.p
                className="text-sm text-red-600 font-medium text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex justify-center">
                <button type="submit" className="btn">
                  Login
                </button>
              </div>
            </motion.div>
          </form>

          {/* Signup link */}
          <motion.p
            className="mt-6 text-sm text-center text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            Don’t have an account?{" "}
            <span
              className="font-medium text-primary hover:text-secondary cursor-pointer transition-colors"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </span>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
