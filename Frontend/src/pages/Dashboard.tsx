import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    navigate("/signin");
    return;
  }
  return (
    <div>
      <Navbar />
    </div>
  );
};

export default Dashboard;
