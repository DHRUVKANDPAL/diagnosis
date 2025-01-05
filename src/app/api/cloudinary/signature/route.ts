import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = "meetings";

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    cloudinary.config().api_secret!,
  );

  return NextResponse.json({
    signature,
    timestamp,
    cloud_name: cloudinary.config().cloud_name,
    api_key: cloudinary.config().api_key,
    folder,
  });
}
