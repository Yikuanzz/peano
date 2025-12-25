/**
 * 用户页 - 个人信息和热力图
 */
import { useState, useEffect } from "react";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router";
import { LogOut, Edit, Upload, Loader2, Settings } from "lucide-react";
import { getDailyItemCount } from "@/api/itemApi";
import { getUserInfo, updateUserInfo } from "@/api/userApi";
import { uploadFile } from "@/api/fileApi";
import type { DailyItemCountDTO } from "@/types/item";
import { Kanban, Bolt } from "lucide-react";

// 热力图组件
function ActivityHeatmap({ data }: { data: DailyItemCountDTO[] }) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 移动端显示最近 120 天，桌面端显示 365 天
  const daysToShow = isMobile ? 139 : 364;

  // 生成日期
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = daysToShow; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const dates = generateDates();
  // 将后端返回的日期格式统一转换为 YYYY-MM-DD
  const countMap = new Map(data.map((d) => [d.date.split("T")[0], d.count]));

  // 获取颜色
  const getColor = (count: number) => {
    if (count === 0) return "bg-muted";
    if (count <= 2) return "bg-green-200 dark:bg-green-900";
    if (count <= 4) return "bg-green-400 dark:bg-green-700";
    return "bg-green-600 dark:bg-green-500";
  };

  // 按周分组
  const weeks: Date[][] = [];
  let week: Date[] = [];

  // 找到第一个星期日
  const firstDate = new Date(dates[0]);
  const dayOfWeek = firstDate.getDay();

  // 填充第一周的空白
  for (let i = 0; i < dayOfWeek; i++) {
    week.push(new Date(""));
  }

  dates.forEach((dateStr) => {
    const date = new Date(dateStr);
    week.push(date);
    if (date.getDay() === 6 || dateStr === dates[dates.length - 1]) {
      // 填充最后一周的空白
      while (week.length < 7) {
        week.push(new Date(""));
      }
      weeks.push([...week]);
      week = [];
    }
  });

  const totalCount = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="text-sm md:text-base text-muted-foreground">
        {isMobile ? "最近" : "今年"}共创建{" "}
        <span className="text-lg md:text-xl font-semibold text-foreground">
          {totalCount}
        </span>{" "}
        条便签
      </div>

      <div className="w-full py-2 flex justify-center">
        <div className="flex gap-1 md:gap-[3px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1 md:gap-[3px]">
              {week.map((date, dayIndex) => {
                const isValid = !isNaN(date.getTime());
                const dateStr = isValid ? date.toISOString().split("T")[0] : "";
                const count = countMap.get(dateStr) || 0;

                return (
                  <div
                    key={dayIndex}
                    className={`h-3 w-3 md:h-[11px] md:w-[11px] rounded-sm ${
                      isValid ? getColor(count) : "bg-transparent"
                    } transition-all hover:ring-2 hover:ring-primary cursor-pointer`}
                    title={isValid ? `${dateStr}: ${count} 条` : ""}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
        <span>少</span>
        <div className="flex gap-1 md:gap-1.5">
          <div className="h-3 w-3 md:h-[11px] md:w-[11px] rounded-sm bg-muted" />
          <div className="h-3 w-3 md:h-[11px] md:w-[11px] rounded-sm bg-green-200 dark:bg-green-900" />
          <div className="h-3 w-3 md:h-[11px] md:w-[11px] rounded-sm bg-green-400 dark:bg-green-700" />
          <div className="h-3 w-3 md:h-[11px] md:w-[11px] rounded-sm bg-green-600 dark:bg-green-500" />
        </div>
        <span>多</span>
      </div>
    </div>
  );
}

// 编辑用户信息对话框
function EditProfileDialog({
  user,
  onUpdate,
}: {
  user: any;
  onUpdate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [nickName, setNickName] = useState(user?.nick_name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 重置表单数据
  React.useEffect(() => {
    if (open) {
      setNickName(user?.nick_name || "");
      setAvatar(user?.avatar || "");
    }
  }, [open, user]);

  // 处理文件选择
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片大小不能超过 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFile(file);
      setAvatar(result.file_url);
      toast.success("头像上传成功");
    } catch (error) {
      toast.error("头像上传失败");
    } finally {
      setIsUploading(false);
      // 清空 input，允许重新选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async () => {
    if (!nickName.trim()) {
      toast.error("请输入昵称");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserInfo({
        nick_name: nickName.trim(),
        avatar: avatar || undefined,
      });
      toast.success("更新成功");
      setOpen(false);
      onUpdate();
    } catch (error) {
      toast.error("更新失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs md:text-sm">
          <Edit className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
          <span className="hidden sm:inline">编辑信息</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] md:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-base md:text-lg">
            编辑个人信息
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm">
            更新你的个人资料
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 md:space-y-4 py-3 md:py-4">
          <div className="space-y-2">
            <Label htmlFor="nickName" className="text-sm">
              昵称
            </Label>
            <Input
              id="nickName"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              placeholder="请输入昵称"
              className="text-sm md:text-base"
            />
          </div>

          {/* 头像上传 */}
          <div className="space-y-2">
            <Label className="text-sm">头像</Label>
            <div className="flex flex-col items-center gap-4">
              {/* 头像预览 */}
              <Avatar className="h-20 w-20 md:h-24 md:w-24">
                <AvatarImage src={avatar} alt="预览" />
                <AvatarFallback className="text-2xl">
                  {nickName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              {/* 上传按钮 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {avatar ? "更换头像" : "上传头像"}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                支持 JPG、PNG 格式，大小不超过 5MB
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            className="text-xs md:text-sm"
            disabled={isSubmitting || isUploading}
          >
            取消
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="text-xs md:text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                保存中...
              </>
            ) : (
              "保存"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 主页面
export default function Profile() {
  const { user, clearUser, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [heatmapData, setHeatmapData] = useState<DailyItemCountDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // 并行获取用户信息和热力图数据
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);

      const [heatmapResult, userInfoResult] = await Promise.allSettled([
        getDailyItemCount({
          date_start: oneYearAgo.toISOString().split("T")[0],
          date_end: today.toISOString().split("T")[0],
        }),
        getUserInfo(),
      ]);

      // 处理热力图数据
      if (heatmapResult.status === "fulfilled") {
        setHeatmapData(heatmapResult.value.daily_item_counts || []);
      }

      // 更新用户信息
      if (userInfoResult.status === "fulfilled") {
        updateUser(userInfoResult.value);
      }
    } catch (error) {
      toast.error("加载数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  const handleUpdate = async () => {
    // 重新获取用户信息
    try {
      const userInfo = await getUserInfo();
      updateUser(userInfo);
    } catch (error) {
      toast.error("获取用户信息失败");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      {/* 用户信息卡片 */}
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-base md:text-lg">个人信息</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-3 md:gap-4">
            <Avatar className="h-16 w-16 md:h-20 md:w-20">
              <AvatarImage src={user?.avatar} alt={user?.nick_name} />
              <AvatarFallback>{user?.nick_name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h2 className="text-lg md:text-xl font-semibold truncate">
                {user?.nick_name}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                @{user?.username}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <EditProfileDialog user={user} onUpdate={handleUpdate} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-xs md:text-sm flex-1 sm:flex-none"
              >
                <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden sm:inline">退出登录</span>
                <span className="sm:hidden">退出</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 活动热力图 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Kanban />
            <CardTitle className="text-base md:text-lg">创建活动统计</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 md:px-8 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 md:py-8">
              <div className="text-sm text-muted-foreground">加载中...</div>
            </div>
          ) : (
            <ActivityHeatmap data={heatmapData} />
          )}
        </CardContent>
      </Card>

      {/* 设置卡片 */}
      <Card className="hidden md:block">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Bolt />
            <CardTitle className="text-base md:text-lg">设置</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6 md:p-6 pt-0">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-medium">主题</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  切换明暗主题
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-xs md:text-sm shrink-0"
              >
                敬请期待
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
