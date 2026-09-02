import React from 'react';
import { Lock } from 'lucide-react';
import { BrandMark } from './BrandMark';
import {
  ALL_TOOLS,
  CATEGORIES,
  OVERVIEW_ITEM,
  type TabType,
} from '../lib/navigation';

interface SidebarProps {
  activeTab: TabType;
  onSelect: (id: TabType) => void;
  searchQuery: string;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelect,
  searchQuery,
  onCloseMobile,
}) => {
  const query = searchQuery.trim().toLowerCase();
  const filtered = query
    ? ALL_TOOLS.filter(
        (t) =>
          t.label.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.badge.toLowerCase().includes(query)
      )
    : ALL_TOOLS;

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    tools: filtered.filter((t) => t.category === cat.id),
  })).filter((g) => g.tools.length > 0);

  const handleSelect = (id: TabType) => {
    onSelect(id);
    onCloseMobile?.();
  };

  return (
    <div className="flex h-full flex-col bg-[#0e151d] border-r border-white/[0.06]">
      <div className="hidden lg:flex items-center gap-3 px-5 h-16 border-b border-white/[0.06]">
        <BrandMark className="h-8 w-8" />
        <div className="min-w-0">
          <div className="text-[13px] font-semibold tracking-[0.14em] text-[#eef2f6]">
            NEXUS-0
          </div>
          <div className="text-[11px] text-[#8b98a8]">Capital protection</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-3 space-y-3">
        <button
          onClick={() => handleSelect('overview')}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left text-[13px] transition ${
            activeTab === 'overview'
              ? 'bg-[#c9a86c]/12 text-[#e8d5a3] border border-[#c9a86c]/25'
              : 'text-[#b8c2ce] border border-transparent hover:bg-white/[0.04] hover:text-white'
          }`}
        >
          <OVERVIEW_ITEM.icon className="h-4 w-4 shrink-0" />
          <span className="font-medium">{OVERVIEW_ITEM.label}</span>
        </button>

        {query && filtered.length === 0 && (
          <p className="px-3 text-xs text-[#8b98a8]">No operations match that search.</p>
        )}

        {grouped.map((group) => (
          <div key={group.id}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6d7a8a]">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTab === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleSelect(tool.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left transition ${
                      isActive
                        ? 'bg-[#c9a86c]/12 text-[#e8d5a3] border border-[#c9a86c]/25'
                        : 'text-[#b8c2ce] border border-transparent hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#c9a86c]' : 'text-[#7d8a98]'}`} />
                    <span className="flex-1 truncate text-[13px] font-medium">{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="rounded-lg border border-[#c9a86c]/20 bg-[#c9a86c]/[0.06] px-2.5 py-2">
          <div className="flex items-start gap-2">
            <Lock className="h-3.5 w-3.5 mt-0.5 text-[#c9a86c] shrink-0" />
            <p className="text-[11px] leading-snug text-[#b8c2ce]">
              Zero-balance invariant. Funds are never pooled overnight.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
