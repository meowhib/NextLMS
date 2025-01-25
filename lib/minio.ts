import { Client } from "minio";

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ADMIN_USER || "",
  secretKey: process.env.MINIO_ADMIN_PASSWORD || "",
});

export const bucketName = "courses"; 