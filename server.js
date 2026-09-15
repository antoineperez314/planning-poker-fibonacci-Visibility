const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.NEXT_HOSTNAME || "localhost";
const port = Number(process.env.PORT || 3000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const cards = ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?", "cafe"];

function nowIso() {
  return new Date().toISOString();
}

function makeCode() {
  return `BT-${Math.floor(1000 + Math.random() * 9000)}`;
}

function emptyStory(index = 1) {
  return {
    id: crypto.randomUUID(),
    title: `User Story ${index}`,
    description: "",
    jiraRef: "",
    finalEstimate: null,
    createdAt: nowIso(),
  };
}

function demoRoom() {
  const story = {
    id: crypto.randomUUID(),
    title: "Ajouter la gestion automatique des erreurs reseau",
    description:
      "En tant qu'utilisateur, je veux recevoir un retour clair lorsque le reseau est indisponible afin de comprendre l'etat de l'application.",
    jiraRef: "LYNX-2431",
    finalEstimate: null,
    createdAt: nowIso(),
  };

  return {
    code: "BT-4821",
    name: "Refinement LYNX",
    hostId: "demo-host",
    hostName: "Alex",
    cards,
    participants: [
      { id: "demo-host", name: "Alex", role: "host", connected: true, vote: null, joinedAt: nowIso() },
      { id: "demo-sarah", name: "Sarah", role: "participant", connected: true, vote: null, joinedAt: nowIso() },
      { id: "demo-mehdi", name: "Mehdi", role: "participant", connected: true, vote: null, joinedAt: nowIso() },
      { id: "demo-julie", name: "Julie", role: "participant", connected: true, vote: null, joinedAt: nowIso() },
      { id: "demo-thomas", name: "Thomas", role: "participant", connected: true, vote: null, joinedAt: nowIso() },
    ],
    stories: [story],
    currentStoryIndex: 0,
    revealed: false,
    round: 1,
    history: [],
    closed: false,
    createdAt: nowIso(),
  };
}

const rooms = new Map([["BT-4821", demoRoom()]]);

function publicRoom(room) {
  return {
    ...room,
    participants: room.participants.map((participant) => ({
      ...participant,
      vote: room.revealed ? participant.vote : null,
      hasVoted: Boolean(participant.vote),
    })),
  };
}

function emitRoom(io, room) {
  io.to(room.code).emit("room:update", publicRoom(room));
}

function requireHost(socket, room) {
  return room && socket.data.participantId === room.hostId;
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    handler(req, res);
  });
  const io = new Server(httpServer, {
    cors: {
      origin: clientOrigin.split(",").map((origin) => origin.trim()),
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("session:create", ({ name, selectedCards }, callback) => {
      const code = makeCode();
      const hostId = crypto.randomUUID();
      const hostName = "Animateur";
      const firstStory = {
        ...emptyStory(1),
        title: "Nouvelle User Story",
      };
      const room = {
        code,
        name: String(name || "Session Planning Poker").trim(),
        hostId,
        hostName,
        cards: Array.isArray(selectedCards) && selectedCards.length ? selectedCards : cards,
        participants: [
          { id: hostId, name: hostName, role: "host", connected: true, vote: null, joinedAt: nowIso() },
        ],
        stories: [firstStory],
        currentStoryIndex: 0,
        revealed: false,
        round: 1,
        history: [],
        closed: false,
        createdAt: nowIso(),
      };

      rooms.set(code, room);
      socket.data.roomCode = code;
      socket.data.participantId = hostId;
      socket.join(code);
      callback({ ok: true, participantId: hostId, role: "host", room: publicRoom(room) });
      emitRoom(io, room);
    });

    socket.on("session:join", ({ code, name }, callback) => {
      const sessionSearch = String(code || "").trim();
      const room =
        rooms.get(sessionSearch.toUpperCase()) ||
        [...rooms.values()].find((item) => item.name.toLowerCase() === sessionSearch.toLowerCase());
      if (!room || room.closed) {
        callback({ ok: false, error: "Session introuvable ou fermee." });
        return;
      }

      const participantId = crypto.randomUUID();
      const participant = {
        id: participantId,
        name: String(name || "Invite").trim(),
        role: "participant",
        connected: true,
        vote: null,
        joinedAt: nowIso(),
      };

      room.participants.push(participant);
      socket.data.roomCode = room.code;
      socket.data.participantId = participantId;
      socket.join(room.code);
      callback({ ok: true, participantId, role: "participant", room: publicRoom(room) });
      emitRoom(io, room);
    });

    socket.on("room:demo", (callback) => {
      const room = rooms.get("BT-4821") || demoRoom();
      rooms.set("BT-4821", room);
      const participantId = crypto.randomUUID();
      room.participants.push({
        id: participantId,
        name: `Invite ${room.participants.length}`,
        role: "participant",
        connected: true,
        vote: null,
        joinedAt: nowIso(),
      });
      socket.data.roomCode = room.code;
      socket.data.participantId = participantId;
      socket.join(room.code);
      callback({ ok: true, participantId, role: "participant", room: publicRoom(room) });
      emitRoom(io, room);
    });

    socket.on("vote:cast", ({ value }) => {
      const room = rooms.get(socket.data.roomCode);
      if (!room || room.revealed) return;
      const participant = room.participants.find((item) => item.id === socket.data.participantId);
      if (!participant || !room.cards.includes(value)) return;
      participant.vote = value;
      emitRoom(io, room);
    });

    socket.on("round:reveal", () => {
      const room = rooms.get(socket.data.roomCode);
      const participant = room?.participants.find((item) => item.id === socket.data.participantId);
      if (!room || !participant || room.revealed) return;
      room.revealed = true;
      emitRoom(io, room);
    });

    socket.on("round:new", ({ story }) => {
      const room = rooms.get(socket.data.roomCode);
      if (!requireHost(socket, room)) return;
      room.revealed = false;
      room.round += 1;
      room.participants.forEach((participant) => {
        participant.vote = null;
      });
      if (story) {
        const nextStory = {
          id: crypto.randomUUID(),
          title: String(story.title || `User Story ${room.stories.length + 1}`).trim(),
          description: String(story.description || "").trim(),
          jiraRef: String(story.jiraRef || "").trim(),
          finalEstimate: null,
          createdAt: nowIso(),
        };
        room.stories.push(nextStory);
        room.currentStoryIndex = room.stories.length - 1;
      }
      emitRoom(io, room);
    });

    socket.on("story:update", ({ story }) => {
      const room = rooms.get(socket.data.roomCode);
      if (!requireHost(socket, room)) return;
      const current = room.stories[room.currentStoryIndex];
      if (!current) return;
      current.title = String(story.title || "").trim();
      current.description = String(story.description || "").trim();
      current.jiraRef = String(story.jiraRef || "").trim();
      emitRoom(io, room);
    });

    socket.on("story:navigate", ({ direction }) => {
      const room = rooms.get(socket.data.roomCode);
      if (!requireHost(socket, room)) return;
      const nextIndex = direction === "previous" ? room.currentStoryIndex - 1 : room.currentStoryIndex + 1;
      if (nextIndex < 0 || nextIndex >= room.stories.length) return;
      room.currentStoryIndex = nextIndex;
      room.revealed = false;
      room.round += 1;
      room.participants.forEach((participant) => {
        participant.vote = null;
      });
      emitRoom(io, room);
    });

    socket.on("story:finalize", ({ value }) => {
      const room = rooms.get(socket.data.roomCode);
      if (!requireHost(socket, room) || !room.revealed || !room.cards.includes(value)) return;
      const story = room.stories[room.currentStoryIndex];
      story.finalEstimate = value;
      room.history.unshift({
        id: crypto.randomUUID(),
        story: `${story.jiraRef ? `${story.jiraRef} - ` : ""}${story.title}`,
        estimate: value,
        date: nowIso(),
      });
      emitRoom(io, room);
    });

    socket.on("session:close", () => {
      const room = rooms.get(socket.data.roomCode);
      if (!requireHost(socket, room)) return;
      room.closed = true;
      emitRoom(io, room);
      io.to(room.code).emit("session:closed");
      rooms.delete(room.code);
    });

    socket.on("disconnect", () => {
      const room = rooms.get(socket.data.roomCode);
      if (!room) return;
      const participant = room.participants.find((item) => item.id === socket.data.participantId);
      if (participant) {
        participant.connected = false;
        emitRoom(io, room);
      }
    });
  });

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Planning Poker ready on http://0.0.0.0:${port}`);
  });
});
