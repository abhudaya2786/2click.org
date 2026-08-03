import React, { useState } from "react";
import {
  MapPin,
  Smartphone,
  Bell,
  LogIn,
  LogOut,
  UserCheck,
} from "lucide-react";

interface MinimalHeaderProps {
  isLoggedIn: boolean;
  userName?: string;
  userRole?: string;
  activeBrandTitle?: string;
  onOpenLoginModal?: () => void;
  onLoginClick?: () => void;
  onLogoutClick: () => void;
  currentGpsLocation?: string;
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  isLoggedIn,
  userName = "User",
  userRole = "Regular User",
  activeBrandTitle = "2click.in",
  onOpenLoginModal,
  onLoginClick,
  onLogoutClick,
  currentGpsLocation = "Gorakhpur Zone",
}) => {
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const handleLogin = onOpenLoginModal || onLoginClick || (() => {});

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 transition-all shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO & BRAND NAME */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-lg shadow-lg shadow-emerald-500/20">
            2c
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              {activeBrandTitle}
            </span>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
              WHITE-LABEL READY
            </span>
          </div>
        </div>

        {/* HEADER CONTROLS (GPS, APK, NOTIFICATION, LOGIN) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 1. GPS Location Button */}
          <button
            onClick={() => alert(`वर्तमान लोकेशन: ${currentGpsLocation}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 text-xs font-bold transition"
            title="GPS Location"
          >
            <MapPin size={14} className="animate-pulse text-amber-400" />
            <span className="hidden sm:inline">{currentGpsLocation}</span>
            <span className="sm:hidden">GPS</span>
          </button>

          {/* 2. App / APK Download */}
          <a
            href="#download-apk"
            onClick={(e) => {
              e.preventDefault();
              alert("Android APK डाउनलोड हो रहा है...");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition"
          >
            <Smartphone size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">App / APK</span>
          </a>

          {/* 3. Notification */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition relative"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">नोटिफिकेशन्स</span>
                  <button
                    onClick={() => setUnreadNotifications(0)}
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1.5 text-slate-300 text-[11px]">
                  <div className="p-2 bg-slate-950 rounded-xl">
                    📍 नया सोलर कोटेशन अपडेट हुआ।
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. 🔴 CLEAR & PROMINENT LOGIN BUTTON */}
          {!isLoggedIn ? (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/25 transform active:scale-95 cursor-pointer"
            >
              <LogIn size={15} />
              <span>Login / Sign In</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 pl-3">
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <UserCheck size={12} className="text-emerald-400" />{" "}
                  {userName}
                </div>
                <div className="text-[9px] text-slate-400 uppercase font-mono">
                  {userRole}
                </div>
              </div>
              <button
                onClick={onLogoutClick}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 transition cursor-pointer"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
