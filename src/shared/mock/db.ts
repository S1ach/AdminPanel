import { faker } from '@faker-js/faker/locale/ru';

// Seed for consistency
faker.seed(42);

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms + Math.random() * 400));

// ====== USERS ======
export interface MockUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'banned';
  registeredAt: string;
}

const users: MockUser[] = Array.from({ length: 87 }, (_, i) => ({
  id: i + 1,
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${i}`,
  role: faker.helpers.arrayElement(['admin', 'user', 'user', 'user', 'manager'] as const),
  status: faker.helpers.arrayElement(['active', 'active', 'active', 'banned'] as const),
  registeredAt: faker.date.between({ from: '2023-01-01', to: '2025-05-26' }).toISOString(),
}));

// ====== PRODUCTS ======
export interface MockProduct {
  id: number;
  sku: string;
  name: string;
  photo: string;
  category: string;
  price: number;
  stock: number;
  status: 'in_stock' | 'out_of_stock';
}

const categories = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Books',
  'Toys',
  'Food',
  'Health',
];

const products: MockProduct[] = Array.from({ length: 64 }, (_, i) => {
  const stock = faker.number.int({ min: 0, max: 200 });
  return {
    id: i + 1,
    sku: `SKU-${faker.string.alphanumeric(6).toUpperCase()}`,
    name: faker.commerce.productName(),
    photo: `https://picsum.photos/seed/prod${i}/200/200`,
    category: faker.helpers.arrayElement(categories),
    price: faker.number.int({ min: 100, max: 50000 }),
    stock,
    status: stock > 0 ? 'in_stock' : 'out_of_stock',
  };
});

// ====== ORDERS ======
export interface MockOrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

export interface MockOrder {
  id: number;
  client: string;
  clientEmail: string;
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  deliveryStatus: 'shipped' | 'processing' | 'delivered';
  date: string;
  items: MockOrderItem[];
  address: string;
}

const orders: MockOrder[] = Array.from({ length: 73 }, (_, i) => {
  const items = Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => {
    const p = faker.helpers.arrayElement(products);
    return {
      productId: p.id,
      name: p.name,
      quantity: faker.number.int({ min: 1, max: 3 }),
      price: p.price,
    };
  });
  return {
    id: 1000 + i,
    client: faker.person.fullName(),
    clientEmail: faker.internet.email().toLowerCase(),
    amount: items.reduce((s, it) => s + it.price * it.quantity, 0),
    paymentStatus: faker.helpers.arrayElement(['paid', 'paid', 'pending', 'failed'] as const),
    deliveryStatus: faker.helpers.arrayElement(['shipped', 'processing', 'delivered'] as const),
    date: faker.date.between({ from: '2024-06-01', to: '2025-05-26' }).toISOString(),
    items,
    address: faker.location.streetAddress(true),
  };
});

// ====== ANALYTICS ======
export interface MockAnalytics {
  revenue: number;
  revenueTrend: number;
  usersCount: number;
  usersTrend: number;
  ordersCount: number;
  ordersTrend: number;
  conversion: number;
  conversionTrend: number;
  revenueByMonth: { month: string; value: number }[];
  newVsChurned: { month: string; newUsers: number; churned: number }[];
  salesByCategory: { name: string; value: number }[];
  recentEvents: { id: number; text: string; time: string }[];
}

function buildAnalytics(): MockAnalytics {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return {
    revenue: 2_847_300,
    revenueTrend: 12.5,
    usersCount: users.length,
    usersTrend: 8.2,
    ordersCount: orders.length,
    ordersTrend: -3.1,
    conversion: 4.7,
    conversionTrend: 1.2,
    revenueByMonth: months.map((m) => ({
      month: m,
      value: faker.number.int({ min: 100000, max: 500000 }),
    })),
    newVsChurned: months.map((m) => ({
      month: m,
      newUsers: faker.number.int({ min: 20, max: 80 }),
      churned: faker.number.int({ min: 5, max: 30 }),
    })),
    salesByCategory: categories.map((c) => ({
      name: c,
      value: faker.number.int({ min: 500, max: 5000 }),
    })),
    recentEvents: Array.from({ length: 7 }, (_, j) => ({
      id: j,
      text: faker.helpers.arrayElement([
        `${faker.person.firstName()} купил "${faker.commerce.productName()}"`,
        `Новый пользователь: ${faker.person.fullName()}`,
        `Заказ #${1000 + faker.number.int(72)} доставлен`,
        `${faker.person.firstName()} оставил отзыв`,
        `Товар "${faker.commerce.productName()}" закончился`,
      ]),
      time: faker.date.recent({ days: 1 }).toISOString(),
    })),
  };
}

// ====== EXPORTS ======
export { users, products, orders, buildAnalytics, delay };
