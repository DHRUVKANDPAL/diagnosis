"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { CreditCard, Info, Phone, Zap } from "lucide-react";
import Script from "next/script";
import React from "react";
import { toast } from "sonner";

// Declare Razorpay on the window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Billing = () => {
  const { data } = api.project.getUserCredits.useQuery();
  const [phoneNo, setPhoneNo] = React.useState("");
  const [creditsToBuy, setCreditsToBuy] = React.useState<number[]>([50]);
  const creditsToBuyAmount = creditsToBuy[0]!;
  const price = creditsToBuyAmount * 10 - 1;
  const userId=data?.id;
  const refetch=useRefetch();
  const createOrderId = async () => {
    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: price * 100,
          currency: "INR",
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.error("There was a problem with your fetch operation:", error);
    }
  };
  const processPayment = async (e: any) => {
    e.preventDefault();
    try {
      const orderId: string = await createOrderId();
      const options = {
        key: process.env.key_id,
        amount: price * 100,
        currency: "INR",
        name: data?.firstName,
        description: "Thank You! Have a great time using our services.",
        order_id: orderId,
        handler: async function (response: any) {
          const data = {
            orderCreationId: orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          const result = await fetch("/api/verify", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
          });
          const res = await result.json();
          if (res.isOk) {
            // alert("payment succeed");
            const result = await fetch("/api/updateTransaction", {
              method: "POST",
              body: JSON.stringify({data,creditsToBuyAmount,userId}),
              headers: { "Content-Type": "application/json" },
            });
            toast.success("Payment success");
            refetch();
          }
          else {
            alert(res.message);
          }
        },
        prefill: {
          name: data?.firstName,
          email: data?.emailAddress,
          contact: phoneNo,
        },
        theme: {
          color: "#8b5cf6",
        },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        alert(response.error.description);
      });
      paymentObject.open();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Manage Your Credits</h1>
          <p className="mx-auto max-w-2xl text-gray-600">
            Power up your project indexing with Diagnosis. Purchase credits to
            index your files and supercharge your development workflow.
          </p>
        </div>

        <div className="flex h-full w-full items-center justify-center">
          <Card className="w-full max-w-5xl">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Billing</CardTitle>
                <Badge variant="secondary" className="text-sm">
                  <Zap className="mr-1 h-3 w-3" />
                  Instant Activation
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-sm text-gray-500">
                  You currently have{" "}
                  <span className="font-semibold text-gray-700">
                    {data?.credits} credits
                  </span>
                </p>
                <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-600">
                  Active
                </div>
              </div>

              <Card className="border-violet-200 bg-violet-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-violet-700" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-violet-700">
                        Each credit allows you to index 1 file in repository.
                      </p>
                      <p className="text-sm text-violet-600">
                        E.g. If your project has 100 files, you need 100 credits
                        to index it.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <label
                  htmlFor="phoneNo"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="phoneNo"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="credits"
                  className="text-sm font-medium text-gray-700"
                >
                  Select Credits to Buy
                </label>
                <Slider
                  id="credits"
                  defaultValue={[50]}
                  max={250}
                  min={5}
                  step={5}
                  onValueChange={(value) => setCreditsToBuy(value)}
                  value={creditsToBuy}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>5 credits</span>
                  <span>250 credits</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-between gap-4 rounded-lg bg-gray-50 p-4 sm:flex-row">
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-gray-700">
                    Selected Credits
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {creditsToBuyAmount} credits
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-sm font-medium text-gray-700">
                    Total Price
                  </p>
                  <p className="text-2xl font-bold text-gray-900">₹{price}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t p-6">
              <Button
                onClick={processPayment}
                className="w-full cursor-pointer"
                disabled={phoneNo.length != 10}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Buy {creditsToBuyAmount} credits for ₹{price}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Billing;
