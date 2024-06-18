import { useRef } from "react";
import { useVideoTexture } from "./useVideoTexture";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function VideoCube({ videoUrl }) {
  const videoTexture = useVideoTexture({ url: videoUrl });
  const cubeRef = useRef();

  useFrame(() => {
    if (videoTexture) {
      videoTexture.needsUpdate = true;
    }
  });

  const videoMaterial = videoTexture
    ? new THREE.MeshBasicMaterial({ map: videoTexture })
    : new THREE.MeshBasicMaterial({ color: "gray" });
  const colorMaterial = new THREE.MeshBasicMaterial({ color: "white" });

  const materials = [
    colorMaterial, // right
    colorMaterial, // left
    colorMaterial, // top
    colorMaterial, // bottom
    videoMaterial, // front
    colorMaterial, // back
  ];

  return (
    <mesh ref={cubeRef} material={materials} rotation-x={[Math.PI * -0.056]}>
      <boxGeometry args={[6.4, 3.6, 0.01]} />
    </mesh>
  );
}
