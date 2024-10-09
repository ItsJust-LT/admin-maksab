"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import Cookies from "js-cookie";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export  function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const router = useRouter(); // Get the router instance

  React.useEffect(() => {
    // Initialize the theme from cookies if it exists
    const savedTheme = Cookies.get("theme");
    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark");
    } else {
      // Default to light if no theme is set
      setTheme("light");
    }
  }, [setTheme]);

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    Cookies.set("theme", newTheme, { expires: 365 }); // Set the cookie for 1 year
    router.refresh(); // Trigger a route refresh
  };

  return (
    <Button onClick={handleThemeToggle} variant="outline" size="icon">
      <SunIcon
        className={`h-6 w-6 transition-transform duration-200 ${theme === "dark" ? "rotate-0 scale-0" : "rotate-0 scale-100"
          }`}
      />
      <MoonIcon
        className={`absolute h-6 w-6 transition-transform duration-200 ${theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
          }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
