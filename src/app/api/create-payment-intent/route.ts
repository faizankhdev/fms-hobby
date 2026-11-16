
import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { quantity } = await request.json();

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      return NextResponse.json(
        { error: "Invalid quantity" },
        { status: 400 }
      );
    }

    // Fixed server-side product price: £179.95
    const amount = 17995 * quantity;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "gbp",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe Payment Error:", error);

    return NextResponse.json(
      { error: "Unable to create payment intent" },
      { status: 500 }
    );
  }
}
