
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";


export async function POST(request: NextRequest) {
  const { data,creditsToBuyAmount,userId } = (await request.json()) 
  await db.transaction.create({data:{
    orderCreationId: data.orderCreationId,
    razorpayPaymentId: data.razorpayPaymentId,
    razorpayOrderId: data.razorpayOrderId,
    razorpaySignature: data.razorpaySignature,
    credits: creditsToBuyAmount,
    userId: userId
  }})
  await db.user.update({where:{id:userId},data:{credits: { increment: creditsToBuyAmount }}})

  return NextResponse.json({ status: 200 });
}
