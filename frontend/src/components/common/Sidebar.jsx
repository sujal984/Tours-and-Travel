import { Drawer, Menu, Popconfirm, Grid } from "antd";
import { useLocation, useNavigate } from "react-router";
import { MENU_ITEMS } from "../../constant/menu";
import { useState, useEffect } from "react";
import { useUser } from "../../context/userContext";

function Sidebar({ collapsed, setCollapsed, setDrawerOpen, drawerOpen }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout, role } = useUser();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [openKeys, setOpenKeys] = useState(() => {
    const stored = localStorage.getItem("sidebarOpenKeys");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpenKeys", JSON.stringify(openKeys));
  }, [openKeys]);

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleMenuClick = ({ key }) => {
    if (key && key !== "/logout") {
      navigate(key);
      if (screens.xs) {
        setDrawerOpen(false);
      }
    }
  };

  const filterByRole = (items) => {
    return items
      .filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(role);
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterByRole(item.children) : undefined,
      }));
  };

  const filteredMenuItems = filterByRole(MENU_ITEMS).map((item) => {
    if (item.key === "/logout") {
      return {
        ...item,
        onClick: undefined,
        label: (
          <Popconfirm
            title="Are you sure you want to logout?"
            onConfirm={handleLogout}
            okText="Yes"
            cancelText="No"
          >
            <div className="w-full h-full">{item.label}</div>
          </Popconfirm>
        ),
      };
    }

    return item;
  });
  return (
    <>
      <div className="flex flex-col ">
        <div className="h-17.5 flex items-center justify-center">
          {collapsed ? (
            <div className="flex items-center justify-center ">
              <img src="/logo.png" alt="logo" className="w-15 h-15" />
            </div>
          ) : (
            <div className="flex gap-2 items-center justify-center ">
              <img src="/logo.png" alt="logo" className="w-15 h-15" />
              <h1 className="font-bold text-2xl text-white">Inventory</h1>
            </div>
          )}
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[pathname]}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          items={filteredMenuItems}
          onClick={handleMenuClick}
        />
      </div>

      <Drawer
        title={
          <div className="flex gap-2 items-center justify-center ">
            <img src="/logo.png" alt="logo" className="w-15 h-15" />
            <h1 className="font-bold text-2xl">Inventory</h1>
          </div>
        }
        placement="left"
        closable={true}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={280}
      >
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[pathname]}
          items={filteredMenuItems}
          onClick={handleMenuClick}
        />
      </Drawer>
    </>
  );
}

export default Sidebar;
