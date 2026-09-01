import { BarChart3, CalendarDays, ChevronRight, CircleDot, Trophy, Users } from "lucide-react";
import Image from "next/image";

const PRODUCTS = [
  { name: "ALTTEZ Club", description: "Plantilla, rendimiento y administración", icon: Users, state: "Operativo" },
  { name: "ALTTEZ Torneos", description: "Competición, fixtures y publicación", icon: Trophy, state: "12 activos" },
];

export default function DashboardPreview() {
  return (
    <div className="ecosystem-console">
      <header className="ecosystem-console__topbar">
        <div className="ecosystem-console__brand"><Image src="/branding/alttez-symbol-transparent.png" alt="" width={22} height={22} /><strong>ALTTEZ</strong></div>
        <div className="ecosystem-console__status"><CircleDot size={13} /> Sistema operativo</div>
      </header>
      <div className="ecosystem-console__body">
        <aside><span className="ecosystem-console__aside-label">Productos</span><button className="is-active"><BarChart3 size={16} />Vista general</button><button><Users size={16} />Clubes</button><button><Trophy size={16} />Torneos</button><button><CalendarDays size={16} />Calendario</button></aside>
        <main>
          <div className="ecosystem-console__heading"><div><span>Centro de control</span><h2>Operación conectada</h2></div><time>Actualizado hoy, 08:42</time></div>
          <div className="ecosystem-console__metrics"><div><span>Organizaciones</span><strong>18</strong><small>3 sedes activas</small></div><div><span>Competiciones</span><strong>12</strong><small>146 equipos</small></div><div><span>Próximos eventos</span><strong>27</strong><small>Esta semana</small></div></div>
          <section className="ecosystem-console__products"><div className="ecosystem-console__section-title"><span>Infraestructura disponible</span><span>Estado</span></div>{PRODUCTS.map(({ name, description, icon: Icon, state }) => <div className="ecosystem-console__product" key={name}><span className="ecosystem-console__icon"><Icon size={18} /></span><div><strong>{name}</strong><small>{description}</small></div><span className="ecosystem-console__product-state">{state}</span><ChevronRight size={16} /></div>)}</section>
        </main>
      </div>
      <style>{`
        .ecosystem-console{background:#171A1D;border:1px solid #34383C;border-radius:12px;overflow:hidden;box-shadow:0 32px 90px rgba(0,0,0,.32);font-family:var(--font-inter),sans-serif;color:#F5F7F8}.ecosystem-console__topbar{height:58px;padding:0 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #303438;background:#131518}.ecosystem-console__brand{display:flex;align-items:center;gap:10px;font:750 13px/1 var(--font-sora),sans-serif;letter-spacing:.05em}.ecosystem-console__brand img{width:22px;height:22px;object-fit:contain;filter:brightness(0) invert(1)}.ecosystem-console__status{display:flex;align-items:center;gap:7px;color:#91989E;font-size:10px}.ecosystem-console__status svg{color:#C27A42}
        .ecosystem-console__body{min-height:540px;display:grid;grid-template-columns:168px 1fr}.ecosystem-console aside{padding:24px 14px;border-right:1px solid #303438;display:flex;flex-direction:column;gap:4px;background:#14171A}.ecosystem-console__aside-label{padding:0 10px 13px;color:#687077;font-size:9px;font-weight:650;text-transform:uppercase;letter-spacing:.12em}.ecosystem-console aside button{min-height:38px;display:flex;align-items:center;gap:10px;padding:0 10px;background:transparent;border:0;border-radius:6px;color:#7E858B;font:550 11px/1 var(--font-inter),sans-serif;text-align:left}.ecosystem-console aside button.is-active{color:#F5F7F8;background:#23272B}.ecosystem-console aside button.is-active svg{color:#C27A42}.ecosystem-console main{min-width:0;padding:30px}
        .ecosystem-console__heading{display:flex;justify-content:space-between;align-items:flex-end;gap:20px}.ecosystem-console__heading span{color:#777F85;font-size:10px}.ecosystem-console__heading h2{margin:6px 0 0;font:650 clamp(22px,2.4vw,30px)/1 var(--font-sora),sans-serif;letter-spacing:-.035em}.ecosystem-console__heading time{color:#687077;font-size:9px}.ecosystem-console__metrics{margin-top:28px;display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #303438;border-radius:8px;overflow:hidden}.ecosystem-console__metrics div{min-width:0;padding:18px;display:grid;gap:8px;background:#1B1E21}.ecosystem-console__metrics div+div{border-left:1px solid #303438}.ecosystem-console__metrics span{color:#8E959B;font-size:9px}.ecosystem-console__metrics strong{font:650 27px/1 var(--font-sora),sans-serif;font-variant-numeric:tabular-nums}.ecosystem-console__metrics small{color:#5B91A9;font-size:9px}
        .ecosystem-console__products{margin-top:24px;border-top:1px solid #303438}.ecosystem-console__section-title{height:42px;display:grid;grid-template-columns:1fr auto;align-items:center;color:#687077;font-size:9px;text-transform:uppercase;letter-spacing:.08em}.ecosystem-console__product{min-height:66px;display:grid;grid-template-columns:38px minmax(0,1fr) auto 16px;align-items:center;gap:12px;border-top:1px solid #292D31}.ecosystem-console__icon{width:36px;height:36px;display:grid;place-items:center;background:#22262A;border-radius:6px;color:#C27A42}.ecosystem-console__product strong,.ecosystem-console__product small{display:block}.ecosystem-console__product strong{font-size:11px;margin-bottom:5px}.ecosystem-console__product small{color:#737A80;font-size:9px}.ecosystem-console__product-state{color:#B4BAC0;font-size:9px}.ecosystem-console__product>svg{color:#656C72}
        @media(max-width:640px){.ecosystem-console__body{grid-template-columns:1fr;min-height:auto}.ecosystem-console aside{display:none}.ecosystem-console main{padding:22px 18px}.ecosystem-console__heading time{display:none}.ecosystem-console__metrics{grid-template-columns:1fr 1fr}.ecosystem-console__metrics div:last-child{display:none}.ecosystem-console__products{margin-top:20px}.ecosystem-console__product-state{display:none}.ecosystem-console__product{grid-template-columns:38px minmax(0,1fr) 16px}.ecosystem-console__topbar{height:52px}}
      `}</style>
    </div>
  );
}
