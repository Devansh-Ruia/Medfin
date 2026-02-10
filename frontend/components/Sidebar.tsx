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
    <div className={`bg-white border-r border-gray-100 flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            {!isCollapsed && (
              <span className="text-heading font-semibold text-lg">MedFin</span>
            )}
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200"
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
                onClick={() => onNavigate(item.id)}
                className={`nav-item w-full ${isActive ? 'nav-item-active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
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
      <div className="p-2 border-t border-gray-100">
        <button className={`nav-item w-full ${isCollapsed ? 'justify-center' : ''}`}>
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>
        <button className={`nav-item w-full ${isCollapsed ? 'justify-center' : ''}`}>
          <User className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Account</span>}
        </button>
      </div>
    </div>
  );
}
