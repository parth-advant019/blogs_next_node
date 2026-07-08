import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

export const garageClient = new S3Client({
  endpoint: process.env.GARAGE_ENDPOINT, // e.g. http://garage-xxxx:3900
  region: "garage", // Garage doesn't care about region, but SDK requires one
  credentials: {
    accessKeyId: process.env.GARAGE_ACCESS_KEY!,
    secretAccessKey: process.env.GARAGE_SECRET_KEY!,
  },
  forcePathStyle: true, // required for S3-compatible services like Garage/MinIO
});

export const GARAGE_BUCKET = process.env.GARAGE_BUCKET!;
export const GARAGE_PUBLIC_URL = process.env.GARAGE_PUBLIC_URL!;
