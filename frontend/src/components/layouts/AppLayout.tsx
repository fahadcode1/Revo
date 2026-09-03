import { Outlet } from "react-router-dom";
import Navbar from "../app/navbar/NavbarComponent";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <Navbar />

      <main>
        <Outlet />
      </main>
    </div>
  );
}