import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateCoupon from "./pages/CreateCoupon";
import ShowCoupons from "./pages/ShowCoupons";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-coupon" element={<CreateCoupon />} />
        <Route path="/coupons" element={<ShowCoupons />} />
        
        
      </Routes>
    </Router>
  );
}

export default App;
