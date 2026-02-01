"use client";

import { useState } from "react";
import { LayoutDashboard, Key, KeyRound, BarChart3, History, BookOpen, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const ICONS = {
  dashboard: LayoutDashboard,
  "api-key": Key,
  "api-keys": KeyRound,
  stats: BarChart3,
  history: History,
  documentation: BookOpen,
};

export default function Sidebar({ options, activeId, onSelect, userName, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col h-screen bg-[#0a0a0a] border-r border-white/10 transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10 min-h-16">
        {!collapsed && (
          <Link href="/" className="font-bold text-sm flex items-center gap-2 truncate">
            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center shrink-0">
              <div className="w-3 h-3 bg-black rounded-sm" />
            </div>
            <span className="truncate">KitKat Audit</span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 rounded-sm hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {options.map((opt) => {
          const Icon = ICONS[opt.id] ?? Key;
          const isActive = activeId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{opt.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        {!collapsed && userName && (
          <p className="text-xs text-gray-500 truncate px-2 mb-2" title={userName}>
            {userName}
          </p>
        )}
        <button
          type="button"
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
