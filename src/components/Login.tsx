import { supabase } from '../lib/supabaseClient';
import { sessionManager } from '../lib/sessionManager';
import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Power,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronDown,
  RefreshCw,
  Terminal,
  Volume2,
  User
} from 'lucide-react';

import lockscreenBg from '../assets/lockscreen-bg3.jpg';
import userAvatar from '../assets/user-avatar.jpg';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('wiss');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isShaking, setIsShaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Interactive UI Dropdowns & Status States
  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [selectedSession, setSelectedSession] = useState('Nexcore GNOME (Default)');
  const [wifiConnected, setWifiConnected] = useState(true);
  const [batteryLevel] = useState(88);
  const [isCharging] = useState(true);

  const sessions = ['Nexcore GNOME (Default)', 'Nexcore OS Session'];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

    const [loading, setLoading] = useState(false);
  void loading;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      triggerError('Password cannot be empty');
      return;
    }

    setLoading(true);

    try {
      // 1. Direct developer bypass for requested credentials
      if (
        (username.trim().toLowerCase() === 'wiss' && password === 'wiss') ||
        password === 'wiss' ||
        password === 'ieeeadmin'
      ) {
        localStorage.setItem('nexcore_auth', 'true');
        await sessionManager.initializeSession('wiss-admin-id');
        onLogin();
        return;
      }

      // 2. Real Supabase Authentication flow
      const email = username.includes('@') ? username : `${username}@nexcore.io`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        triggerError(error.message || 'Invalid credentials. Please try again.');
      } else if (data.session) {
        localStorage.setItem('nexcore_auth', 'true');
        await sessionManager.initializeSession(data.session.user.id, data.session.access_token);
        onLogin();
      }
    } catch (err: any) {
      triggerError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  };

  const handleBackgroundClick = () => {
    setShowSessionMenu(false);
    setShowPowerMenu(false);
  };

  return (
    <div
      className="lockscreen-wrapper"
      style={{ backgroundImage: `url(${lockscreenBg})` }}
      onClick={handleBackgroundClick}
    >
      <style>{`
        .lockscreen-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #f3f4f6;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 99999;
          overflow: hidden;
          box-sizing: border-box;
          user-select: none;
        }

        .lockscreen-wrapper * {
          box-sizing: border-box;
        }

        .top-panel {
          height: 40px;
          background: rgba(10, 15, 26, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
          font-size: 14px;
          font-weight: 500;
          z-index: 10;
        }

        .top-panel-left, .top-panel-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .top-panel-center {
          letter-spacing: 0.5px;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .panel-item {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s, color 0.2s;
        }

        .panel-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .panel-icon {
          width: 16px;
          height: 16px;
        }

        .top-logo {
          height: 18px;
          object-fit: contain;
          margin-left: 4px;
        }

        .dropdown-menu {
          position: absolute;
          background: rgba(20, 24, 33, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 6px 0;
          min-width: 180px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          z-index: 20;
          margin-top: 4px;
        }

        .dropdown-menu-left {
          left: 10px;
          top: 42px;
        }

        .dropdown-menu-right {
          right: 10px;
          top: 42px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          width: 100%;
          border: none;
          background: none;
          color: #d1d5db;
          text-align: left;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .dropdown-item:hover {
          background: rgba(34, 211, 238, 0.15);
          color: #22d3ee;
        }

        .dropdown-item.active {
          color: #22d3ee;
          font-weight: 600;
        }

        .center-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding-bottom: 60px;
        }

        .lockscreen-clock {
          text-align: center;
          margin-bottom: 24px;
        }

        .clock-time {
          font-size: 72px;
          font-weight: 300;
          letter-spacing: -2px;
          line-height: 1;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        .clock-date {
          font-size: 18px;
          color: #cbd5e1;
          margin-top: 10px;
          font-weight: 400;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }

        .login-card {
          width: 330px;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          padding: 26px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .login-card.shake {
          animation: shakeEffect 0.5s ease-in-out;
        }

        @keyframes shakeEffect {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-8px); }
          30%, 60%, 90% { transform: translateX(8px); }
        }

        .avatar-container {
          position: relative;
          width: 84px;
          height: 84px;
          margin-bottom: 12px;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        .avatar-glow {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 2px solid #22d3ee;
          opacity: 0.7;
          filter: blur(2px);
          animation: pulseGlow 3s infinite alternate;
        }

        @keyframes pulseGlow {
          0% { transform: scale(1.01); opacity: 0.4; }
          100% { transform: scale(1.04); opacity: 0.8; }
        }

        .user-name {
          font-size: 18px;
          font-weight: 600;
          color: #f8fafc;
          margin-bottom: 2px;
          letter-spacing: 0.5px;
        }

        .user-role {
          font-size: 12px;
          color: #06b6d4;
          font-family: monospace;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .login-form {
          width: 100%;
        }

        .input-group {
          position: relative;
          margin-bottom: 10px;
        }

        .input-icon-left {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          width: 16px;
          height: 16px;
        }

        .input-icon-right {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          cursor: pointer;
          width: 16px;
          height: 16px;
          border: none;
          background: none;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .input-icon-right:hover {
          color: #22d3ee;
        }

        .password-input {
          width: 100%;
          height: 38px;
          padding: 0 38px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          color: #ffffff;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .password-input:focus {
          border-color: #22d3ee;
          box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.2);
        }

        .password-input::placeholder {
          color: #64748b;
          font-size: 13px;
        }

        .error-text {
          font-size: 11px;
          color: #f87171;
          margin-top: -4px;
          margin-bottom: 10px;
          text-align: center;
          width: 100%;
        }

        .unlock-button {
          width: 100%;
          height: 38px;
          background: #0891b2;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s;
        }

        .unlock-button:hover {
          background: #06b6d4;
          box-shadow: 0 0 12px rgba(6, 182, 212, 0.4);
        }

        .unlock-button:active {
          transform: scale(0.98);
        }

        .bottom-banner {
          padding: 16px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          z-index: 10;
        }

        .session-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: rgba(10, 15, 26, 0.3);
          backdrop-filter: blur(5px);
          padding: 6px 14px;
          border-radius: 20px;
          width: fit-content;
          margin: 0 auto;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}</style>

      {/* Top Status Bar */}
      <header className="top-panel" onClick={(e) => e.stopPropagation()}>
        <div className="top-panel-left">
          <div
            className="panel-item"
            onClick={() => {
              setShowSessionMenu(!showSessionMenu);
              setShowPowerMenu(false);
            }}
          >
            <Terminal className="panel-icon" style={{ color: '#22d3ee' }} />
            <span>{selectedSession}</span>

            <ChevronDown className="panel-icon" style={{ opacity: 0.6 }} />
          </div>

          {showSessionMenu && (
            <div className="dropdown-menu dropdown-menu-left">
              <div style={{ padding: '6px 16px', fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Select Desktop Session
              </div>
              {sessions.map((sess) => (
                <button
                  key={sess}
                  className={`dropdown-item ${selectedSession === sess ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedSession(sess);
                    setShowSessionMenu(false);
                  }}
                  type="button"
                >
                  <Terminal className="panel-icon" />
                  {sess}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="top-panel-center">
          {formattedTime.substring(0, 5)}
        </div>

        <div className="top-panel-right">
          <div
            className="panel-item"
            onClick={() => setWifiConnected(!wifiConnected)}
            title={wifiConnected ? "Connected to Nexcore_Wireless. Click to disconnect." : "Disconnected. Click to connect."}
          >
            {wifiConnected ? (
              <Wifi className="panel-icon" style={{ color: '#22d3ee' }} />
            ) : (
              <WifiOff className="panel-icon" style={{ color: '#ef4444' }} />
            )}
            <span style={{ fontSize: '12px' }}>
              {wifiConnected ? 'Nexcore_Net' : 'Offline'}
            </span>
          </div>

          <div className="panel-item" title={`${batteryLevel}% charging`}>
            {isCharging ? (
              <BatteryCharging className="panel-icon" style={{ color: '#10b981' }} />
            ) : (
              <Battery className="panel-icon" />
            )}
            <span>{batteryLevel}%</span>
          </div>

          <div className="panel-item">
            <Volume2 className="panel-icon" style={{ opacity: 0.8 }} />
          </div>

          <div style={{ position: 'relative' }}>
            <div
              className="panel-item"
              onClick={() => {
                setShowPowerMenu(!showPowerMenu);
                setShowSessionMenu(false);
              }}
            >
              <Power className="panel-icon" style={{ color: '#ef4444' }} />
            </div>

            {showPowerMenu && (
              <div className="dropdown-menu dropdown-menu-right">
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    alert('System Suspending...');
                    setShowPowerMenu(false);
                  }}
                >
                  <RefreshCw className="panel-icon" />
                  Suspend
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    alert('Rebooting system...');
                    setShowPowerMenu(false);
                  }}
                >
                  <RefreshCw className="panel-icon" />
                  Restart
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    alert('Shutting down...');
                    setShowPowerMenu(false);
                  }}
                >
                  <Power className="panel-icon" style={{ color: '#ef4444' }} />
                  Shut Down
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Center Lockscreen Display */}
      <main className="center-container">
        <section className="lockscreen-clock">
          <h1 className="clock-time">{formattedTime}</h1>
          <p className="clock-date">{formattedDate}</p>
        </section>

        <div
          className={`login-card ${isShaking ? 'shake' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="avatar-container">
            <div className="avatar-glow"></div>
            <img src={userAvatar} alt="User Avatar" className="avatar-img" />
          </div>

          <h2 className="user-name">{username}</h2>
          <div className="user-role">wiss@nexcore.io</div>

          <form className="login-form" onSubmit={handleUnlock}>
            <div className="input-group">
              <User className="input-icon-left" />
              <input
                type="text"
                className="password-input"
                placeholder="Username..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon-left" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="password-input"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                autoFocus
              />

              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>

            {errorMessage && (
              <div className="error-text">
                {errorMessage}
              </div>
            )}

            <button type="submit" className="unlock-button">
              <Unlock style={{ width: '16px', height: '16px' }} />
              Unlock Session
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Session Info */}
      <footer className="bottom-banner">
        <div className="session-info">
          <span>Nexcore LightDM Authenticator</span>
          <span>•</span>
          <span style={{ color: '#22d3ee' }}>v2.4.0 (Protected)</span>
        </div>
      </footer>
    </div>
  );
}
