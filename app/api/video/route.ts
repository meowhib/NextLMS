import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

const CHUNK_SIZE_IN_BYTES = 1000000; // 1 mb

export async function GET(req: NextRequest, res: NextResponse) {
  const range = req.headers.get("Range");

  if (!range) {
    return NextResponse.json(
      { error: "Range header is required" },
      { status: 400 }
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const lessonPath = searchParams.get("lessonPath");

  console.log("lessonPATH", lessonPath);
  const videoPath = `./public/courses/${lessonPath}`;

  console.log("videoPath", videoPath);

  const videoSizeInBytes = fs.statSync(videoPath).size;

  const chunkStart = Number(range.replace(/\D/g, ""));

  const chunkEnd = Math.min(
    chunkStart + CHUNK_SIZE_IN_BYTES,
    videoSizeInBytes - 1
  );

  const contentLength = chunkEnd - chunkStart + 1;

  const headers = {
    "Content-Range": `bytes ${chunkStart}-${chunkEnd}/${videoSizeInBytes}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  const videoStream = fs.createReadStream(videoPath, {
    start: chunkStart,
    end: chunkEnd,
  });

  videoStream.pipe(res);
}
