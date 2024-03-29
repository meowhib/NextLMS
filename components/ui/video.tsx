"use client";

import ReactPlayer from 'react-player'

export default function VideoComponent({ src, } : { src: string }) {
    return (
        <ReactPlayer url={src} controls={true} width="100%" height="100%" style={{ borderRadius: '5px!important' }} />
    )
}