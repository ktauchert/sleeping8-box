import { useRef } from "react";
import { useVideoTexture } from "./useVideoTexture";
import { useFrame } from "@react-three/fiber";

function VideoPlane({ videoUrl, args = [5, 5], rotation }) {
  const videoTexture = useVideoTexture({ url: videoUrl });
  const planeRef = useRef();

  useFrame(() => {
    if (videoTexture) {
      videoTexture.needsUpdate = true;
    }
  });

  return (
    <mesh ref={planeRef} rotation-x={[Math.PI * 0.5]}>
      <planeGeometry args={args} />
      {videoTexture && <meshBasicMaterial map={videoTexture} />}
    </mesh>
  );
}

export default VideoPlane;
