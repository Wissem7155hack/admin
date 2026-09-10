import { ReactNode } from 'react';
import './IPhoneLockScreen.css';

interface IPhoneLockScreenProps {
  children?: ReactNode;
  backgroundImage?: string;
  time?: string;
  date?: string;
  className?: string;
  scale?: number;
}

export default function IPhoneLockScreen({
  children,
  backgroundImage = 'https://webdevartur.com/wp-content/uploads/2022/08/ryan-klaus-8QjsdoXDsZs-unsplash-scaled.jpg',
  time = '19:53',
  date = 'Tuesday, 9 August',
  className = '',
  scale = 1.72,
}: IPhoneLockScreenProps) {
  return (
    <div
      className={`iphone-lock-outer-scaler ${className}`}
      style={{
        width: 212 * scale,
        height: 438 * scale,
      }}
    >
      <div
        className="iphone-lock-wrapper"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div
          className="outside-border"
          style={{
            backgroundImage: backgroundImage ? `url("${backgroundImage}")` : undefined,
          }}
        >
          <div className="silencer" />
          <div className="volume-up" />
          <div className="volume-down" />
          <div className="button-on" />
          
          <div className="inside-border">
            {/* Top Notch / Camera & Speaker */}
            <div className="camera">
              <div className="camera-dot">
                <div className="camera-dot-2" />
                <div className="camera-dot-3" />
              </div>
              <div className="camera-speaker" />
            </div>

            {children ? (
              /* Custom embedded content mode (e.g. app preview / offer / membership) */
              <div className="iphone-screen-content">
                {children}
              </div>
            ) : (
              /* Default Lockscreen UI mode */
              <>
                {/* Lock */}
                <div className="lock">
                  <div className="lock-locked" />
                </div>

                {/* Time */}
                <div className="time">{time}</div>

                {/* Battery and Signal */}
                <div className="t-r-info">
                  <div className="dots">...</div>
                  <div className="battery">
                    <div className="bar" />
                    <div className="dot" />
                  </div>
                </div>

                {/* Date */}
                <div className="date">{date}</div>

                {/* Torch */}
                <div className="torch-outter">
                  <div className="light" />
                  <div className="top" />
                  <div className="switch-top" />
                  <div className="switch-section" />
                  <div className="switch">
                    <div className="dot" />
                  </div>
                </div>

                {/* Camera Icon */}
                <div className="camera-outter">
                  <div className="box" />
                  <div className="eye" />
                  <div className="circle" />
                  <div className="dot" />
                </div>

                {/* Bottom Home Indicator Line */}
                <div className="bottom-line" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
