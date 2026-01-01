import {
    DashboardOutlined,
    UserOutlined,
    CompassOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    CarOutlined,
    UnorderedListOutlined,
    DollarOutlined,
    TagsOutlined,
    FormOutlined,
    CreditCardOutlined,
    TransactionOutlined,
    StarOutlined,
    MessageOutlined,
    FileTextOutlined,
} from '@ant-design/icons';

/**
 * Admin sidebar menu configuration
 * Each item can have sub-items for nested navigation
 */
export const adminMenuItems = [
    {
        key: '/admin',
        icon: DashboardOutlined,
        label: 'Dashboard',
        path: '/admin',
    },
    {
        key: 'users',
        icon: UserOutlined,
        label: 'User Management',
        path: '/admin/users',
    },
    {
        key: 'tour-management',
        icon: CompassOutlined,
        label: 'Tour Management',
        children: [
            {
                key: '/admin/tours',
                label: 'Tour Packages',
                path: '/admin/tours',
            },
            {
                key: '/admin/destinations',
                label: 'Destinations',
                path: '/admin/destinations',
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
            {
                key: '/admin/itineraries',
                label: 'Itineraries',
                path: '/admin/itineraries',
            },
        ],
    },
    {
        key: '/admin/bookings',
        icon: UnorderedListOutlined,
        label: 'Booking Management',
        path: '/admin/bookings',
    },
    {
        key: 'pricing-offers',
        icon: DollarOutlined,
        label: 'Pricing & Offers',
        children: [
            {
                key: '/admin/pricings',
                label: 'Pricing',
                path: '/admin/pricings',
            },
            {
                key: '/admin/offers',
                label: 'Offers & Discounts',
                path: '/admin/offers',
            },
            {
                key: '/admin/seasons',
                label: 'Seasons',
                path: '/admin/seasons',
            },
        ],
    },
    {
        key: '/admin/custom-packages',
        icon: FormOutlined,
        label: 'Custom Packages',
        path: '/admin/custom-packages',
    },
    {
        key: 'payments-refunds',
        icon: CreditCardOutlined,
        label: 'Payments & Refunds',
        children: [
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
        key: 'reviews-inquiries',
        icon: StarOutlined,
        label: 'Reviews & Inquiries',
        children: [
            {
                key: '/admin/reviews',
                label: 'Reviews',
                path: '/admin/reviews',
            },
            {
                key: '/admin/inquiries',
                label: 'Inquiries',
                path: '/admin/inquiries',
            },
        ],
    },
];

export default adminMenuItems;
