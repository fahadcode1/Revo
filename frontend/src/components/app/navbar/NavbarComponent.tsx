import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Overview", path: "/dashboard" },
    { name: "Recovery", path: "/recovery" },
    { name: "Customers", path: "/customers" },
    { name: "Management", path: "/Management" },
    { name: "Activity", path: "/activity" },
  ];

  return (
    <nav className="w-full border-b border-[#292929] bg-[#111111]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <div
          onClick={() => navigate("/dashboard")}
          className="flex cursor-pointer items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">
            R
          </div>

          <span className="text-lg font-semibold text-white">
            Revo
          </span>
        </div>

        {/* Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[#242424] text-white"
                    : "text-[#8f8f8f] hover:bg-[#1d1d1d] hover:text-white"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-xs text-[#666]">AI Agent</p>
            <p className="text-sm text-white">Revo</p>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#252525] text-xs font-medium text-white">
            R
          </div>
        </div>

      </div>
    </nav>
  );
}