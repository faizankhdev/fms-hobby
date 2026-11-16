
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  type CartItem,
} from "@/lib/cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    setCart(getCart());
  }, []);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleRemove = (id: string, color: string) => {
    removeFromCart(id, color);
    setCart(getCart());
  };

  const handleQuantity = (
    id: string,
    color: string,
    quantity: number
  ) => {
    if (quantity < 1) return;

    updateCartQuantity(id, color, quantity);
    setCart(getCart());
  };

  return (
    <main className="min-h-screen bg-[#f7f7f8] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-lg">
            <h2 className="text-xl font-semibold">
              Your cart is empty
            </h2>
            <Link
              href="/collections/rc-cars-trucks"
              className="inline-block mt-5 bg-[#ff9900] px-7 py-3 rounded-full"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-5 rounded-lg">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.color}`}
                  className="flex gap-5 border-b py-5"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-28 h-28 object-contain"
                  />

                  <div className="flex-1">
                    <h2 className="font-semibold">
                      {item.title}
                    </h2>

                    <p className="text-sm text-gray-500 mt-2">
                      Color: {item.color}
                    </p>

                    <p className="text-[#ff4b24] font-semibold mt-2">
                      £{item.price.toFixed(2)}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() =>
                          handleQuantity(
                            item.id,
                            item.color,
                            item.quantity - 1
                          )
                        }
                        className="border px-3 py-1"
                      >
                        -
                      </button>

                      {item.quantity}

                      <button
                        onClick={() =>
                          handleQuantity(
                            item.id,
                            item.color,
                            item.quantity + 1
                          )
                        }
                        className="border px-3 py-1"
                      >
                        +
                      </button>

                      <button
                        onClick={() =>
                          handleRemove(item.id, item.color)
                        }
                        className="text-red-500 text-sm ml-3"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-lg h-fit">
              <h2 className="text-xl font-bold mb-5">
                Order Summary
              </h2>

              <div className="flex justify-between mb-4">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>

              <p className="text-sm text-gray-500 mb-5">
                Shipping and taxes calculated at checkout.
              </p>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-[#ff9900] py-3 rounded-full font-semibold"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/collections/rc-cars-trucks"
                className="block text-center text-sm mt-5 underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
