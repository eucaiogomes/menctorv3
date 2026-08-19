/* global React */
const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// ════════════════════════════════════════════════════════════
// ICONS — small inline SVGs, stroke-based, calmer than emoji
// ════════════════════════════════════════════════════════════
const Icon = ({ name, size = 18, color = "currentColor", strokeWidth = 1.6, style }) => {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", style };
  switch (name) {
    case "home":     return <svg {...props}><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>;
    case "pulse":    return <svg {...props}><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>;
    case "users":    return <svg {...props}><circle cx="9" cy="9" r="3.2"/><path d="M3 20c0-3 2.6-5 6-5s6 2 6 5"/><circle cx="17" cy="8.5" r="2.5"/><path d="M16 14.5c2.5.3 5 1.8 5 4.5"/></svg>;
    case "book":     return <svg {...props}><path d="M4 4h7a3 3 0 0 1 3 3v13"/><path d="M20 4h-7a3 3 0 0 0-3 3"/><path d="M4 4v15h7"/><path d="M20 4v15h-7"/></svg>;
    case "search":   return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "bell":     return <svg {...props}><path d="M6 16V11a6 6 0 0 1 12 0v5"/><path d="M4 16h16"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>;
    case "plus":     return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case "chevron-right": return <svg {...props}><path d="m9 6 6 6-6 6"/></svg>;
    case "chevron-down":  return <svg {...props}><path d="m6 9 6 6 6-6"/></svg>;
    case "chevron-left":  return <svg {...props}><path d="m15 6-6 6 6 6"/></svg>;
    case "arrow-right":   return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "arrow-up":      return <svg {...props}><path d="M12 19V5M6 11l6-6 6 6"/></svg>;
    case "arrow-down":    return <svg {...props}><path d="M12 5v14M6 13l6 6 6-6"/></svg>;
    case "leaf":     return <svg {...props}><path d="M4 20c0-9 7-16 16-16 0 9-7 16-16 16Z"/><path d="M4 20c4-4 8-8 12-12"/></svg>;
    case "shield":   return <svg {...props}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/></svg>;
    case "spark":    return <svg {...props}><path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l4 4M14 14l4 4M18 6l-4 4M10 14l-4 4"/></svg>;
    case "file":     return <svg {...props}><path d="M14 3H6v18h12V7l-4-4Z"/><path d="M14 3v4h4"/></svg>;
    case "download": return <svg {...props}><path d="M12 4v12M6 11l6 6 6-6"/><path d="M4 20h16"/></svg>;
    case "filter":   return <svg {...props}><path d="M3 5h18M6 12h12M10 19h4"/></svg>;
    case "settings": return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>;
    case "check":    return <svg {...props}><path d="m4 12 5 5L20 6"/></svg>;
    case "x":        return <svg {...props}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case "more":     return <svg {...props}><circle cx="6" cy="12" r="1.5" fill={color} stroke="none"/><circle cx="12" cy="12" r="1.5" fill={color} stroke="none"/><circle cx="18" cy="12" r="1.5" fill={color} stroke="none"/></svg>;
    case "more-vertical": return <svg {...props}><circle cx="12" cy="6" r="1.5" fill={color} stroke="none"/><circle cx="12" cy="12" r="1.5" fill={color} stroke="none"/><circle cx="12" cy="18" r="1.5" fill={color} stroke="none"/></svg>;
    case "refresh":  return <svg {...props}><path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v4h-4"/></svg>;
    case "external": return <svg {...props}><path d="M14 4h6v6M20 4 10 14"/><path d="M19 13v6H5V5h6"/></svg>;
    case "link":     return <svg {...props}><path d="M10 14a4 4 0 0 0 5.5 0l3-3a4 4 0 1 0-5.5-5.5L12 7"/><path d="M14 10a4 4 0 0 0-5.5 0l-3 3a4 4 0 1 0 5.5 5.5L12 17"/></svg>;
    case "send":     return <svg {...props}><path d="m4 12 16-8-6 18-3-7-7-3Z"/></svg>;
    case "calendar": return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case "drag":     return <svg {...props}><circle cx="9" cy="6" r="1" fill={color} stroke="none"/><circle cx="9" cy="12" r="1" fill={color} stroke="none"/><circle cx="9" cy="18" r="1" fill={color} stroke="none"/><circle cx="15" cy="6" r="1" fill={color} stroke="none"/><circle cx="15" cy="12" r="1" fill={color} stroke="none"/><circle cx="15" cy="18" r="1" fill={color} stroke="none"/></svg>;
    case "trash":    return <svg {...props}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>;
    case "edit":     return <svg {...props}><path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m14 5 4 4"/></svg>;
    case "eye":      return <svg {...props}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "sparkles": return <svg {...props}><path d="M12 4v4M12 16v4M4 12h4M16 12h4M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/></svg>;
    case "command":  return <svg {...props}><path d="M9 6V18M15 6V18M6 9h12M6 15h12"/></svg>;
    case "logout":   return <svg {...props}><path d="M9 4H5v16h4"/><path d="m15 8 4 4-4 4"/><path d="M19 12H9"/></svg>;
    case "globe":    return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/></svg>;
    case "map":      return <svg {...props}><path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7Z"/><path d="M9 4v13M15 7v13"/></svg>;
    case "flag":     return <svg {...props}><path d="M4 15V4"/><path d="M4 4h12l-2.5 5.5L16 15H4"/></svg>;
    case "lock":     return <svg {...props}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case "milestone":return <svg {...props}><path d="M18 6H5a2 2 0 0 0 0 4h13l3-2-3-2Z"/><path d="M12 6v16"/></svg>;
    case "pipeline": return <svg {...props}><rect x="3" y="5" width="4" height="14" rx="1"/><rect x="10" y="5" width="4" height="9" rx="1"/><rect x="17" y="5" width="4" height="12" rx="1"/></svg>;
    case "activity": return <svg {...props}><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>;
    case "clipboard":return <svg {...props}><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M8 11h8M8 15h5"/></svg>;
    case "file-text":return <svg {...props}><path d="M14 3H6v18h12V7l-4-4Z"/><path d="M14 3v4h4"/><path d="M8 13h8M8 17h5"/></svg>;
    case "presentation": return <svg {...props}><path d="M3 4h18"/><path d="M5 4v12h14V4"/><path d="M12 16v4"/><path d="M8 20h8"/><path d="M9 12l3-4 2 2 3-4"/></svg>;
    case "megaphone": return <svg {...props}><path d="M3 10v4a1 1 0 0 0 1 1h2l5 4V5L6 9H4a1 1 0 0 0-1 1Z"/><path d="M15 8.5a3.5 3.5 0 0 1 0 7"/><path d="M18 6a7 7 0 0 1 0 12"/></svg>;
    case "menu":      return <svg {...props}><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>;
    case "bar-chart": return <svg {...props}><path d="M4 20V10"/><path d="M12 20V4"/><path d="M20 20v-7"/></svg>;
    default:         return null;
  }
};

// ════════════════════════════════════════════════════════════
// LOGO
// ════════════════════════════════════════════════════════════
const Logo = ({ size = 52 }) => (
  <img
    src="/assets/logo-menctor.png"
    alt="Menctor"
    style={{ height: size, width: "auto", display: "block" }}
  />
);

// ════════════════════════════════════════════════════════════
// APP HEADER — top bar with logo (left) and user (right)
// ════════════════════════════════════════════════════════════
const AppHeader = ({ userName = "Alex Sandro", userRole = "Consultor Lector", onToggleSidebar, sidebarOpen }) => {
  const [open, setOpen] = React.useState(false);
  const initials = userName.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase();
  return (
    <header className="app-header">
      <div className="app-header-logo">
        {onToggleSidebar && (
          <button
            className={`hamburger${sidebarOpen ? " open" : ""}`}
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={!!sidebarOpen}
          >
            <Icon name={sidebarOpen ? "x" : "menu"} size={19} strokeWidth={1.8} color="#0E2748" />
          </button>
        )}
        <Logo size={46} />
      </div>
      <div className="app-header-user" style={{ position: "relative" }}>
        <button className="app-header-user-btn" onClick={() => setOpen(!open)}>
          <span className="app-header-user-meta hide-on-mobile">
            <span className="app-header-user-name">{userName}</span>
            <span className="app-header-user-role">{userRole}</span>
          </span>
          <span className="app-header-avatar">{initials}</span>
          <Icon name="chevron-down" size={13} color="#838DA0" />
        </button>
        {open && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setOpen(false)} />
            <div className="popover" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 220, padding: 6, background: "#fff", border: "1px solid #E7EAF1", zIndex: 200 }}>
              <div style={{ padding: "8px 12px 6px" }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0E2748" }}>{userName}</div>
                <div style={{ fontSize: 11.5, color: "#5C667C", marginTop: 1 }}>{userRole}</div>
              </div>
              <div style={{ borderTop: "1px solid #E7EAF1", margin: "4px 0" }} />
              <button className="nav-item" style={{ width: "100%" }}>
                <Icon name="settings" size={15} color="#5C667C" />
                <span>Ajustes</span>
              </button>
              <button className="nav-item" style={{ width: "100%" }}>
                <Icon name="logout" size={15} color="#5C667C" />
                <span>Sair</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

// ════════════════════════════════════════════════════════════
// SIDEBAR
// ════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id: "home",         icon: "home",      label: "Visão geral",  group: "operacional" },
  { id: "clientes",     icon: "users",     label: "Clientes",     group: "comercial"   },
  { id: "campanhas",    icon: "megaphone", label: "Campanhas",    group: "comercial"   },
  { id: "pipeline",     icon: "pipeline",  label: "Pipeline",     group: "comercial"   },
  { id: "aprendizado",  icon: "book",      label: "Aprendizado",  group: "conteudo"    },
  { id: "diagnosticos", icon: "pulse",     label: "Diagnósticos", group: "conteudo"    },
  { id: "entrevistas",  icon: "clipboard", label: "Entrevistas",  group: "conteudo"    },
  { id: "denuncias",    icon: "shield",    label: "Denúncias",    group: "conteudo"    },
];

const NAV_GROUPS = [
  { id: "operacional", label: "Operacional" },
  { id: "comercial",   label: "Comercial" },
  { id: "conteudo",    label: "Conteúdo" },
];

const Sidebar = ({ active, onNavigate, open = true, onClose }) => {
  // Count pending roadmap actions across active clients for badge
  const pendingRoadmap = React.useMemo(() => {
    try {
      if (!window.ROADMAP_ESTADO || !window.CLIENTES) return 0;
      const ativos = window.CLIENTES.filter(c => c.status === "ativo");
      return ativos.filter(c => {
        const est = window.ROADMAP_ESTADO[c.id];
        if (!est) return false;
        return est.etapas[est.faseAtual].some(e => e.status === "em_andamento");
      }).length;
    } catch { return 0; }
  }, []);

  const sidebarClass = `sidebar${open ? " open" : ""}`;

  return (
    <aside className={sidebarClass}>
      {onClose && (
        <div className="sidebar-mobile-head">
          <Logo size={42} />
          <button onClick={onClose} style={{ width: 32, height: 32, border: "none", background: "#F1F2F7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#5C667C" }} aria-label="Fechar menu">×</button>
        </div>
      )}

      <nav style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {NAV_GROUPS.map(group => {
          const items = NAV_ITEMS.filter(i => i.group === group.id);
          return (
            <div key={group.id} style={{ marginBottom: 16 }}>
              <div className="eyebrow" style={{ fontSize: 10, padding: "0 12px", marginBottom: 6, color: "var(--ink-faint)", letterSpacing: "0.06em" }}>{group.label}</div>
              {items.map(item => {
                const isActive = active === item.id;
                const badge = item.id === "roadmap" && pendingRoadmap > 0 ? pendingRoadmap : null;
                return (
                  <button key={item.id}
                    className={`nav-item${isActive ? " is-active" : ""}`}
                    onClick={() => onNavigate(item.id)}>
                    <Icon name={item.icon} size={17} strokeWidth={isActive ? 2 : 1.6}
                      color={isActive ? "#F66B0A" : "#5C667C"} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {badge && (
                      <span style={{ minWidth: 18, height: 18, borderRadius: 999, background: "#F66B0A", color: "#fff", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 5px", letterSpacing: "-0.01em" }}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid #E7EAF1" }}>
        <button
          className="nav-item"
          onClick={() => {
            const currentUrl = localStorage.getItem("RELATORIO_API_URL") || "http://localhost:5000";
            const newUrl = prompt("URL da API de Relatório:", currentUrl);
            if (newUrl !== null) {
              localStorage.setItem("RELATORIO_API_URL", newUrl.trim().replace(/\/$/, ""));
              window.location.reload();
            }
          }}>
          <Icon name="settings" size={16} strokeWidth={1.6} color="#5C667C" />
          <span>Ajustes</span>
        </button>
      </div>
    </aside>
  );
};

// ════════════════════════════════════════════════════════════
// TOP BAR — Perplexity-style centered search
// ════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
// ROLE SWITCHER — fixed top-right pill to swap profile
// ════════════════════════════════════════════════════════════
const ROLES = [
  { id: "credenciado", label: "Credenciado", sub: "Caio Guedes · Consultor Lector",     color: "#F66B0A", inits: "CG" },
  { id: "admin",       label: "Admin RH",    sub: "Mariana Aguiar · Loghaus",            color: "#00204D", inits: "MA" },
  { id: "aluno",       label: "Aluno",       sub: "Roberto Tavares · Colaborador",       color: "#FFAA1A", inits: "RT" },
];

const RoleSwitcher = ({ role, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const current = ROLES.find(r => r.id === role);
  return (
    <div className="role-switcher" style={{ position: "fixed", top: 18, right: 24, zIndex: 200 }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "6px 12px 6px 14px",
        background: "#FFFFFF",
        border: "1px solid #E7EAF1",
        borderRadius: 999, fontSize: 13, color: "#0E2748",
        boxShadow: "0 1px 2px rgba(10,23,48,0.04)"
      }}>
        <span style={{ fontSize: 10, color: "#838DA0", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Perfil</span>
        <span style={{ fontWeight: 700 }}>{current.label}</span>
        <span style={{ width: 26, height: 26, borderRadius: 999, background: current.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{current.inits}</span>
        <Icon name="chevron-down" size={13} color="#5C667C"/>
      </button>
      {open && (
        <div className="popover" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 280, padding: 6, background:"#fff", border:"1px solid #E7EAF1" }}>
          <div style={{ padding: "8px 12px 6px", fontSize: 10, color: "#838DA0", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Trocar de perfil (demo)</div>
          {ROLES.map(r => {
            const active = r.id === role;
            return (
              <button key={r.id} onClick={() => { onChange(r.id); setOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 10,
                background: active ? "#FFF4EC" : "transparent",
                width: "100%", textAlign: "left"
              }}>
                <span style={{ width: 32, height: 32, borderRadius: 999, background: r.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{r.inits}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0E2748" }}>{r.label}</div>
                  <div style={{ fontSize: 11.5, color: "#5C667C", marginTop: 1 }}>{r.sub}</div>
                </div>
                {active && <Icon name="check" size={14} color="#F66B0A"/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TopBar = ({ role, onChangeRole, title, subtitle, breadcrumb, onToggleSidebar, sidebarOpen }) => {
  return (
    <div className="topbar" style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 20px 0",
    }}>
      {/* Mobile hamburger */}
      {onToggleSidebar && (
        <button 
          className={`hamburger${sidebarOpen ? " open" : ""}`} 
          onClick={onToggleSidebar}
          aria-label="Abrir menu">
          <span></span><span></span><span></span>
        </button>
      )}
      <div className="title-area" style={{ minWidth: 0, flex: 1 }}>
        {breadcrumb && (
          <div style={{ fontSize: 12, color: "#838DA0", marginBottom: 2, letterSpacing: "0.01em" }}>
            {breadcrumb.map((c, i) => (
              <span key={i}>
                {i > 0 && <span style={{ margin: "0 5px" }}>/</span>}
                <span style={{ color: i === breadcrumb.length - 1 ? "#5C667C" : "#838DA0" }}>{c}</span>
              </span>
            ))}
          </div>
        )}
        <h1 className="display" style={{ fontSize: 30, margin: 0, letterSpacing: "-0.025em", color: "#0E2748" }}>{title}</h1>
        {subtitle && <p style={{ margin: "4px 0 0", color: "#5C667C", fontSize: 14, maxWidth: 620 }}>{subtitle}</p>}
      </div>

      <div className="actions" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 16 }}>
        <button className="btn btn-soft hide-on-mobile" style={{ height: 34, padding: "0 12px", fontSize: 12.5 }}>
          <Icon name="search" size={14} />
          <span>Buscar</span>
        </button>
        <button className="btn btn-soft" style={{ height: 34, width: 34, padding: 0, justifyContent: "center" }}>
          <Icon name="bell" size={15} />
        </button>
        <button
          onClick={onChangeRole}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "4px 8px 4px 12px",
            background: "#FFFFFF",
            border: "1px solid #E7EAF1",
            borderRadius: 999,
            fontSize: 12, color: "#0E2748", fontWeight: 600
          }}>
          <span style={{ color: "#838DA0", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{role}</span>
          <span style={{ width: 24, height: 24, borderRadius: 999, background: "#F66B0A", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>CG</span>
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// LAYOUT WRAPPER
// ════════════════════════════════════════════════════════════
const Page = ({ children }) => (
  <main className="page-content">
    {children}
  </main>
);

// ════════════════════════════════════════════════════════════
// RISK MEDALLION — small circular indicator for COPSOQ score
// ════════════════════════════════════════════════════════════
const RiskMedallion = ({ value, max = 4, size = 64 }) => {
  // value 0-4. 0-1 baixo (health), 1.5-2.5 moderado (amber), 2.5+ alto (coral)
  const color = value >= 2.5 ? "var(--coral)" : value >= 1.5 ? "var(--amber)" : "var(--health)";
  const pct = Math.min(1, value / max);
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line)" strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ fontFamily: "var(--display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: size * 0.42, lineHeight: 1, color: "var(--ink)" }}>{value.toFixed(1)}</div>
        <div style={{ fontSize: 9, color: "var(--ink-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>/ {max}</div>
      </div>
    </div>
  );
};

const riskLabel = (v) => v == null ? "Sem diagnóstico" : v >= 2.5 ? "Alto risco" : v >= 1.5 ? "Moderado" : "Saudável";
const riskPill  = (v) => v == null ? "pill-neutral" : v >= 2.5 ? "pill-coral" : v >= 1.5 ? "pill-amber" : "pill";

Object.assign(window, { Icon, Logo, Sidebar, TopBar, AppHeader, Page, RiskMedallion, riskLabel, riskPill, NAV_ITEMS, RoleSwitcher, ROLES });
