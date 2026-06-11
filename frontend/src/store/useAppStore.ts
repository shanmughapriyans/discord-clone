import { create } from 'zustand';

export interface Server {
  id: string;
  name: string;
}

export interface Channel {
  id: string;
  name: string;
  serverId: string;
}

interface AppState {
  servers: Server[];
  activeServerId: string | null;
  channels: Channel[];
  activeChannelId: string | null;
  setServers: (servers: Server[]) => void;
  setActiveServerId: (id: string | null) => void;
  setChannels: (channels: Channel[]) => void;
  setActiveChannelId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  servers: [],
  activeServerId: null,
  channels: [],
  activeChannelId: null,
  setServers: (servers) => set({ servers }),
  setActiveServerId: (id) => set({ activeServerId: id, activeChannelId: null, channels: [] }),
  setChannels: (channels) => set({ channels }),
  setActiveChannelId: (id) => set({ activeChannelId: id }),
}));
