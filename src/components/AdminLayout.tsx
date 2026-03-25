import { useAuth } from "@/contexts/AuthContext";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, UserCheck, CreditCard, LogOut, Bot, BarChart3 } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Дашборд" },
  { to: "/bot-users", icon: Bot, label: "Пользователи бота" },
  { to: "/partners", icon: Users, label: "Партнёры" },
  { to: "/leads", icon: UserCheck, label: "Лиды" },
  { to: "/payouts", icon: CreditCard, label: "Выплаты" },
  { to: "/analytics", icon: BarChart3, label: "Аналитика" },
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
      <aside className="w-64 bg-sidebar-background text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="p-6">
          <h2 className="text-lg font-bold text-sidebar-primary-foreground">🤝 CRM Партнёрка</h2>
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
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
