import React, { useState } from 'react';
import { Layout, Menu, Breadcrumb, Dropdown, Avatar } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    DashboardOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import { adminMenuItems } from '../config/menu';
import styles from './AdminLayout.module.css';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useUser();

    // Generate breadcrumb from current path
    const generateBreadcrumb = () => {
        const pathSnippets = location.pathname.split('/').filter((i) => i);
        return pathSnippets.map((snippet, index) => {
            const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
            const isLast = index === pathSnippets.length - 1;

            // Capitalize and format breadcrumb text
            const text = snippet
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            return {
                title: isLast ? text : <a onClick={() => navigate(url)}>{text}</a>
            };
        });
    };

    const breadcrumbItems = generateBreadcrumb();

    // Convert menu items to Ant Design Menu format
    const getMenuItem = (item) => {
        if (item.children) {
            return {
                key: item.key,
                icon: item.icon ? React.createElement(item.icon) : null,
                label: item.label,
                children: item.children.map((child) => ({
                    key: child.key,
                    label: child.label,
                })),
            };
        }

        return {
            key: item.key,
            icon: item.icon ? React.createElement(item.icon) : null,
            label: item.label,
        };
    };

    const menuItems = adminMenuItems.map(getMenuItem);

    // Find selected and open keys
    const findSelectedKeys = () => {
        const path = location.pathname;

        // Check exact match first
        for (const item of adminMenuItems) {
            if (item.path === path) {
                return [item.key];
            }

            // Check children
            if (item.children) {
                for (const child of item.children) {
                    if (child.path === path) {
                        return [child.key];
                    }
                }
            }
        }

        // Default to dashboard
        return ['/admin'];
    };

    const findOpenKeys = () => {
        const path = location.pathname;
        const openKeys = [];

        for (const item of adminMenuItems) {
            if (item.children) {
                for (const child of item.children) {
                    if (child.path === path) {
                        openKeys.push(item.key);
                    }
                }
            }
        }

        return openKeys;
    };

    const handleMenuClick = ({ key }) => {
        // Find the menu item to get its path
        let targetPath = key;

        const findPath = (items) => {
            for (const item of items) {
                if (item.key === key && item.path) {
                    targetPath = item.path;
                    return true;
                }
                if (item.children) {
                    const found = findPath(item.children);
                    if (found) return true;
                }
            }
            return false;
        };

        findPath(adminMenuItems);
        navigate(targetPath);
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile Settings',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'System Settings',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <Layout className={styles.adminLayout}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                breakpoint="lg"
                onBreakpoint={(broken) => {
                    setCollapsed(broken);
                }}
            >
                <div className={styles.logo}>
                    {collapsed ? (
                        <DashboardOutlined />
                    ) : (
                        <h3 style={{ margin: 0, color: 'white' }}>Rima Tours Admin</h3>
                    )}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={findSelectedKeys()}
                    defaultOpenKeys={findOpenKeys()}
                    items={menuItems}
                    onClick={handleMenuClick}
                />
            </Sider>

            <Layout>
                <Header className={styles.header}>
                    <div className={styles.headerLeft}>
                        {React.createElement(
                            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                            {
                                className: styles.trigger,
                                onClick: () => setCollapsed(!collapsed),
                            }
                        )}
                        <Breadcrumb
                            className={styles.breadcrumb}
                            items={breadcrumbItems}
                        />
                    </div>

                    <div className={styles.headerRight}>
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <div>
                                <Avatar icon={<UserOutlined />} size="small" />
                                <span className={styles.username}>
                                    {user?.username || 'Admin'}
                                </span>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                <Content className={styles.content}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
