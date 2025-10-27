import React, { memo } from "react";
import { ChevronLeft, Bell, Award, Sun, Moon, Monitor, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAutoLogin } from "@/hooks/useAutoLogin";
import { useThemeContext } from "@/contexts/ThemeContext";
import { NAV_ITEMS } from "@/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = memo(() => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthContext();
  const { theme, setTheme, resolvedTheme } = useThemeContext();
  
  // Auto login in development
  const { user: autoUser, isAuthenticated: autoIsAuthenticated } = useAutoLogin();
  
  // Use auto-login data in development
  const currentUser = import.meta.env.DEV ? autoUser : user;
  const currentIsAuthenticated = import.meta.env.DEV ? autoIsAuthenticated : isAuthenticated;
  
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path) && path !== "#";
  };

  const handleLogout = async () => {
    await logout();
  };

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor className="h-5 w-5" />;
    return resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="flex h-14 items-center px-4">
        <Button variant="ghost" size="icon" className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <nav className="flex flex-1 items-center space-x-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`relative text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.path)
                  ? "text-foreground after:absolute after:bottom-[-14px] after:left-0 after:h-0.5 after:w-full after:bg-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
              {item.hasDropdown && <span className="ml-1">▾</span>}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {getThemeIcon()}
          </Button>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">3</Badge>
          </Button>
          
          {currentIsAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.username} />
                    <AvatarFallback>{currentUser?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{currentUser?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
          
          <Button variant="ghost" className="text-primary hover:text-primary">
            Premium
          </Button>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;