'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { LogOut, Hash, Plus, MessageSquare } from 'lucide-react';

let socket: Socket;

export default function AppDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { servers, activeServerId, channels, activeChannelId, setServers, setActiveServerId, setChannels, setActiveChannelId } = useAppStore();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newServerName, setNewServerName] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [joinServerId, setJoinServerId] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'join'>('create');
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [isAddingChannel, setIsAddingChannel] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Initialize Socket
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
    socket = io(backendUrl, {
      withCredentials: true
    });

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Fetch initial data
    fetchServers();

    return () => {
      socket.disconnect();
    };
  }, [user, router]);

  const fetchServers = async () => {
    try {
      const res = await api.get('/servers');
      setServers(res.data);
    } catch (e) {
      console.error('Failed to fetch servers', e);
    }
  };

  const selectServer = async (id: string) => {
    setActiveServerId(id);
    try {
      const res = await api.get(`/servers/${id}`);
      setChannels(res.data.channels || []);
    } catch (e) {
      console.error('Failed to fetch channels', e);
    }
  };

  const selectChannel = async (id: string) => {
    setActiveChannelId(id);
    socket?.emit('join_channel', id);
    try {
      const res = await api.get(`/channels/${id}/messages`);
      setMessages(res.data);
    } catch (e) {
      console.error('Failed to fetch messages', e);
    }
  };

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName) return;
    try {
      await api.post('/servers', { name: newServerName });
      setNewServerName('');
      setIsAddingServer(false);
      fetchServers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName || !activeServerId) return;
    try {
      await api.post('/channels', { name: newChannelName, serverId: activeServerId });
      setNewChannelName('');
      setIsAddingChannel(false);
      selectServer(activeServerId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoinServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinServerId) return;
    try {
      await api.post(`/servers/${joinServerId}/join`);
      setJoinServerId('');
      setIsAddingServer(false);
      fetchServers();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.error || 'Failed to join server. Check the ID.');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChannelId) return;
    
    socket?.emit('send_message', { channelId: activeChannelId, content: newMessage });
    setNewMessage('');
  };

  return (
    <>
      {/* Server Sidebar */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 space-y-2 flex-shrink-0 overflow-y-auto">
        <div 
          onClick={() => selectServer('')}
          className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-[#5865F2] flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${!activeServerId ? 'bg-[#5865F2] rounded-[16px]' : ''}`}
        >
          <svg x="0" y="0" className="w-7 h-7 text-white" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.2-1.6.27-3.14.75-4.6 1.43A19.04 19.04 0 0 0 .96 17.7a19.11 19.11 0 0 0 5.63 2.87c.46-.62.86-1.28 1.2-1.98-.65-.25-1.27-.55-1.87-.89.15-.11.3-.22.46-.34 3.22 1.49 6.67 1.49 9.89 0 .15.11.29.23.45.33-.59.34-1.2.64-1.85.89.35.7.75 1.36 1.2 1.98 2.03-.63 3.94-1.6 5.64-2.87.53-3.59-.64-7.46-1.98-12.83ZM8.3 15.12c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.89 2.27-2 2.27Zm7.4 0c-1.1 0-2-1.02-2-2.27 0-1.24.88-2.26 2-2.26s2.02 1.02 2 2.26c0 1.25-.88 2.27-2 2.27Z"></path></svg>
        </div>
        
        <div className="w-8 h-[2px] bg-[#313338] rounded"></div>

        {servers.map((s) => (
          <div key={s.id} className="relative flex items-center justify-center w-full group">
            <div className={`absolute left-0 w-1 bg-white rounded-r-lg transition-all ${activeServerId === s.id ? 'h-10' : 'h-2 opacity-0 group-hover:opacity-100 group-hover:h-5'}`}></div>
            <div 
              onClick={() => selectServer(s.id)}
              className={`w-12 h-12 hover:rounded-[16px] flex items-center justify-center cursor-pointer transition-all flex-shrink-0 text-[#dbdee1] font-medium text-lg ${activeServerId === s.id ? 'bg-[#5865F2] rounded-[16px] text-white' : 'bg-[#313338] rounded-[24px] hover:bg-[#5865F2] hover:text-white'}`}
              title={s.name}
            >
              {s.name.charAt(0).toUpperCase()}
            </div>
          </div>
        ))}
        
        <div 
          onClick={() => setIsAddingServer(!isAddingServer)}
          className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-[#23a559] text-[#23a559] hover:text-white flex items-center justify-center cursor-pointer transition-all flex-shrink-0"
        >
          <Plus size={24} />
        </div>
      </div>

      {/* Channel Sidebar */}
      <div className="w-60 bg-[#2b2d31] flex flex-col flex-shrink-0">
        <div className="h-12 border-b border-[#1e1f22] flex items-center px-4 font-bold justify-between text-white shadow-sm">
          <span className="truncate pr-2">{activeServerId ? servers.find(s => s.id === activeServerId)?.name : 'Direct Messages'}</span>
          {activeServerId && (
            <button 
              onClick={() => {
                navigator.clipboard.writeText(activeServerId);
                alert('Server ID copied to clipboard!');
              }}
              className="text-xs font-medium bg-[#1e1f22] px-2 py-1 rounded text-[#949ba4] hover:text-white transition-colors flex-shrink-0"
              title="Copy Server ID to invite others"
            >
              Copy ID
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-[2px]">
          {activeServerId ? (
            <>
              <div className="flex items-center justify-between text-[#949ba4] hover:text-[#dbdee1] mt-4 mb-1 px-2 group cursor-pointer transition-colors" onClick={() => setIsAddingChannel(!isAddingChannel)}>
                <span className="text-[11px] font-bold uppercase tracking-wide">Text Channels</span>
                <Plus size={16} className="hidden group-hover:block" />
              </div>
              
              {isAddingChannel && (
                <form onSubmit={handleCreateChannel} className="px-2 mb-2">
                  <input 
                    type="text" 
                    value={newChannelName} 
                    onChange={e => setNewChannelName(e.target.value)} 
                    placeholder="new-channel"
                    className="w-full bg-[#1e1f22] text-[#dbdee1] px-2 py-1.5 rounded text-sm outline-none focus:ring-1 focus:ring-[#5865F2]"
                    autoFocus
                  />
                </form>
              )}

              {channels.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => selectChannel(c.id)}
                  className={`flex items-center px-2 py-1.5 rounded cursor-pointer group transition-colors ${activeChannelId === c.id ? 'bg-[#404249] text-white' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'}`}
                >
                  <Hash size={20} className="mr-1.5 text-[#80848e] group-hover:text-[#dbdee1]" />
                  <span className="truncate font-medium text-[15px]">{c.name}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="flex items-center px-2 py-2 rounded cursor-pointer group bg-[#404249] text-white">
              <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center mr-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/></svg>
              </div>
              <span className="font-medium">Friends</span>
            </div>
          )}
        </div>

        <div className="h-[52px] bg-[#232428] flex items-center px-2 justify-between shrink-0">
          <div className="flex items-center hover:bg-[#3f4147] p-1 rounded cursor-pointer flex-1 mr-1 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-white mr-2 shrink-0">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[14px] font-semibold text-white leading-tight truncate">{user?.username}</span>
              <span className="text-[11px] text-[#949ba4] truncate">Online</span>
            </div>
          </div>
          <button onClick={() => { logout(); router.push('/login'); }} className="text-[#b9bbbe] hover:text-red-500 hover:bg-[#3f4147] p-1.5 rounded transition-colors shrink-0">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#313338]">
        {activeChannelId ? (
          <>
            <div className="h-12 border-b border-[#2b2d31] flex items-center px-4 shadow-sm">
              <Hash size={24} className="mr-2 text-[#80848e]" />
              <span className="font-bold text-white">{channels.find(c => c.id === activeChannelId)?.name}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
              {messages.map((m, i) => (
                <div key={i} className="flex hover:bg-[#2b2d31] p-1 -mx-4 px-4 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-white mr-4 flex-shrink-0 mt-0.5 cursor-pointer hover:opacity-80">
                    {m.user?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="flex items-baseline mb-1">
                      <span className="font-medium text-[16px] text-white mr-2 hover:underline cursor-pointer">{m.user?.username || 'Unknown'}</span>
                      <span className="text-[12px] text-[#949ba4]">
                        {new Date(m.createdAt).toLocaleDateString()} at {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-[#dbdee1] whitespace-pre-wrap leading-relaxed text-[15px]">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 pb-6 pt-2">
              <form onSubmit={handleSendMessage} className="bg-[#383a40] rounded-lg flex items-center px-4 py-3">
                <input 
                  type="text" 
                  value={newMessage} 
                  onChange={e => setNewMessage(e.target.value)} 
                  placeholder={`Message #${channels.find(c => c.id === activeChannelId)?.name}`}
                  className="flex-1 bg-transparent text-[#dbdee1] outline-none placeholder-[#80848e] text-[15px]"
                />
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#949ba4]">
            <MessageSquare size={64} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Select a channel to start messaging</p>
          </div>
        )}
      </div>

      {/* Adding Server Modal Overlay */}
      {isAddingServer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity">
          <div className="bg-[#313338] rounded-lg w-[440px] shadow-2xl transform scale-100 transition-transform overflow-hidden">
            <div className="p-6">
              <div className="flex mb-6 border-b border-[#2b2d31]">
                <button 
                  className={`flex-1 pb-2 font-bold ${modalMode === 'create' ? 'text-white border-b-2 border-[#5865F2]' : 'text-[#949ba4] hover:text-[#dbdee1]'}`}
                  onClick={() => setModalMode('create')}
                >
                  Create
                </button>
                <button 
                  className={`flex-1 pb-2 font-bold ${modalMode === 'join' ? 'text-white border-b-2 border-[#5865F2]' : 'text-[#949ba4] hover:text-[#dbdee1]'}`}
                  onClick={() => setModalMode('join')}
                >
                  Join
                </button>
              </div>

              {modalMode === 'create' ? (
                <>
                  <h2 className="text-2xl font-bold text-center mb-2">Customize your server</h2>
                  <p className="text-center text-[#dbdee1] mb-6 text-sm">Give your new server a personality with a name. You can always change it later.</p>
                  <form onSubmit={handleCreateServer} id="createServerForm">
                    <div className="mb-2">
                      <label className="block text-[#b5bac1] text-xs font-bold mb-2 uppercase tracking-wide">Server Name</label>
                      <input 
                        type="text" 
                        value={newServerName} 
                        onChange={e => setNewServerName(e.target.value)} 
                        className="w-full p-2.5 bg-[#1e1f22] text-white rounded outline-none focus:ring-1 focus:ring-[#5865F2]"
                        required 
                        autoFocus
                      />
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-center mb-2">Join a Server</h2>
                  <p className="text-center text-[#dbdee1] mb-6 text-sm">Enter an invite ID below to join an existing server.</p>
                  <form onSubmit={handleJoinServer} id="joinServerForm">
                    <div className="mb-2">
                      <label className="block text-[#b5bac1] text-xs font-bold mb-2 uppercase tracking-wide">Server ID</label>
                      <input 
                        type="text" 
                        value={joinServerId} 
                        onChange={e => setJoinServerId(e.target.value)} 
                        placeholder="e.g. 5f8b9e..."
                        className="w-full p-2.5 bg-[#1e1f22] text-white rounded outline-none focus:ring-1 focus:ring-[#5865F2]"
                        required 
                        autoFocus
                      />
                    </div>
                  </form>
                </>
              )}
            </div>
            <div className="flex justify-between items-center bg-[#2b2d31] p-4">
              <button type="button" onClick={() => setIsAddingServer(false)} className="text-[#dbdee1] hover:underline text-sm px-4">Back</button>
              <button 
                type="submit" 
                form={modalMode === 'create' ? "createServerForm" : "joinServerForm"} 
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-2.5 px-6 rounded transition-colors text-sm"
              >
                {modalMode === 'create' ? 'Create' : 'Join Server'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
