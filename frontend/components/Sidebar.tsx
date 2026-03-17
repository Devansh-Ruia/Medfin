'use client';

import { useState } from 'react';
import { 
  FileText, 
  MessageCircle, 
  Receipt, 
  Scale, 
  ClipboardCheck, 
  TrendingUp, 
  Settings,
  Menu,
  X,
  User
} from 'lucide-react';
import { event } from '../lib/analytics';

interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigationItems = [
  { id: 'policy', label: 'Policy', icon: FileText },
  { id: 'ask-ai', label: 'Ask AI', icon: MessageCircle },
  { id: 'bills', label: 'Bills', icon: Receipt },
  { id: 'appeal', label: 'Appeal', icon: Scale },
  { id: 'pre-visit', label: 'Pre-Visit', icon: ClipboardCheck },
  { id: 'optimize', label: 'Optimize', icon: TrendingUp },
];

export default function Sidebar({ activeItem, onNavigate, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  return (
    <div className={`bg-white border-r border-[#E5E2DC] flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 border-b border-[#E5E2DC]">
        <div className={`flex items-center justify-between ${isCollapsed ? 'justify-center' : ''}`}>
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-[#0A6640] rounded-none flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            {!isCollapsed && (
              <div>
                <span className="text-[#0D0D0D] font-semibold text-lg">MedFin</span>
                <span className="text-[#0A6640] font-semibold text-lg">AI</span>
              </div>
            )}
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-[#6B6B6B] hover:text-[#0D0D0D] rounded-none hover:bg-[#F9F8F6] transition-all duration-200"
            >
              {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  event('navigate', { section: item.id });
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                  isActive 
                    ? 'bg-[#E8F5EE] text-[#0A6640] font-medium border-l-2 border-[#0A6640]' 
                    : 'text-[#6B6B6B] hover:bg-[#F9F8F6]'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-[#E5E2DC]">
        <button className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-[#6B6B6B] hover:bg-[#F9F8F6] transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>
        <button className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-[#6B6B6B] hover:bg-[#F9F8F6] transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
          <User className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Account</span>}
        </button>
      </div>
    </div>
  );
}
