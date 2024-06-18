import { atom, useAtom } from "jotai";
import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";
export const socket = io(SOCKET_URL);

export const charactersAtom = atom([]);
export const mapAtom = atom(null);
export const userAtom = atom(null);
export const npcAtom = atom(null);

export const SocketManager = () => {
  // use ATOMs
  const [_characters, setCharacters] = useAtom(charactersAtom);
  const [_map, setMap] = useAtom(mapAtom);
  const [_user, setUser] = useAtom(userAtom);
  const [_npc, setNPC] = useAtom(npcAtom);

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // const socket = io.connect(SOCKET_URL);
    console.log(socket);
    function onConnect() {
      console.log("client says: connected");
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log("client says: disconnected");
      setIsConnected(false);
    }

    function onHello(value) {
      console.log("Server says hello");
      setMap(value.map);
      setUser(value.id);
      // TODO: Möglich wieder zu value.character
      setCharacters(value);
      setNPC(value.npc_character);
    }

    function onCharacters(value) {
      setCharacters(value);
    }

    function onPlayerMove(value) {
      console.log("PLayer is moving");
      setCharacters((prev) => {
        return prev.map((character) => {
          if (character.id === value.id) {
            return value;
          }
          return character;
        });
      });
    }

    // socket.off("connect", onConnect).on("connect", onConnect);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("hello", onHello);
    socket.on("characters", onCharacters);
    socket.on("playerMove", onPlayerMove);
    return () => {
      // socket.disconnect();
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("hello", onHello);
      socket.off("characters", onCharacters);
      socket.off("playerMove", onPlayerMove);
    };
  }, []);
};
