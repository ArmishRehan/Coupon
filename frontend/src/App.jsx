import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateCoupon from "./pages/CreateCoupon";
import CreatorDashboard from "./pages/CreatorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EditCoupon from "./pages/EditCoupon";
import StoreUserDashboard from "./pages/StoreUserDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create-coupon" element={<CreateCoupon />} />
        <Route path="/Creator-Dashboard" element={<CreatorDashboard />} />
        <Route path="/StoreUser-Dashboard" element={<StoreUserDashboard />} />
        <Route path="/Admin-Dashboard" element={<AdminDashboard />} />
        <Route path="/edit-coupon/:id" element={<EditCoupon />} />
      </Routes>
    </Router>
  );
}

export default App;
