'use client';

import { useState } from 'react';
import { 
  FileText, 
  MessageCircle, 
  Receipt, 
  Scale, 
  MoreHorizontal,
  ClipboardCheck,
  TrendingUp,
  Settings,
  User,
  X
} from 'lucide-react';

interface BottomNavProps {
  activeItem: string;
  onNavigate: (item: string) => void;
}

const bottomNavItems = [
  { id: 'policy', label: 'Policy', icon: FileText },
  { id: 'ask-ai', label: 'Ask AI', icon: MessageCircle },
  { id: 'bills', label: 'Bills', icon: Receipt },
  { id: 'appeal', label: 'Appeal', icon: Scale },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

const moreItems = [
  { id: 'pre-visit', label: 'Pre-Visit', icon: ClipboardCheck },
  { id: 'optimize', label: 'Optimize', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'account', label: 'Account', icon: User },
];

export default function BottomNav({ activeItem, onNavigate }: BottomNavProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleMoreItemClick = (itemId: string) => {
    onNavigate(itemId);
    setIsMoreOpen(false);
  };

  const isMoreActive = ['pre-visit', 'optimize', 'settings', 'account'].includes(activeItem);

  return (
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 md:hidden">
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === 'more' ? isMoreActive : activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => item.id === 'more' ? setIsMoreOpen(true) : onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-accent' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Sheet for More Items */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20" 
            onClick={() => setIsMoreOpen(false)}
          />
          
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl transform transition-transform duration-300">
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* More Items */}
            <div className="px-4 pb-6">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMoreItemClick(item.id)}
                    className={`flex items-center gap-3 w-full p-4 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-accent/10 text-accent' 
                        : 'hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
