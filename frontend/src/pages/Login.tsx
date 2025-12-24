import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { getUserInfo, login } from "@/api/userApi";
import { useNavigate } from "react-router";

function Login() {
  // 认证状态管理
  const { setUser, setTokens } = useAuthStore();
  // 控制密码是否显示
  const [showPassword, setShowPassword] = useState(false);
  // 导航
  const navigate = useNavigate();
  // 控制语言
  const [lang, setLang] = useState<"zh-CN" | "en">("en");

  useEffect(() => {
    const browserLang = navigator.language;

    if (browserLang.startsWith("zh")) {
      setLang("zh-CN");
      i18n.changeLanguage("zh-CN");
    } else {
      setLang("en");
      i18n.changeLanguage("en");
    }
  }, []);

  // 切换密码显示状态
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 国际化
  const { t, i18n } = useTranslation("login");

  // 定义 zod 校验规则
  const loginSchema = z.object({
    username: z
      .string({
        required_error: t("usernameRequired"),
      })
      .min(3, t("usernameTooShort"))
      .max(12, t("usernameTooLong")),
    password: z
      .string({
        required_error: t("passwordRequired"),
      })
      .min(8, t("passwordTooShort"))
      .max(12, t("passwordTooLong")),
  });

  // 登录
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // 校验数据
    const result = loginSchema.safeParse({
      username: username.trim(),
      password: password.trim(),
    });

    if (!result.success) {
      const firstError = result.error.issues?.[0];
      toast.error(firstError?.message || t("loginFailed"));
      return;
    }

    try {
      // 调用 API 去登录
      const response = await login(result.data);
      setTokens(response.access_token, response.refresh_token);

      // 获取用户信息
      const user = await getUserInfo();
      setUser(user);

      toast.success(t("loginSuccess", { nick_name: user.nick_name }));

      // 导航到首页
      navigate("/home");
    } catch (error: any) {
      toast.error(error.response.data.message || t("loginFailed"));
    }
  };

  return (
    <>
      <div className="flex justify-center items-center h-screen p-4">
        <Card className="w-md max-w-md md:max-w-lg lg:max-w-xl">
          <CardHeader>
            <div className="flex justify-end mb-4">
              <Tabs
                value={lang}
                onValueChange={(v: "zh-CN" | "en") => {
                  setLang(v);
                  i18n.changeLanguage(v);
                }}
              >
                <TabsList>
                  <TabsTrigger value="zh-CN" className="text-sm">
                    中文
                  </TabsTrigger>
                  <TabsTrigger value="en" className="text-sm">
                    English
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {t("title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} type="submit">
              <div className="flex flex-col gap-2 mb-4">
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-md font-medium">
                    {t("username")}
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder={t("usernamePlaceholder")}
                  />
                </div>
                <div className="grid gap-2 mb-4">
                  <Label htmlFor="password" className="text-md font-medium">
                    {t("password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("passwordPlaceholder")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={togglePasswordVisibility}
                      className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full" type="submit">
                  {t("login")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default Login;
