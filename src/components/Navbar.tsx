import { Link, useLocation } from "react-router-dom";
import { Brain, LogOut, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const publicNavItems = [
  { path: "/", label: "Home" },
  { path: "/market-insights", label: "Market Insights" },
];

const protectedNavItems = [
  { path: "/advisor", label: "Get Advice" },
  { path: "/portfolio", label: "Portfolio" },
  { path: "/analytics", label: "Analytics" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  const navItems = user ? [...publicNavItems, ...protectedNavItems] : publicNavItems;

  return (
    <nav className="nav-glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">IntelliFund</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                pathname === item.path
                  ? "bg-primary/15 text-primary glow-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <button
              onClick={signOut}
              className="ml-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          ) : (
            <div className="flex items-center gap-1 ml-2">
              <Link
                to="/auth"
                className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Login
              </Link>
              <Link
                to="/auth"
                className="btn-glow px-4 py-2 text-sm flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
