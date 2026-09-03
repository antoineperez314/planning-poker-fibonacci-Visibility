"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { JoinState, Room, ServerResponse, StoryDraft, VoteValue } from "@/types/planning";

type CreatePayload = {
  name: string;
  selectedCards: VoteValue[];
};

type JoinPayload = {
  code: string;
  name: string;
};

export function usePlanningSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [joinState, setJoinState] = useState<JoinState | null>(null);
  const [error, setError] = useState("");
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    const nextSocket = io(socketUrl || undefined);
    socketRef.current = nextSocket;
    nextSocket.on("connect", () => {
      setConnected(true);
      setError("");
    });
    nextSocket.on("disconnect", () => setConnected(false));
    nextSocket.on("room:update", (updatedRoom: Room) => setRoom(updatedRoom));
    nextSocket.on("session:closed", () => setClosed(true));
    nextSocket.on("connect_error", () => setError("Connexion temps reel indisponible."));
    return () => {
      nextSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleResponse = useCallback((response: ServerResponse) => {
    if (!response.ok) {
      setError(response.error);
      return false;
    }
    setError("");
    setClosed(false);
    setJoinState({ participantId: response.participantId, role: response.role });
    setRoom(response.room);
    return true;
  }, []);

  const createSession = useCallback(
    (payload: CreatePayload) =>
      new Promise<boolean>((resolve) => {
        const socket = socketRef.current;
        if (!socket) return resolve(false);
        socket.emit("session:create", payload, (response: ServerResponse) => resolve(handleResponse(response)));
      }),
    [handleResponse],
  );

  const joinSession = useCallback(
    (payload: JoinPayload) =>
      new Promise<boolean>((resolve) => {
        const socket = socketRef.current;
        if (!socket) return resolve(false);
        socket.emit("session:join", payload, (response: ServerResponse) => resolve(handleResponse(response)));
      }),
    [handleResponse],
  );

  const joinDemo = useCallback(
    () =>
      new Promise<boolean>((resolve) => {
        const socket = socketRef.current;
        if (!socket) return resolve(false);
        socket.emit("room:demo", (response: ServerResponse) => resolve(handleResponse(response)));
      }),
    [handleResponse],
  );

  const actions = useMemo(
    () => ({
      vote: (value: VoteValue) => socketRef.current?.emit("vote:cast", { value }),
      reveal: () => socketRef.current?.emit("round:reveal"),
      newRound: (story?: StoryDraft) => socketRef.current?.emit("round:new", { story }),
      updateStory: (story: StoryDraft) => socketRef.current?.emit("story:update", { story }),
      navigateStory: (direction: "previous" | "next") => socketRef.current?.emit("story:navigate", { direction }),
      finalize: (value: VoteValue) => socketRef.current?.emit("story:finalize", { value }),
      close: () => socketRef.current?.emit("session:close"),
    }),
    [],
  );

  return {
    connected,
    room,
    joinState,
    error,
    closed,
    createSession,
    joinSession,
    joinDemo,
    actions,
  };
}
