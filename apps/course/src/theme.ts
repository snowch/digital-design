// The theme follows the system unless the learner picks one; the choice is kept in this browser.

import { useEffect, useState } from "react";

export type Theme = "auto" | "light" | "dark";
const KEY = "dd:v1:theme";

function read(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "auto";
  } catch {
    return "auto";
  }
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(read);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    try {
      if (theme === "auto") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, theme);
    } catch {
      // No storage: the choice lasts for the visit.
    }
  }, [theme]);
  return [theme, setTheme];
}
