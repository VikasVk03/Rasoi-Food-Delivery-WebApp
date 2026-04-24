export const getDayKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

export const buildSalesSeries = (orders) => {
  const map = new Map();
  orders.forEach((order) => {
    const key = getDayKey(order.deliveredAt || order.createdAt);
    if (!map.has(key)) {
      map.set(key, { day: key, orders: 0, sales: 0 });
    }
    const current = map.get(key);
    current.orders += 1;
    current.sales += Number(order.totalPrice || 0);
  });
  return [...map.values()].sort((a, b) => a.day.localeCompare(b.day));
};

export const buildEarningSeries = (orders, percentage) => {
  const map = new Map();
  orders.forEach((order) => {
    const key = getDayKey(order.deliveredAt || order.createdAt);
    if (!map.has(key)) {
      map.set(key, { day: key, delivered: 0, earning: 0 });
    }
    const current = map.get(key);
    current.delivered += 1;
    current.earning += Number(order.totalPrice || 0) * percentage;
  });
  return [...map.values()].sort((a, b) => a.day.localeCompare(b.day));
};
