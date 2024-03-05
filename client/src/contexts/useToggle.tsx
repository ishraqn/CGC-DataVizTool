import { useContext } from "react";
import { ToggleContext } from "./toggleContext";

export const useToggle = () => useContext(ToggleContext);
