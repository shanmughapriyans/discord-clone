export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#313338] overflow-hidden text-white font-sans selection:bg-[#5865F2] selection:text-white">
      {children}
    </div>
  );
}
