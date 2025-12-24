import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function NotFoundPage() {
  const { t, i18n } = useTranslation("notfound");

  useEffect(() => {
    const browserLang = navigator.language;

    if (browserLang.startsWith("zh")) {
      i18n.changeLanguage("zh-CN");
    } else {
      i18n.changeLanguage("en");
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-destructive">
            404
          </CardTitle>
          <CardDescription className="text-lg">
            {t("pageNotFound")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            {t("pageNotFoundDescription")}
          </p>
          <Button asChild>
            <Link to="/">{t("returnHome")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
