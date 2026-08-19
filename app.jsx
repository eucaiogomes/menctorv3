/* global React, ReactDOM, Sidebar, AdminSidebar, HomeScreen, DiagnosticosScreen, DiagnosticoDetalheScreen, ClientesScreen, ClienteDetalheScreen, PipelineScreen, CampanhasScreen, CampanhaResponderScreen, CampanhaResultadoScreen, RelatorioDocPage, AprendizadoScreen, PortalPropostaScreen, PortalContratoScreen, AdminHome, AdminColaboradores, AdminVitrine, RelatoriosFinaisScreen, RelatoriosCredenciadoScreen, AlunoApp, LeadInviteForm, EmpresaInviteForm, RoadmapScreen, PlanoAcaoScreen, NovoClienteFullPage, EntrevistasScreen, EntrevistaDetalheScreen, MatrizRiscoScreen, DenunciasScreen, DenunciaDetalheScreen, DenunciaPortalPage */
const { useState } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentRole": "health",
  "density": "comfortable",
  "headlineFont": "serif"
}/*EDITMODE-END*/;

const ROUTE_PATHS = {
  home: "/",
  roadmap: "/roadmap",
  diagnosticos: "/diagnosticos",
  "diagnostico-detalhe": "/diagnosticos/detalhe",
  entrevistas: "/entrevistas",
  "entrevista-detalhe": "/entrevistas/detalhe",
  "matriz-risco": "/matriz-risco",
  denuncias: "/denuncias",
  "denuncia-detalhe": "/denuncias/detalhe",
  "denuncia-portal": "/denuncia",
  clientes: "/clientes",
  "cliente-detalhe": "/clientes/detalhe",
  pipeline: "/pipeline",
  campanhas: "/campanhas",
  "campanha-resultado": "/campanhas/resultado",
  relatorios: "/relatorios",
  "plano-acao": "/plano-acao",
  aprendizado: "/aprendizado",
  "cadastro-cliente": "/clientes/novo",
  portal: "/portal",
  "doc-contrato": "/doc/contrato",
  "doc-proposta": "/doc/proposta",
  "doc-relatorio": "/doc/relatorio",
  "admin-home": "/admin",
  "admin-diagnosticos": "/admin/diagnosticos",
  "admin-relatorios": "/admin/relatorios",
  "admin-colaboradores": "/admin/colaboradores",
  "admin-vitrine": "/admin/vitrine",
  "admin-aprendizado": "/admin/aprendizado",
  aluno: "/aluno",
};

const PATH_ROUTES = Object.fromEntries(Object.entries(ROUTE_PATHS).map(([screen, path]) => [path, screen]));

const parseCurrentRoute = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("lead") === "form") return { screen: "lead-form", params: {} };
  if (params.get("empresa-form")) return { screen: "empresa-form", params: { token: params.get("empresa-form") } };
  if (params.get("proposta")) return { screen: "proposal-client", params: { id: params.get("proposta") } };
  if (params.get("contrato")) return { screen: "contract-client", params: { id: params.get("contrato") } };
  if (params.get("campanha")) return { screen: "campanha-responder", params: { id: params.get("campanha"), setor: params.get("setor") || "", cargo: params.get("cargo") || "" } };

  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const screen = PATH_ROUTES[path] || "home";
  const routeParams = {};

  for (const [key, value] of params.entries()) {
    routeParams[key] = value;
  }

  return { screen, params: routeParams };
};

const getInitialRole = () => {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path.startsWith("/admin")) return "admin";
  if (path === "/aluno") return "aluno";
  return "credenciado";
};

const buildRouteUrl = (screen, params = {}) => {
  const url = new URL(window.location.href);
  url.pathname = ROUTE_PATHS[screen] || "/";
  url.search = "";

  Object.entries(params).forEach(([key, value]) => {
    if (["string", "number", "boolean"].includes(typeof value)) {
      url.searchParams.set(key, String(value));
    }
  });

  return `${url.pathname}${url.search}`;
};

function App() {
  const [role, setRole]   = useState(getInitialRole);
  const [route, setRoute] = useState(parseCurrentRoute);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Close sidebar when navigating on mobile
  const navigate = (screen, params = {}) => {
    const nextRoute = { screen, params };
    setRoute(nextRoute);
    window.history.pushState({ route: nextRoute }, "", buildRouteUrl(screen, params));
    window.scrollTo(0, 0);
    setSidebarOpen(false); // auto close on mobile nav
  };

  React.useEffect(() => {
    const onPopState = (event) => {
      if (event.state?.route) {
        setRoute(event.state.route);
      } else {
        setRoute(parseCurrentRoute());
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const switchRole = (r) => {
    setRole(r);
    if (r === "credenciado") navigate("home");
    if (r === "admin")       navigate("admin-home");
    if (r === "aluno")       navigate("aluno");
  };

  if (route.screen === "lead-form") {
    return <LeadInviteForm />;
  }

  if (route.screen === "empresa-form") {
    return <EmpresaInviteForm token={route.params.token} />;
  }

  if (route.screen === "proposal-client") {
    return <PortalPropostaScreen propostaId={route.params.id} onExit={() => window.location.href = "/pipeline"} />;
  }

  if (route.screen === "contract-client") {
    return <PortalContratoScreen contratoId={route.params.id} onExit={() => window.location.href = "/pipeline"} />;
  }

  if (route.screen === "campanha-responder") {
    return <CampanhaResponderScreen campanhaId={route.params.id} setorParam={route.params.setor} cargoParam={route.params.cargo} />;
  }

  // ─── DOCUMENTOS — páginas públicas enviadas ao cliente ────
  if (route.screen === "doc-contrato") {
    return <ContratoDocPage params={route.params} />;
  }
  if (route.screen === "doc-proposta") {
    return <PropostaDocPage params={route.params} />;
  }
  if (route.screen === "doc-relatorio") {
    return <RelatorioDocPage params={route.params} />;
  }

  // ─── DENUNCIA PORTAL — standalone public whistleblower portal ────
  if (route.screen === "denuncia-portal") {
    return <DenunciaPortalPage navigate={navigate} params={route.params} />;
  }

  // ─── ALUNO experience: own shell, no sidebar ──────────────
  if (role === "aluno") {
    return (
      <div data-screen-label="Menctor / aluno">
        <AlunoApp />
      </div>
    );
  }

  // ─── PORTAL DE PROPOSTA — standalone (deprecated — kept for back-compat) ──
  if (route.screen === "portal") {
    return (
      <PortalPropostaScreen onExit={() => navigate("clientes", { tab: "pipeline" })} />
    );
  }

  // ─── ADMIN experience ─────────────────────────────────────
  if (role === "admin") {
    return (
      <div className="app-shell" data-screen-label={`Menctor / admin / ${route.screen}`}>
        <AppHeader userName="Alex Sandro" userRole="Admin RH" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <div className="app-body">
        <AdminSidebar
          active={route.screen.startsWith("admin-") ? route.screen : "admin-home"}
          onNavigate={(s) => navigate(s)}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        {/* Mobile overlay */}
        <div
          className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className="main-content" style={{ color: "#0E2748" }}>
          <div className="page-content">
            {(route.screen === "admin-home" || route.screen === "home") && <AdminHome navigate={navigate} />}
            {route.screen === "admin-diagnosticos" && <DiagnosticosScreen navigate={navigate} initialCreate={route.params.create} />}
            {route.screen === "admin-relatorios"   && <RelatoriosFinaisScreen navigate={navigate} />}
            {route.screen === "admin-colaboradores" && <AdminColaboradores />}
            {route.screen === "admin-vitrine" && <AdminVitrine />}
            {route.screen === "admin-aprendizado" && <AprendizadoScreen navigate={navigate} />}
            {route.screen === "diagnostico-detalhe" && <DiagnosticoDetalheScreen navigate={(s, params = {})=>navigate(s.startsWith("admin")?s:`admin-${s==="diagnosticos"?"diagnosticos":"home"}`, params)} avaliacao={route.params.avaliacao} cliente={route.params.cliente} />}
          </div>
        </div>
        </div>
      </div>
    );
  }

  // ─── CREDENCIADO experience (default) ─────────────────────
  return (
    <div className="app-shell" data-screen-label={`Menctor / credenciado / ${route.screen}`}>
      <AppHeader userName="Alex Sandro" userRole="Consultor Lector" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="app-body">
      <Sidebar
        active={
          route.screen.startsWith("entrevista") ? "entrevistas" :
          route.screen.startsWith("denuncia") ? "denuncias" :
          route.screen.startsWith("diagnostico") ? "diagnosticos" :
          route.screen === "campanha-resultado" ? "campanhas" :
          ["roadmap", "cadastro-cliente", "plano-acao", "relatorios", "cliente-detalhe", "matriz-risco"].includes(route.screen) ? "clientes" :
          route.screen
        }
        onNavigate={(s) => navigate(s)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {/* Mobile overlay */}
      <div 
        className={`sidebar-overlay${sidebarOpen ? " open" : ""}`} 
        onClick={() => setSidebarOpen(false)} 
      />
      <div className="main-content" style={{ color: "#0E2748" }}>
        <div className="page-content">
          {route.screen === "home"               && <HomeScreen               navigate={navigate} />}
          {(route.screen === "roadmap" || route.screen === "cadastro-cliente") && (
            <RoadmapScreen navigate={navigate} params={{ ...route.params, novo: route.screen === "cadastro-cliente" }} />
          )}
          {route.screen === "diagnosticos"       && <DiagnosticosScreen       navigate={navigate} initialCreate={route.params.create} />}
          {route.screen === "diagnostico-detalhe"&& <DiagnosticoDetalheScreen navigate={navigate} avaliacao={route.params.avaliacao} cliente={route.params.cliente} />}
          {route.screen === "entrevistas"        && <EntrevistasScreen        navigate={navigate} />}
          {route.screen === "entrevista-detalhe" && <EntrevistaDetalheScreen navigate={navigate} params={route.params} id={route.params.id} />}
          {route.screen === "matriz-risco"       && <MatrizRiscoScreen       navigate={navigate} params={route.params} clienteId={route.params.clienteId} />}
          {route.screen === "denuncias"          && <DenunciasScreen          navigate={navigate} />}
          {route.screen === "denuncia-detalhe"   && <DenunciaDetalheScreen   navigate={navigate} params={route.params} id={route.params.id} />}
          {route.screen === "clientes"           && <ClientesScreen           navigate={navigate} />}
          {route.screen === "cliente-detalhe"    && <ClienteDetalheScreen     navigate={navigate} params={route.params} />}
          {route.screen === "pipeline"           && <PipelineScreen           navigate={navigate} />}
          {route.screen === "campanhas"          && <CampanhasScreen          navigate={navigate} />}
          {route.screen === "campanha-resultado" && <CampanhaResultadoScreen  navigate={navigate} params={route.params} />}
          {route.screen === "relatorios"         && <RelatoriosCredenciadoScreen navigate={navigate} params={route.params} />}
          {route.screen === "plano-acao"         && <PlanoAcaoScreen           navigate={navigate} params={route.params} />}
          {route.screen === "aprendizado"        && <AprendizadoScreen        navigate={navigate} />}
        </div>
      </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
