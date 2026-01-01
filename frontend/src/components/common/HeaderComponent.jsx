import { useUser } from "../../context/userContext";

import { Button, Grid, Avatar, Dropdown, Tooltip } from "antd";

import {
  UserOutlined,
  LogoutOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import { useNavigate } from "react-router";
import { routes } from "../../constant/route";
function HeaderComponent({
  collapsed,
  setCollapsed,
  drawerOpen,
  setDrawerOpen,
}) {
  const { logout, user, role } = useUser();

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    if (screens.md) {
      setCollapsed(!collapsed);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const userMenuItems = [
    {
      key: "profile",
      label: (
        <div className="flex items-center gap-3 pt-2 mt-2">
          <Avatar
            size="large"
            src={user?.userImage || user?.imageUrl || null}
            icon={<UserOutlined />}
            className="!bg-green-500 text-white"
          />
          <div className="flex flex-col justify-center gap-2">
            <h2 className="text-sm font-semibold leading-none">
              {user?.firstName + " " + user?.lastName}
            </h2>
            <p className="text-xs font-normal">{user?.email}</p>
          </div>
        </div>
      ),
    },

    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
      danger: true,
    },
  ];

  const renderAvatar = () => (
    <div className="flex items-center gap-3">
      {/* Avatar Section */}
      <Avatar
        size="large"
        src={user?.userImage || user?.imageUrl || null}
        icon={<UserOutlined />}
        style={{
          border: "1px solid #ccc",
          backgroundColor: "#f0f0f0",
        }}
      />
    </div>
  );

  return (
    <header className="flex items-center h-full  ">
      <div className="flex items-center justify-between  w-full text-white">
        <Button
          type="text"
          icon={
            collapsed ? (
              <RiSidebarUnfoldLine size={24} color="#fff" />
            ) : (
              <RiSidebarFoldLine size={24} color="#fff" />
            )
          }
          onClick={handleMenuToggle}
        />

        <div className="flex items-center gap-2">
          {!collapsed && (
            <div className="hidden md:block">
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                className="cursor-pointer"
              >
                {renderAvatar()}
              </Dropdown>
            </div>
          )}

          {(collapsed || !screens.md) && (
            <>
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                className="cursor-pointer"
              >
                {renderAvatar()}
              </Dropdown>
              <div className="flex flex-col justify-center gap-2 ">
                <h2 className="text-sm font-semibold leading-none">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-xs font-normal">{user?.email}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default HeaderComponent;
