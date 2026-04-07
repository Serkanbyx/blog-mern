import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-(--density-padding)">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
