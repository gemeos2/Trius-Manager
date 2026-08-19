"use client";

import { useState } from "react";
import { NAV_ITEMS } from "./nav-items";
import { NavLink } from "./NavLink";
import { MobileMenuOverlay } from "./MobileMenuOverlay";
import { signOut } from "@/app/auth/actions";
import { BeveledBox } from "@/components/ui/BeveledBox";
import { TriusMark } from "@/components/ui/TriusMark";

interface SiteHeaderProps {
  userName: string;
  orgName: string;
}

export function SiteHeader({ userName, orgName }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="site-header is-mounted">
        <NavLink href="/gestao/dashboard" className="brand" activeClassName="">
          <TriusMark />
          <span className="brand-tag">{orgName}</span>
        </NavLink>

        <nav className="nav-links" aria-label="Seções">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} className="nav-link">
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <span className="sr-only">{userName}</span>
          <form action={signOut}>
            <button className="ds-btn" data-tooltip="Sair" type="submit">
              <BeveledBox bevel={10}>
                <span className="btn-inner transparent btn-sm">
                  <span className="btn-label">Sair</span>
                  <span className="transparent__background" aria-hidden="true" />
                </span>
              </BeveledBox>
            </button>
          </form>
          <button className="ds-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <BeveledBox bevel={10}>
              <span className="btn-inner transparent btn-sm">
                <span className="btn-label">Menu</span>
              </span>
            </BeveledBox>
          </button>
        </div>
      </header>
      <MobileMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
