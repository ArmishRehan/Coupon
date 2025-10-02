
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
    const navigate = useNavigate();
return (
  <div>
    <button
      onClick={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }}
      className="btn"
  
    >
      Logout
    </button>
  </div>
);

}