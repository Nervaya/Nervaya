export const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/account",
  "/supplements/cart",
  "/supplements/checkout",
] as const;

export const ADMIN_ROUTES = [
  "/admin",
  "/admin/therapists",
  "/admin/settings",
  "/admin/users",
  "/admin/billing",
  "/admin/supplements",
] as const;

export const AUTH_ROUTES = ["/login", "/signup"] as const;

// Common redirect routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  ADMIN_DASHBOARD: "/admin/dashboard",
  SUPPLEMENTS: "/supplements",
  CART: "/supplements/cart",
  CHECKOUT: "/supplements/checkout",
} as const;
