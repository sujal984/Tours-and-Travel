import { Layout } from "antd";
import React, { useState } from "react";
import Sidebar from "../common/Sidebar";
import HeaderComponent from "../common/HeaderComponent";

const { Sider, Header, Content } = Layout;

function WithSidebar({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        collapsedWidth={80}
        className="hidden md:block h-screen overflow-auto"
      >
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
        />
      </Sider>
      <Layout className="overflow-hidden h-screen">
        <Header>
          <HeaderComponent
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
          />
        </Header>
        <Content
          style={{ padding: 24 }}
          className="h-[calc(100vh - 70px)] overflow-auto bg-[#f1f1f1]"
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default WithSidebar;
