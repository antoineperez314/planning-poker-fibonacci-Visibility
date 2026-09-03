export type Role = "host" | "participant";

export type VoteValue = string;

export type Participant = {
  id: string;
  name: string;
  role: Role;
  connected: boolean;
  vote: VoteValue | null;
  hasVoted: boolean;
  joinedAt: string;
};

export type Story = {
  id: string;
  title: string;
  description: string;
  jiraRef: string;
  finalEstimate: VoteValue | null;
  createdAt: string;
};

export type HistoryEntry = {
  id: string;
  story: string;
  estimate: VoteValue;
  date: string;
};

export type Room = {
  code: string;
  name: string;
  hostId: string;
  hostName: string;
  cards: VoteValue[];
  participants: Participant[];
  stories: Story[];
  currentStoryIndex: number;
  revealed: boolean;
  round: number;
  history: HistoryEntry[];
  closed: boolean;
  createdAt: string;
};

export type JoinState = {
  participantId: string;
  role: Role;
};

export type StoryDraft = {
  title: string;
  description: string;
  jiraRef: string;
};

export type ServerResponse =
  | { ok: true; participantId: string; role: Role; room: Room }
  | { ok: false; error: string };
