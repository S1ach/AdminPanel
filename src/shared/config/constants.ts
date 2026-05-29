export const USER_ROLES = ['admin', 'user', 'manager'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['active', 'banned'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const ORDER_PAYMENT_STATUSES = ['paid', 'pending', 'failed'] as const;
export type OrderPaymentStatus = (typeof ORDER_PAYMENT_STATUSES)[number];

export const ORDER_DELIVERY_STATUSES = ['shipped', 'processing', 'delivered'] as const;
export type OrderDeliveryStatus = (typeof ORDER_DELIVERY_STATUSES)[number];

export const PRODUCT_STATUSES = ['in_stock', 'out_of_stock'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Books',
  'Toys',
  'Food',
  'Health',
] as const;

export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50] as const;
