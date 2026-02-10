'use client';

import { 
  FileText, 
  MessageCircle, 
  Receipt, 
  Scale, 
  MoreHorizontal
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

export default function BottomNav({ activeItem, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
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
  );
}
