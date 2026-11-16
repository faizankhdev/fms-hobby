"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { clearCart } from "@/lib/cart";
import Link from "next/link";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const clientSecret = new URLSearchParams(
        window.location.search
      ).get("payment_intent_client_secret");

      if (!clientSecret) {
        setStatus("Payment information not found.");
        return;
      }

      const stripe = await stripePromise;

      if (!stripe) {
        setStatus("Unable to connect to Stripe.");
        return;
      }

      const { paymentIntent, error } =
        await stripe.retrievePaymentIntent(clientSecret);

      if (error || !paymentIntent) {
        setStatus("Unable to verify payment.");
        return;
      }

      if (paymentIntent.status === "succeeded") {
        clearCart();
        setStatus("success");
      } else {
        setStatus("Payment was not successful.");
      }
    };

    verifyPayment();
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f7f8] flex items-center justify-center p-5">
      <div className="bg-white rounded-xl shadow-sm p-10 text-center max-w-md w-full">
        {status === "success" ? (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold">
              Payment Successful!
            </h1>
            <p className="text-gray-500 mt-3">
              Thank you for your order. Your payment has been confirmed.
            </p>
            <Link
              href="/"
              className="inline-block mt-7 bg-[#ff9900] px-8 py-3 rounded-full font-semibold"
            >
              Continue Shopping
            </Link>
          </>
        ) : (
          <p>{status}</p>
        )}
      </div>
    </main>
  );
}