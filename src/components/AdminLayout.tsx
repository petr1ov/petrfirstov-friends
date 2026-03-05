import { useAuth } from "@/contexts/AuthContext";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, UserCheck, CreditCard, LogOut } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Дашборд" },
  { to: "/partners", icon: Users, label: "Партнёры" },
  { to: "/leads", icon: UserCheck, label: "Лиды" },
  { to: "/payouts", icon: CreditCard, label: "Выплаты" },
];

const AdminLayout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar-background text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="p-6">
          <h2 className="text-lg font-bold text-sidebar-primary-foreground">🤝 Партнёрка</h2>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Админ-панель</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3">
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
