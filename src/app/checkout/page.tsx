
"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { getCart, type CartItem } from "@/lib/cart";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      setError(error.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <PaymentElement />

      {error && (
        <p className="text-red-500 text-sm mt-4">{error}</p>
      )}

      <button
        onClick={handlePayment}
        disabled={!stripe || loading}
        className="w-full bg-[#ff9900] py-3 rounded-full font-semibold mt-6 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const items = getCart();
    setCart(items);

    if (items.length === 0) {
      setLoading(false);
      return;
    }

    const quantity = items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Payment setup failed");
        }

        setClientSecret(data.clientSecret);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Preparing checkout...
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <button
          onClick={() => router.push("/")}
          className="bg-[#ff9900] px-6 py-3 rounded-full"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="border-b pb-5 mb-5">
          {cart.map((item) => (
            <div
              key={`${item.id}-${item.color}`}
              className="flex justify-between gap-4 py-3"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">
                  {item.color} × {item.quantity}
                </p>
              </div>

              <p className="font-semibold whitespace-nowrap">
                £{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}

          <div className="flex justify-between font-bold text-lg mt-4">
            <span>Total</span>
            <span>£{subtotal.toFixed(2)}</span>
          </div>
        </div>

        <h2 className="text-xl font-semibold">
          Payment Details
        </h2>

        {error ? (
          <p className="text-red-500 mt-4">{error}</p>
        ) : clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <PaymentForm />
          </Elements>
        ) : null}
      </div>
    </main>
  );
}
