import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettingsStore } from "@/stores/settings-store";
import type { Language } from "@/stores/settings-store";

export function LanguageToggle() {
  const { t, i18n } = useTranslation("Settings");
  const { language, setLanguage } = useSettingsStore();

  const handleChange = (value: string) => {
    const lang = value as Language;
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button size="icon" variant="ghost">
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuRadioGroup onValueChange={handleChange} value={language}>
          <DropdownMenuRadioItem value="tr">
            {t("turkish")}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="en">
            {t("english")}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
