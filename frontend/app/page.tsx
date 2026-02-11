'use client';

import { useState, useCallback } from 'react';
import { api, PolicyData } from '../lib/api';
import PolicyUpload from '../components/PolicyUpload';
import AIWorkspace from '../components/AIWorkspace';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import { Menu } from 'lucide-react';

export default function Home() {
  const [policyData, setPolicyData] = useState<PolicyData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeNav, setActiveNav] = useState('policy');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handlePolicyUploaded = (data: PolicyData) => {
    setPolicyData(data);
  };

  const handleReset = () => {
    setPolicyData(null);
  };

  const handleNavigate = (item: string) => {
    setActiveNav(item);
    setIsMobileMenuOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar 
          activeItem={activeNav}
          onNavigate={handleNavigate}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-black/20" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white">
            <Sidebar 
              activeItem={activeNav}
              onNavigate={handleNavigate}
              isCollapsed={false}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="text-heading font-semibold">MedFin</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="page-container py-6">
            {!policyData ? (
              <PolicyUpload 
                onPolicyUploaded={handlePolicyUploaded}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
              />
            ) : (
              <AIWorkspace 
                policyData={policyData} 
                onReset={handleReset}
                activeSection={activeNav}
                onNavigate={handleNavigate}
              />
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav 
          activeItem={activeNav}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
}
