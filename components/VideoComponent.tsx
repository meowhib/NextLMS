"use client";

import ReactPlayer from "react-player";

export default function VideoComponent({ src }: { src: string }) {
  return (
    <ReactPlayer
      url={src}
      playing={true}
      controls
      width={"100"}
      height={"100"}
      progressInterval={5000}
      onProgress={(progress) => {
        console.log(progress);
      }}
    />
  );
}
