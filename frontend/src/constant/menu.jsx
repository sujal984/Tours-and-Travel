import { RiDashboard3Line } from "react-icons/ri";
import { LiaSignOutAltSolid } from "react-icons/lia";

export const MENU_ITEMS = [
  {
    key: "/",
    label: "Dashboard",
    icon: <RiDashboard3Line />,
    // roles: ["admin", "employee", "super_admin"],
  },

  {
    key: "/logout",
    type: "danger",
    label: "Logout",
    icon: <LiaSignOutAltSolid />,
    danger: true,
  },
];
