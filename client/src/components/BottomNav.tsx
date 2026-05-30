import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: '抽签', icon: SlipIcon },
  { to: '/featured', label: '爱看不看', icon: ClockIcon },
  { to: '/library', label: '先存再说', icon: LibraryIcon },
  { to: '/chat', label: '问教员', icon: ChatIcon },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-rule bg-paper-card/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-14 max-w-2xl">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center justify-center gap-0.5 font-sans text-xs transition-colors ${
                isActive ? 'text-crimson' : 'text-ink-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 h-0.5 w-10 rounded-full bg-crimson" />
                )}
                <Icon active={isActive} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function SlipIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="8"
        y="3"
        width="8"
        height="18"
        rx="1"
        stroke={active ? '#B91C1C' : '#6B6358'}
        strokeWidth="1.5"
      />
      <line x1="10" y1="7" x2="14" y2="7" stroke={active ? '#B91C1C' : '#6B6358'} strokeWidth="1" />
      <line x1="10" y1="10" x2="14" y2="10" stroke={active ? '#B91C1C' : '#6B6358'} strokeWidth="1" />
    </svg>
  );
}

function LibraryIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 4h5v16H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm7 0h7v16h-7V4Z"
        stroke={active ? '#B91C1C' : '#6B6358'}
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ClockIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke={active ? '#B91C1C' : '#6B6358'}
        strokeWidth="1.5"
      />
      <path
        d="M12 8v4l2.5 1.5"
        stroke={active ? '#B91C1C' : '#6B6358'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 3V6a1 1 0 0 1 1-1Z"
        stroke={active ? '#B91C1C' : '#6B6358'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
