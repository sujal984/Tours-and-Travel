import Dashboard from "../Admin/component/Dashboard/View.jsx";
import Home from "../Customer/components/Home.jsx";
import Tours from "../Customer/components/Tours.jsx";
import TourDetail from "../Customer/components/TourDetail.jsx";
import About from "../Customer/components/About.jsx";
import Contact from "../Customer/components/Contact.jsx";
import Customization from "../Customer/components/Customization.jsx";
import Profile from "../Customer/components/Profile.jsx";
import MyBookings from "../Customer/components/MyBookings.jsx";
import Booking from "../Customer/components/Booking.jsx";
import AdminToursList from "../Admin/Tours/List.jsx";
import AdminTourForm from "../Admin/Tours/Form.jsx";
import AdminLogin from "../Admin/Auth/Login.jsx";
import UsersList from "../Admin/Users/List.jsx";
import BookingsList from "../Admin/Bookings/List.jsx";
import PricingsList from "../Admin/Pricings/List.jsx";
import OffersList from "../Admin/Offers/List.jsx";
import PaymentsList from "../Admin/Payments/List.jsx";
import RefundsList from "../Admin/Refunds/List.jsx";
import InvoicesList from "../Admin/Invoices/List.jsx";
import DestinationsList from "../Admin/Destinations/List.jsx";
import ItinerariesList from "../Admin/Itineraries/List.jsx";
import SeasonsList from "../Admin/Seasons/List.jsx";
import CustomPackagesList from "../Admin/CustomPackages/List.jsx";
import ReviewsList from "../Admin/Reviews/List.jsx";
import InquiriesList from "../Admin/Inquiries/List.jsx";
import HotelsList from "../Admin/Hotels/List.jsx";
import VehiclesList from "../Admin/Vehicles/List.jsx";

export const routes = {
  ADMIN_DASHBOARD: {
    path: "/admin",
    title: "DASHBOARD",
    withSidebar: true,
    component: Dashboard,
    public: true,
    requiredRole: "admin",
  },
  ADMIN_LOGIN: {
    path: "/admin/login",
    title: "Login",
    withSidebar: false,
    component: AdminLogin,
    public: true,
  },
  ADMIN_TOURS: {
    path: "/admin/tours",
    title: "Tours",
    withSidebar: true,
    component: AdminToursList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_USERS: {
    path: "/admin/users",
    title: "Users",
    withSidebar: true,
    component: UsersList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_BOOKINGS: {
    path: "/admin/bookings",
    title: "Bookings",
    withSidebar: true,
    component: BookingsList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_PRICINGS: {
    path: "/admin/pricings",
    title: "Pricings",
    withSidebar: true,
    component: PricingsList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_OFFERS: {
    path: "/admin/offers",
    title: "Offers",
    withSidebar: true,
    component: OffersList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_PAYMENTS: {
    path: "/admin/payments",
    title: "Payments",
    withSidebar: true,
    component: PaymentsList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_REFUNDS: {
    path: "/admin/refunds",
    title: "Refunds",
    withSidebar: true,
    component: RefundsList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_INVOICES: {
    path: "/admin/invoices",
    title: "Invoices",
    withSidebar: true,
    component: InvoicesList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_DESTINATIONS: {
    path: "/admin/destinations",
    title: "Destinations",
    withSidebar: true,
    component: DestinationsList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_ITINERARIES: {
    path: "/admin/itineraries",
    title: "Itineraries",
    withSidebar: true,
    component: ItinerariesList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_SEASONS: {
    path: "/admin/seasons",
    title: "Seasons",
    withSidebar: true,
    component: SeasonsList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_CUSTOM_PACKAGES: {
    path: "/admin/custom-packages",
    title: "Custom Packages",
    withSidebar: true,
    component: CustomPackagesList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_REVIEWS: {
    path: "/admin/reviews",
    title: "Reviews",
    withSidebar: true,
    component: ReviewsList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_INQUIRIES: {
    path: "/admin/inquiries",
    title: "Inquiries",
    withSidebar: true,
    component: InquiriesList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_HOTELS: {
    path: "/admin/hotels",
    title: "Hotels",
    withSidebar: true,
    component: HotelsList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_VEHICLES: {
    path: "/admin/vehicles",
    title: "Vehicles",
    withSidebar: true,
    component: VehiclesList,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_TOUR_CREATE: {
    path: "/admin/tours/create",
    title: "Create Tour",
    withSidebar: true,
    component: AdminTourForm,
    public: false,
    requiredRole: "admin",
  },
  ADMIN_TOUR_EDIT: {
    path: "/admin/tours/edit/:id",
    title: "Edit Tour",
    withSidebar: true,
    component: AdminTourForm,
    public: false,
    requiredRole: "admin",
  },
  HOME: {
    path: "/",
    title: "Rima Tours & Travels",
    withSidebar: false,
    component: Home,
    public: true,
  },
  TOURS: {
    path: "/tours",
    title: "Tours",
    withSidebar: false,
    component: Tours,
    public: true,
  },
  TOUR_DETAIL: {
    path: "/tours/:id",
    title: "Tour Details",
    withSidebar: false,
    component: TourDetail,
    public: true,
  },
  ABOUT: {
    path: "/about",
    title: "About Us",
    withSidebar: false,
    component: About,
    public: true,
  },
  CONTACT: {
    path: "/contact",
    title: "Contact Us",
    withSidebar: false,
    component: Contact,
    public: true,
  },
  CUSTOMIZATION: {
    path: "/customize-tour",
    title: "Customize Your Tour",
    withSidebar: false,
    component: Customization,
    public: true,
  },
  PROFILE: {
    path: "/profile",
    title: "My Profile",
    withSidebar: false,
    component: Profile,
    public: false,
    requiredRole: "customer",
  },
  MY_BOOKINGS: {
    path: "/my-bookings",
    title: "My Bookings",
    withSidebar: false,
    component: MyBookings,
    public: false,
    requiredRole: "customer",
  },
  BOOKING: {
    path: "/booking/:tourId",
    title: "Book Tour",
    withSidebar: false,
    component: Booking,
    public: false,
    requiredRole: "customer",
  },
};

export default routes;
