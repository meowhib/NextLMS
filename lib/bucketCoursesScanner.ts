import * as Minio from "minio";
import { getNameAndIndex } from "@/lib/scanners";
var slugify = require("slugify");

const minioClient = new Minio.Client({
  endPoint: "http://192.168.1.5",
  port: 9000,
  useSSL: true,
  accessKey: "YOUR_ROOT_USER",
  secretKey: "YOUR_ROOT_PASSWORD",
});

async function listDirectories(
  bucketName: string,
  prefix: string
): Promise<string[]> {
  const stream = minioClient.listObjects(bucketName, prefix, true);
  const directories: string[] = [];

  for await (const obj of stream) {
    if (obj.prefix) {
      directories.push(obj.prefix);
    }
  }

  return directories;
}

async function listFiles(
  bucketName: string,
  prefix: string
): Promise<{ key: string; size: number }[]> {
  const stream = minioClient.listObjects(bucketName, prefix, false);
  const files: { key: string; size: number }[] = [];

  for await (const obj of stream) {
    if (obj.key && !obj.isDir) {
      files.push({ key: obj.key, size: obj.size });
    }
  }

  return files;
}
