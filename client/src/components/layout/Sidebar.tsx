export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center gap-2">
        <div className="w-7 h-7 bg-[#534AB7] rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">N</span>
        </div>
        <span className="font-semibold text-sm text-gray-900">NotifyFlow</span>
      </div>
      <nav className="flex-1 p-3">
        <p className="text-xs text-gray-400 px-2 mb-2 uppercase tracking-wide">Main</p>
        <a href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          Dashboard
        </a>
      </nav>
    </aside>
  );
}