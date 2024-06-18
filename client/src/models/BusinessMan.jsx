import React, { act, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useState } from "react";
import { useEffect } from "react";
import { useMemo } from "react";
import { SkeletonUtils } from "three-stdlib";
import { useFrame, useGraph } from "@react-three/fiber";
import { useAtom } from "jotai";
import { userAtom } from "../components/SocketManager";
import { useGrid } from "../hooks/useGrid";

const ANIM_STRINGS = {
  idle: "CharacterArmature|Idle",
  walk: "CharacterArmature|Walk",
};

const MOVEMENT_SPEED = 0.032;

export default function BusinessMan({
  hairColor = "green",
  shirtColor = "yellow",
  jacketColor = "pink",
  trouserColor = "orange",
  shoeColor = "blue",
  tieColor = "red",
  id,
  npcAnimation = "CharacterArmature|Idle",
  isNPC = false,
  videoClicked,
  ...props
}) {
  // Starting Position from props
  const position = useMemo(() => props.position, []);
  const [path, setPath] = useState();
  const { gridToVector3 } = useGrid();

  useEffect(() => {
    const path = [];
    props.path?.forEach((gridPosition) => {
      path.push(gridToVector3(gridPosition));
    });
    setPath(path);
  }, [props.path]);

  useEffect(() => {
    console.log(npcAnimation);
    setAnimation(npcAnimation);
  }, [npcAnimation]);

  const group = useRef();
  const { scene, materials, animations } = useGLTF("/models/BusinessMan.glb");
  // For cloning character
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);

  const { actions } = useAnimations(animations, group);
  const [animation, setAnimation] = useState("CharacterArmature|Idle");

  useEffect(() => {
    if (isNPC) {
      actions[npcAnimation]?.reset().fadeIn(0.32).play();
    } else {
      actions[animation].reset().fadeIn(0.32).play();
    }

    return () => {
      if (isNPC) {
        actions[npcAnimation]?.fadeOut(0.32);
      } else {
        actions[animation]?.fadeOut(0.32);
      }
    };
  }, [animation]);

  const [user] = useAtom(userAtom);

  useFrame((state) => {
    if (path?.length && group.current.position.distanceTo(path[0]) > 0.1) {
      const direction = group.current.position
        .clone()
        .sub(path[0])
        .normalize()
        .multiplyScalar(MOVEMENT_SPEED);
      group.current.position.sub(direction);
      group.current.lookAt(path[0]);
      setAnimation("CharacterArmature|Run");
    } else if (path?.length) {
      path.shift();
    } else {
      setAnimation("CharacterArmature|Idle");
    }
    if (id === user && !videoClicked) {
      state.camera.position.x = group.current.position.x + 8;
      state.camera.position.y = group.current.position.y + 8;
      state.camera.position.z = group.current.position.z + 8;
      state.camera.lookAt(group.current.position);
    }
  });

  return (
    <group
      ref={group}
      {...props}
      position={position}
      dispose={null}
      name={`character-${id}`}
    >
      <group name="Root_Scene">
        <group name="RootNode">
          <group
            name="CharacterArmature"
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <primitive object={nodes.Root} />
          </group>
          <skinnedMesh
            name="Suit_Legs"
            geometry={nodes.Suit_Legs.geometry}
            material={materials.Suit}
            skeleton={nodes.Suit_Legs.skeleton}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <meshStandardMaterial color={trouserColor} />
          </skinnedMesh>
          <skinnedMesh
            name="Suit_Feet"
            geometry={nodes.Suit_Feet.geometry}
            material={materials.Black}
            skeleton={nodes.Suit_Feet.skeleton}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <meshStandardMaterial color={shoeColor} />
          </skinnedMesh>
          <group
            name="Suit_Body"
            position={[0, 0.007, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <skinnedMesh
              name="Suit_Body_1"
              geometry={nodes.Suit_Body_1.geometry}
              material={materials.Suit}
              skeleton={nodes.Suit_Body_1.skeleton}
            >
              <meshStandardMaterial color={jacketColor} />
            </skinnedMesh>
            <skinnedMesh
              name="Suit_Body_2"
              geometry={nodes.Suit_Body_2.geometry}
              material={materials.White}
              skeleton={nodes.Suit_Body_2.skeleton}
            >
              <meshStandardMaterial color={shirtColor} />
            </skinnedMesh>
            <skinnedMesh
              name="Suit_Body_3"
              geometry={nodes.Suit_Body_3.geometry}
              material={materials.Tie}
              skeleton={nodes.Suit_Body_3.skeleton}
            >
              <meshStandardMaterial color={tieColor} />
            </skinnedMesh>
            <skinnedMesh
              name="Suit_Body_4"
              geometry={nodes.Suit_Body_4.geometry}
              material={materials.Skin}
              skeleton={nodes.Suit_Body_4.skeleton}
            />
          </group>
          <group name="Suit_Head" rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <skinnedMesh
              name="Suit_Head_1"
              geometry={nodes.Suit_Head_1.geometry}
              material={materials.Skin}
              skeleton={nodes.Suit_Head_1.skeleton}
            />
            <skinnedMesh
              name="Suit_Head_2"
              geometry={nodes.Suit_Head_2.geometry}
              material={materials.Hair}
              skeleton={nodes.Suit_Head_2.skeleton}
            >
              <meshStandardMaterial color={hairColor} />
            </skinnedMesh>
            <skinnedMesh
              name="Suit_Head_3"
              geometry={nodes.Suit_Head_3.geometry}
              material={materials.Eyebrows}
              skeleton={nodes.Suit_Head_3.skeleton}
            />
            <skinnedMesh
              name="Suit_Head_4"
              geometry={nodes.Suit_Head_4.geometry}
              material={materials.Eye}
              skeleton={nodes.Suit_Head_4.skeleton}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/BusinessMan.glb");
