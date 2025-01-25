import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        defaultPlaybackSpeed: true
      }
    });

    console.log("User data:", JSON.stringify(user, null, 2));

    return NextResponse.json(user || { defaultPlaybackSpeed: 1.0 });
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { defaultPlaybackSpeed } = await req.json();
    console.log("POST request received", defaultPlaybackSpeed);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        defaultPlaybackSpeed,
      },
      select: {
        defaultPlaybackSpeed: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[SETTINGS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 