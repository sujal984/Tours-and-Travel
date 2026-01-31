export const endpoints = {
  // Authentication
  ADMIN_LOGIN: "/auth/admin/login/",
  USER_REGISTER: "/auth/register/",
  LOGIN: "/auth/login/",
  LOGOUT: "/auth/logout/",
  ADMIN_LOGOUT: "/auth/logout/",
  GET_USER: "/auth/me/",
  VERIFY_TOKEN: "/auth/verify/",

  // Tours
  GET_ALL_TOURS: "/tours/",
  GET_TOUR_DETAIL: (id) => `/tours/${id}/`,
  GET_TOURS_BY_TYPE: (type) => `/tours/?type=${type}`,
  GET_TOUR_PACKAGES: (id) => `/tours/${id}/packages/`,
  SEARCH_TOURS: "/tours/search/",

  // Destinations
  GET_DESTINATIONS: "/tours/destinations/",
  GET_DESTINATION_DETAIL: (id) => `/tours/destinations/${id}/`,
  CREATE_DESTINATION: "/tours/destinations/",
  UPDATE_DESTINATION: (id) => `/tours/destinations/${id}/`,
  DELETE_DESTINATION: (id) => `/tours/destinations/${id}/`,

  // Hotels
  GET_HOTELS: "/tours/hotels/",
  GET_HOTEL_DETAIL: (id) => `/tours/hotels/${id}/`,
  CREATE_HOTEL: "/tours/hotels/",
  UPDATE_HOTEL: (id) => `/tours/hotels/${id}/`,
  DELETE_HOTEL: (id) => `/tours/hotels/${id}/`,

  // Vehicles
  GET_VEHICLES: "/tours/vehicles/",
  GET_VEHICLE_DETAIL: (id) => `/tours/vehicles/${id}/`,

  // Offers
  GET_OFFERS: "/tours/offers/",
  GET_OFFER_DETAIL: (id) => `/tours/offers/${id}/`,
  GET_CURRENT_OFFERS: "/tours/offers/current/",

  // Inquiries
  SUBMIT_INQUIRY: "/tours/inquiries/",
  GET_INQUIRIES: "/tours/inquiries/",
  GET_INQUIRY_DETAIL: (id) => `/tours/inquiries/${id}/`,
  ASSOCIATE_ANONYMOUS_INQUIRIES: "/tours/inquiries/associate_anonymous/",
  ADMIN_RESPOND_INQUIRY: (id) => `/tours/inquiries/${id}/admin_response/`,

  // Custom Packages
  CREATE_CUSTOM_PACKAGE: "/tours/custom-packages/",
  GET_CUSTOM_PACKAGES: "/tours/custom-packages/",
  GET_CUSTOM_PACKAGE_DETAIL: (id) => `/tours/custom-packages/${id}/`,
  CONVERT_CUSTOM_PACKAGE_TO_BOOKING: (id) => `/tours/custom-packages/${id}/convert_to_booking/`,

  // Seasons
  GET_SEASONS: "/tours/seasons/",
  GET_SEASON_DETAIL: (id) => `/tours/seasons/${id}/`,

  // Pricing
  GET_PRICINGS: "/tours/pricings/",
  GET_PRICING_DETAIL: (id) => `/tours/pricings/${id}/`,

  // Users (Admin or Profile)
  GET_ALL_USERS: "/users/",
  UPDATE_PROFILE: "/users/profile/",
  CHANGE_PASSWORD: "/users/change_password/",
  DELETE_ACCOUNT: (id) => `/users/${id}/`,
  UPDATE_USER: (id) => `/users/${id}/`,

  // Bookings
  GET_BOOKINGS: "/bookings/",
  CREATE_BOOKING: "/bookings/",
  GET_BOOKING_DETAIL: (id) => `/bookings/${id}/`,
  UPDATE_BOOKING: (id) => `/bookings/${id}/`,
  CANCEL_BOOKING: (id) => `/bookings/${id}/cancel/`,
  GET_BOOKING_REFUND_POLICY: (id) => `/bookings/${id}/refund_policy/`,

  // Payments
  CREATE_PAYMENT: "/payments/",
  GET_PAYMENTS: "/payments/",
  GET_PAYMENT_DETAIL: (id) => `/payments/${id}/`,

  // Refunds
  GET_REFUNDS: "/payments/refunds/",
  GET_REFUND_DETAIL: (id) => `/payments/refunds/${id}/`,
  CREATE_REFUND: "/payments/refunds/",

  // Invoices
  GET_INVOICES: "/payments/invoices/",
  GET_INVOICE_DETAIL: (id) => `/payments/invoices/${id}/`,
  CREATE_INVOICE: "/payments/invoices/",

  // Reviews
  CREATE_REVIEW: "/reviews/",
  ADD_REVIEW: "/reviews/",
  GET_REVIEWS: "/reviews/",
  GET_REVIEW_DETAIL: (id) => `/reviews/${id}/`,
  GET_TOUR_REVIEWS: (tourId) => `/reviews/?tour=${tourId}`,

  // Misc / Missing Backend (Placeholders)
  GET_SEASONS: "/tours/seasons/",
  GET_SEASON_DETAIL: (id) => `/tours/seasons/${id}/`,
  GET_REFUNDS: "/payments/refunds/",
  GET_REFUND_DETAIL: (id) => `/payments/refunds/${id}/`,
  GET_PRICINGS: "/tours/pricings/",
  GET_PRICING_DETAIL: (id) => `/tours/pricings/${id}/`,
  GET_INVOICES: "/payments/invoices/",
  GET_INVOICE_DETAIL: (id) => `/payments/invoices/${id}/`,
  GET_ITINERARIES: "/tours/itineraries/",
  GET_ITINERARY_DETAIL: (id) => `/tours/itineraries/${id}/`,
};
