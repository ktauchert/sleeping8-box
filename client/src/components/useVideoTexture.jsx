import * as THREE from "three";
import React, { useRef, useEffect, useState } from "react";
import { atom, useAtom } from "jotai";

export const videoAtom = atom(null);

export function useVideoTexture({ url }) {
  const videoRef = useRef();
  const textureRef = useRef();
  const [video, setVideo] = useAtom(videoAtom);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = url;
    video.crossOrigin = "Anonymous";
    video.loop = true;
    video.muted = true;
    //video.controls = true;
    // video.play();
    video.pause();
    videoRef.current = video;
    setVideo(video);
    textureRef.current = new THREE.VideoTexture(video);
  }, [url]);

  return textureRef.current;
}
