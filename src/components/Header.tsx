import React, { memo } from "react";
import { ChevronLeft, Award, Sun, Moon, Monitor, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import { NAV_ITEMS } from "@/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = memo(() => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthContext();
  const { theme, setTheme, resolvedTheme } = useThemeContext();
  
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
              {'hasDropdown' in item && item.hasDropdown && <span className="ml-1">▾</span>}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {getThemeIcon()}
          </Button>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src="/default-avatar.png"
                      alt={user?.username}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || user?.username || 'U')}&background=21791f&color=fff&size=128`;
                      }}
                    />
                    <AvatarFallback>
                      {(user?.fullname || user?.username)?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullname || user?.username}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.systemRole}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Hồ sơ</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Cài đặt</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;