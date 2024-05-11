"use client";

import { useState } from "react";
// import ReactPlayer from "react-player";
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

export default function VideoComponent({ src }: { src: string }) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  return (
    <ReactPlayer
      url={src}
      playing={true}
      width={"100"}
      height={"100"}
      progressInterval={5000}
      onProgress={(progress) => {
        console.log(progress);
      }}
      controls
    />
  );
}
