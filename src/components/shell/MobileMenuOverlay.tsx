"use client";

import { NAV_ITEMS } from "./nav-items";
import { NavLink } from "./NavLink";

interface MobileMenuOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenuOverlay({ open, onClose }: MobileMenuOverlayProps) {
  return (
    <div className={`menu-overlay ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <button className="ds-btn menu-close" onClick={onClose} aria-label="Fechar menu">
        <svg width="24" height="24" viewBox="0 0 5 5" fill="currentColor" aria-hidden="true">
          <rect x="0" y="0" width="1" height="1" /><rect x="4" y="0" width="1" height="1" />
          <rect x="1" y="1" width="1" height="1" /><rect x="3" y="1" width="1" height="1" />
          <rect x="2" y="2" width="1" height="1" />
          <rect x="1" y="3" width="1" height="1" /><rect x="3" y="3" width="1" height="1" />
          <rect x="0" y="4" width="1" height="1" /><rect x="4" y="4" width="1" height="1" />
        </svg>
      </button>
      <nav className="menu-links" aria-label="Seções (mobile)">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} href={item.href} className="menu-link" onClick={onClose}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
