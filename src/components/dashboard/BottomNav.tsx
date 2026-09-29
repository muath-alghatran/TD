"use client";

export type NavTarget = "home" | "parts";

function IcHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5h12V10" />
      <path d="M10 19.5V14h4v5.5" />
    </svg>
  );
}

function IcGarage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 11 12 4l8.5 7" />
      <path d="M5 10v9.5h14V10" />
      <rect x="8" y="13" width="8" height="6.5" rx="1" />
      <path d="M8.6 15.6h6.8" />
    </svg>
  );
}

function IcGear() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="6.1" />
      <circle cx="12" cy="12" r="2.2" />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x="10.9" y="2" width="2.2" height="4.2" rx="0.6" transform={`rotate(${i * 45} 12 12)`} />
      ))}
    </svg>
  );
}

function IcLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0V11" />
    </svg>
  );
}

type NavItem =
  | { key: NavTarget; label: string; icon: () => React.ReactElement; locked?: false }
  | { key: "garage"; label: string; icon: () => React.ReactElement; locked: true };

const ITEMS: NavItem[] = [
  { key: "home", label: "الرئيسية", icon: IcHome },
  { key: "garage", label: "كراجي", icon: IcGarage, locked: true },
  { key: "parts", label: "قطع الغيار", icon: IcGear },
];

export function BottomNav({ active, onNavigate }: { active: NavTarget; onNavigate: (target: NavTarget) => void }) {
  return (
    <nav className="bottom-nav" aria-label="التنقل الرئيسي">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        if (item.locked) {
          return (
            <button key={item.key} disabled aria-disabled="true">
              <span className="ic">
                <Icon />
                <span className="lock">
                  <IcLock />
                </span>
              </span>
              {item.label}
            </button>
          );
        }
        const on = item.key === active;
        return (
          <button key={item.key} className={on ? "on" : ""} aria-current={on ? "page" : undefined} onClick={() => onNavigate(item.key)}>
            <span className="ic">
              <Icon />
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
