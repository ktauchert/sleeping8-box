import {
  ContactShadows,
  Environment,
  OrbitControls,
  useCursor,
  Grid,
} from "@react-three/drei";
import React, { useReducer, useRef, useState } from "react";
import { useAtom } from "jotai";
import BusinessMan from "../models/BusinessMan";
import {
  charactersAtom,
  mapAtom,
  npcAtom,
  socket,
  userAtom,
} from "./SocketManager";
import { Vector3 } from "three";
import { Item } from "./Item";
import { useFrame, useThree } from "@react-three/fiber";
import { useGrid } from "../hooks/useGrid";
import VideoPlane from "./VideoPlane";
import { VideoCube } from "./VideoCube";
import { videoAtom } from "./useVideoTexture";

const Experience = ({ props }) => {
  const [onFloor, setOnFloor] = useState(false);
  const [videoClicked, setVideoClicked] = useState(false);
  const [characters] = useAtom(charactersAtom);
  const [map] = useAtom(mapAtom);
  const [npc] = useAtom(npcAtom);
  const [npcAnimation, setNpcAnimation] = useState("CharacterArmature|Idle");
  const [npcClicked, setNpcClicked] = useState(false);
  const itemsRef = [];

  useCursor(onFloor);

  const { vector3ToGrid, gridToVector3 } = useGrid();

  const scene = useThree((state) => state.scene);
  const [user] = useAtom(userAtom);
  const [video] = useAtom(videoAtom);
  const videoRef = useRef();

  const handleFloorClick = (e) => {
    const character = scene.getObjectByName(`character-${user}`);
    if (!character) {
      return;
    }
    if (onFloor) {
      socket.emit(
        "move",
        vector3ToGrid(character.position),
        vector3ToGrid(e.point)
      );
    }
  };

  const pointerEnterFloor = () => {
    setOnFloor(true);
  };
  const pointerLeaveFloor = () => {
    setOnFloor(false);
  };

  const handleNPCCLick = () => {
    if (!npcClicked) {
      setNpcAnimation("CharacterArmature|Wave");
      setNpcClicked(true);
    } else {
      setNpcAnimation("CharacterArmature|Idle");
      setNpcClicked(false);
    }
  };
  const onNPCEnter = () => {
    setOnFloor(false);
    // setNpcAnimation("CharacterArmature|Wave");
    // console.log("npc_wave", npcAnimation);
  };
  const onNPCLeave = () => {
    setOnFloor(true);
    // setNpcAnimation("CharacterArmature|Idle");
    // console.log("npc_wave", npcAnimation);
  };

  const onVideoClick = () => {
    if (videoClicked) {
      video.pause();
      setVideoClicked(false);
    }
    if (!videoClicked) {
      video.play();
      video.controls = true;
      setVideoClicked(true);
    }
  };

  useFrame((state, delta) => {
    const speed = 3;
    if (videoClicked) {
      if (state.camera.position.x > 9) {
        state.camera.position.x -= delta * speed;
      }
      if (state.camera.position.y > 2) {
        state.camera.position.y -= delta * speed;
      }
      if (state.camera.position.z > 9.22) {
        state.camera.position.z -= delta * speed;
      }
      state.camera.lookAt(videoRef.current.position);
    }
  });

  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.3} />
      <directionalLight intensity={2} color="white" castShadow />
      <ContactShadows
        opacity={1}
        scale={20}
        blur={1}
        far={10}
        resolution={256}
        color="#000000"
      />
      {/* <OrbitControls /> */}

      {map?.items?.map((item, idx) => {
        return <Item key={`${item.name}-${idx}`} item={item} />;
      })}
      <group
        ref={videoRef}
        position={[6.56, 1.44, 9.22]}
        rotation-y={[Math.PI * 0.5]}
        scale={0.15}
        onClick={onVideoClick}
        onPointerEnter={onNPCEnter}
        onPointerLeave={onNPCLeave}
      >
        <VideoCube videoUrl={"/models/videos/test_video.mp4"} />
      </group>
      <mesh
        rotation-x={-Math.PI / 2}
        position-y={-0.002}
        onClick={handleFloorClick}
        onPointerEnter={pointerEnterFloor}
        onPointerLeave={pointerLeaveFloor}
        position-x={map?.size[0] / 2}
        position-z={map?.size[1] / 2}
      >
        <planeGeometry args={map?.size} />
        <meshStandardMaterial color={"#f0f0f0"} />
      </mesh>
      {/* <Grid infiniteGrid fadeDistance={50} fadeStrength={5} /> */}

      {characters.map((character, idx) => {
        return (
          <BusinessMan
            key={character.id}
            id={character.id}
            position={gridToVector3(character.position)}
            path={character.path}
            hairColor={character.hairColor}
            jacketColor={character.jacketColor}
            shirtColor={character.shirtColor}
            shoeColor={character.shoeColor}
            tieColor={character.tieColor}
            trouserColor={character.trouserColor}
            videoClicked={videoClicked}
          />
        );
      })}
      {npc && (
        <BusinessMan
          onClick={handleNPCCLick}
          onPointerEnter={onNPCEnter}
          onPointerLeave={onNPCLeave}
          key={npc.id}
          id={npc.id}
          position={gridToVector3(npc.position)}
          path={npc.path}
          hairColor={npc.hairColor}
          jacketColor={npc.jacketColor}
          shirtColor={npc.shirtColor}
          shoeColor={npc.shoeColor}
          tieColor={npc.tieColor}
          trouserColor={npc.trouserColor}
          // custom animation
          videoClicked={videoClicked}
          npcAnimation={npcAnimation}
          isNPC={true}
        />
      )}
    </>
  );
};

export default Experience;
