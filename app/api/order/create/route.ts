import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { v4 as uuid } from "uuid";

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const totalAmount = Number(searchParams.get("amount")); // in paisa

  const amount = totalAmount * 100;
  const options = {
    amount: amount.toString(),
    currency: "INR",
    receipt: uuid(),
  };

  const order = await instance.orders.create(options);
  return NextResponse.json({ message: "success", order });
}