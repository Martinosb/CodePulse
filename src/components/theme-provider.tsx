"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";
type ThemeCtx = { theme: Theme; toggleTheme: () => void; setTheme: (t: Theme) => void };

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({
  children,
  initialTheme = "light",
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  // Sync from the value the no-flash script already applied to <html>.
  useEffect(() => {
    const current = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    setThemeState(current);
  }, []);

  const apply = useCallback((t: Theme) => {
    setThemeState(t);
    const root = document.documentElement;
    root.classList.toggle("dark", t === "dark");
    try {
      localStorage.setItem("cp-theme", t);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(
    () => apply(theme === "dark" ? "light" : "dark"),
    [theme, apply],
  );

  return (
    <Ctx.Provider value={{ theme, toggleTheme, setTheme: apply }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/** Inline script injected before paint to avoid a theme flash. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('cp-theme');if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`;
