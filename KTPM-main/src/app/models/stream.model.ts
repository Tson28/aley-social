export interface Stream {
  _id: string;
  broadcaster: {
    _id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  title: string;
  description: string;
  thumbnailUrl?: string;
  status: 'live' | 'ended';
  viewerCount: number;
  streamKey?: string;
  startedAt: string;
  endedAt?: string;
}

export interface StreamChatMessage {
  streamId: string;
  userId: string;
  userName: string;
  message: string;
  isBroadcaster?: boolean;
  timestamp: string;
}
