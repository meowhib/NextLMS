import prisma from "@/lib/prisma";
import Image from "next/image";

interface Comment {
  id: string;

  constent: string;
  createdAt: Date;
  user: {
    id: string;
    image: string;
    comment: string;
  };
}

interface Cmnt {
  id: string;
}

export default async function CmntSection({ id }: Cmnt) {
  const comments = await prisma.comment.findMany({
    where: {
      lessonId: id,
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });
  return (
    <div className="space-y-4">
      {comments.map((cmnt) => (
        <div
          key={cmnt.id}
          className=" p-4 border border-gray-300 rounded-lg bg-gray-500"
        >
          <div className="flex items-center space-x-4 mb-2">
            <Image
              alt="comment image"
              src={cmnt.user.image || "default-image.jpg"}
              width={50}
              height={50}
              className="rounded-full"
            />
            <h1 className="font-semibold text-medium">{cmnt.user.id}</h1>
          </div>
          <div className="inline-block border border-gray-300 bg-gray-400 p-2 rounded ml-2">
            <p className="text-gray-900 ">{cmnt.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
