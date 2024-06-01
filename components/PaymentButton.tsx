"use client";

import React, { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";
import { useSession } from "next-auth/react";

// Define types for props
interface PaymentButtonProps {
  amount: number;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ amount }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const makePayment = async () => {
    setIsLoading(true);

    // make an endpoint to get this key
    const key = process.env.RAZORPAY_KEY_ID;
    const response = await fetch(`/api/order/create?amount=${amount}`);
    const { order } = await response.json();

    const options = {
      key: key,
      name: session?.user?.email ?? "",
      currency: order.currency,
      amount: order.amount,
      order_id: order.id,
      modal: {
        ondismiss: function () {
          setIsLoading(false);
        },
      },
      handler: async function (response: any) {
        const res = await fetch("/api/order/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            email: session?.user?.email ?? "",
          }),
        });

        const result = await res.json();
        if (!result?.error) {
          // redirect to success page
          router.push("/success");
        }
      },
      prefill: {
        email: session?.user?.email ?? "",
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();

    paymentObject.on("payment.failed", function (response: any) {
      alert("Payment failed. Please try again.");
      setIsLoading(false);
    });
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="">
        <button
          className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
          type="submit"
          disabled={isLoading}
          onClick={makePayment}
        >
          Pay Now
        </button>
      </div>
    </Suspense>
  );
};

export default PaymentButton;
