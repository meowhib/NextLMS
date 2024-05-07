"use client";

import { useState } from "react";
import ReactPlayer from "react-player";

export default function VideoComponent({ src }: { src: string }) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative group">
      <div className="absolute w-full bottom-0 left-0 p-4 bg-white hidden group-hover:block hover:transition-all flex flex-row items-center">
        <button
          onClick={() => {
            setPlaying(!playing);
          }}
          className="bg-gray-600 hover:bg-gray-200 text-gray-900 h-8 w-8 rounded-full flex items-center justify-center"
        ></button>
        {/* progress bar */}
        <div className="h-1 w-full bg-gray-600 rounded-lg overflow-hidden flex flex-1">
          <div className="h-full bg-blue-500"></div>
        </div>
      </div>
      <ReactPlayer
        url={src}
        playing={true}
        width={"100"}
        height={"100"}
        progressInterval={5000}
        onProgress={(progress) => {
          console.log(progress);
        }}
      />
    </div>
  );
}
