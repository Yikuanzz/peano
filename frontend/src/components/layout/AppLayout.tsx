/**
 * 应用主布局 - 桌面端紧凑侧边栏 + 移动端底部导航
 */
import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, Archive, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/userMediaQuery";
import { Button } from "@/components/ui/button";
import { Bird } from "lucide-react";

// 导航菜单配置
const menuItems = [
  {
    title: "时间轴",
    icon: Home,
    url: "/home",
  },
  {
    title: "归档",
    icon: Archive,
    url: "/archive",
  },
  {
    title: "我的",
    icon: User,
    url: "/profile",
  },
];

// 桌面端紧凑侧边栏
function DesktopSidebar({ currentPath }: { currentPath: string }) {
  return (
    <aside className="hidden md:flex w-20 flex-col items-center border-r bg-background py-4 gap-6">
      {/* Logo */}
      <Link to="/home" className="flex flex-col items-center gap-1 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-primary-foreground text-xl">
          <Bird />
        </div>
        <span className="text-[12px] font-medium text-muted-foreground">
          Peano
        </span>
      </Link>

      {/* 导航菜单 */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.url;

          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

// 移动端底部导航
function MobileBottomNav({ currentPath }: { currentPath: string }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-area-bottom">
      <div className="flex items-center justify-around px-2 pt-2 pb-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.url;

          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-2 transition-all min-w-[64px]",
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span className="text-[11px]">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* 桌面端侧边栏 */}
      <DesktopSidebar currentPath={location.pathname} />

      {/* 主内容区域 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 顶部标题栏（仅移动端） */}
        <header className="md:hidden sticky top-0 z-10 flex h-14 shrink-0 items-center justify-center border-b bg-background px-4">
          <h1 className="text-base font-semibold">
            {menuItems.find((item) => item.url === location.pathname)?.title ||
              "Peano"}
          </h1>
        </header>

        {/* 内容区域 */}
        <main
          className={cn(
            "flex-1 overflow-auto p-3 md:p-6",
            isMobile ? "pb-20" : ""
          )}
        >
          <Outlet />
        </main>
      </div>

      {/* 移动端底部导航 */}
      <MobileBottomNav currentPath={location.pathname} />
    </div>
  );
}
