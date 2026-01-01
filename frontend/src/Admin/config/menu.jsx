import {
  DashboardOutlined,
  CompassOutlined,
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  GiftOutlined,
  CreditCardOutlined,
  UndoOutlined,
  FileTextOutlined,
  SettingOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  CarOutlined,
  HotelOutlined,
  CalendarOutlined,
  MessageOutlined,
  StarOutlined,
} from '@ant-design/icons';

export const adminMenuItems = [
  {
    key: '/admin',
    label: 'Dashboard',
    icon: DashboardOutlined,
    path: '/admin',
  },
  {
    key: 'tours-management',
    label: 'Tours Management',
    icon: CompassOutlined,
    children: [
      {
        key: '/admin/tours',
        label: 'All Tours',
        path: '/admin/tours',
      },
      {
        key: '/admin/tours/create',
        label: 'Create Tour',
        path: '/admin/tours/create',
      },
      {
        key: '/admin/destinations',
        label: 'Destinations',
        path: '/admin/destinations',
      },
      {
        key: '/admin/itineraries',
        label: 'Itineraries',
        path: '/admin/itineraries',
      },
      {
        key: '/admin/hotels',
        label: 'Hotels',
        path: '/admin/hotels',
      },
      {
        key: '/admin/vehicles',
        label: 'Vehicles',
        path: '/admin/vehicles',
      },
    ],
  },
  {
    key: 'bookings-management',
    label: 'Bookings',
    icon: BookOutlined,
    children: [
      {
        key: '/admin/bookings',
        label: 'All Bookings',
        path: '/admin/bookings',
      },
      {
        key: '/admin/custom-packages',
        label: 'Custom Packages',
        path: '/admin/custom-packages',
      },
      {
        key: '/admin/inquiries',
        label: 'Inquiries',
        path: '/admin/inquiries',
      },
    ],
  },
  {
    key: 'financial-management',
    label: 'Financial',
    icon: DollarOutlined,
    children: [
      {
        key: '/admin/pricings',
        label: 'Pricing',
        path: '/admin/pricings',
      },
      {
        key: '/admin/payments',
        label: 'Payments',
        path: '/admin/payments',
      },
      {
        key: '/admin/refunds',
        label: 'Refunds',
        path: '/admin/refunds',
      },
      {
        key: '/admin/invoices',
        label: 'Invoices',
        path: '/admin/invoices',
      },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    icon: GiftOutlined,
    children: [
      {
        key: '/admin/offers',
        label: 'Offers',
        path: '/admin/offers',
      },
      {
        key: '/admin/seasons',
        label: 'Seasons',
        path: '/admin/seasons',
      },
      {
        key: '/admin/reviews',
        label: 'Reviews',
        path: '/admin/reviews',
      },
    ],
  },
  {
    key: '/admin/users',
    label: 'Users',
    icon: TeamOutlined,
    path: '/admin/users',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: SettingOutlined,
    children: [
      {
        key: '/admin/settings/general',
        label: 'General',
        path: '/admin/settings/general',
      },
      {
        key: '/admin/settings/email',
        label: 'Email Templates',
        path: '/admin/settings/email',
      },
    ],
  },
];

export default adminMenuItems;