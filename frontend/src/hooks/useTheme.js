import { useContext } from "react";
import { ThemeContext } from "../context/theme-context";

// const { theme, toggle } = useTheme();
export const useTheme = () => useContext(ThemeContext);