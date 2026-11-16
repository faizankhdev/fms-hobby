
export type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  color: string;
  quantity: number;
};

const CART_KEY = "fms-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

export function addToCart(item: CartItem) {
  const cart = getCart();

  const existing = cart.find(
    (product) =>
      product.id === item.id && product.color === item.color
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function removeFromCart(id: string, color: string) {
  const cart = getCart().filter(
    (item) => !(item.id === id && item.color === color)
  );

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function updateCartQuantity(
  id: string,
  color: string,
  quantity: number
) {
  const cart = getCart().map((item) =>
    item.id === id && item.color === color
      ? { ...item, quantity }
      : item
  );

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}
