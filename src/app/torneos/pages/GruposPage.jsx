import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Trophy, CheckCircle, AlertCircle, ArrowRight, ChevronDown, Clock } from "lucide-react";
import { useTorneosStore } from "../store/useTorneosStore";
import { PALETTE, ELEVATION } from "../../../shared/tokens/palette";
import ModuleEmptyState from "../components/shared/ModuleEmptyState";
import { showToast } from "../../../shared/ui/Toast";
import { calculateGroupStandings, applyTiebreakers, canCloseGroupStage, canGenerateKnockout, getQualifiedTeams, generateKnockoutBracket, DEFAULT_TIEBREAKERS, DEFAULT_POINTS_CONFIG } from "../utils/competitionEngine";

const CU=PALETTE.bronce,CU_DIM=PALETTE.bronceDim,CU_BOR=PALETTE.bronceBorder,CARD=PALETTE.surface,BG=PALETTE.bg,TEXT=PALETTE.text,MUTED=PALETTE.textMuted,HINT=PALETTE.textHint,BORDER=PALETTE.border,ELEV=ELEVATION?.card??"0 10px 28px rgba(23,26,28,0.07)",FONT="'Manrope',-apple-system,sans-serif",EASE=[0.22,1,0.36,1];

function StandingsTable({rows,qualifyCount}){
  const H=["#","Equipo","PJ","PG","PE","PP","GF","GC","DG","PTS"];
  return(
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:FONT}}>
        <thead><tr style={{borderBottom:`2px solid ${BORDER}`}}>{H.map(h=><th key={h} style={{padding:"8px 10px",textAlign:h==="Equipo"?"left":"center",fontSize:10,fontWeight:700,color:MUTED,letterSpacing:"0.04em"}}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row,idx)=>{
            const cl=idx<qualifyCount;
            return(
              <tr key={row.equipoId} style={{background:cl?CU_DIM:"transparent",borderBottom:`1px solid ${BORDER}`}}>
                <td style={{padding:"9px 10px",textAlign:"center",fontWeight:700,color:cl?CU:HINT,fontSize:11}}>{idx+1}{cl&&<span style={{marginLeft:3,fontSize:8}}>●</span>}</td>
                <td style={{padding:"9px 10px",fontWeight:cl?700:500,color:TEXT}}>{row.nombre}</td>
                {[row.pj,row.pg,row.pe,row.pp,row.gf,row.gc,row.dg].map((v,i)=><td key={i} style={{padding:"9px 10px",textAlign:"center",color:MUTED}}>{v??0}</td>)}
                <td style={{padding:"9px 10px",textAlign:"center",fontWeight:800,color:cl?CU:TEXT,fontSize:13}}>{row.pts??0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MatchRow({match,equipos}){
  const getEq=id=>equipos.find(e=>e.id===id);
  const local=getEq(match.equipoLocalId),visita=getEq(match.equipoVisitaId),done=match.estado==="finalizado";
  return(
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderBottom:`1px solid ${BORDER}`,background:done?BG:CARD}}>
      <div style={{flex:1,textAlign:"right",fontSize:12,fontWeight:600,color:TEXT}}>{local?.nombre??"TBD"}</div>
      <div style={{minWidth:60,textAlign:"center",fontWeight:800,fontSize:13,color:done?CU:HINT,background:done?CU_DIM:BG,border:`1px solid ${done?CU_BOR:BORDER}`,borderRadius:8,padding:"4px 10px"}}>{done?`${match.golesLocal} - ${match.golesVisita}`:"vs"}</div>
      <div style={{flex:1,textAlign:"left",fontSize:12,fontWeight:600,color:TEXT}}>{visita?.nombre??"TBD"}</div>
      {match.fechaHora&&<div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:HINT,flexShrink:0}}><Clock size={10}/>{new Date(match.fechaHora).toLocaleDateString("es-AR",{day:"2-digit",month:"short"})}</div>}
    </div>
  );
}

function GroupCard({label,rows,matches,equipos,qualifyCount,defaultOpen}){
  const[open,setOpen]=useState(defaultOpen??true);
  const gm=matches.filter(m=>m.grupo===label&&m.fase==="grupos");
  const played=gm.filter(m=>m.estado==="finalizado").length;
  return(
    <div style={{background:CARD,borderRadius:16,border:`1px solid ${BORDER}`,boxShadow:ELEV,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 20px",background:CARD,border:"none",cursor:"pointer",textAlign:"left"}}>
        <div style={{minWidth:32,height:32,padding:"0 8px",borderRadius:8,background:CU_DIM,border:`1px solid ${CU_BOR}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:CU,flexShrink:0,whiteSpace:"nowrap"}}>{label}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:TEXT}}>Grupo {label}</div>
          <div style={{fontSize:10,color:MUTED,marginTop:2}}>{rows.length} equipos · {played}/{gm.length} partidos jugados</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {played===gm.length&&gm.length>0&&<span style={{fontSize:9,fontWeight:700,color:PALETTE.success,background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:6,padding:"2px 8px"}}>FINALIZADO</span>}
          <ChevronDown size={14} color={MUTED} style={{transform:open?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}/>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open&&(
          <motion.div key="body" initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.22,ease:EASE}} style={{overflow:"hidden"}}>
            <div style={{borderBottom:`1px solid ${BORDER}`}}><StandingsTable rows={rows} qualifyCount={qualifyCount}/></div>
            {gm.length>0&&(
              <div>
                <div style={{padding:"10px 16px 6px",fontSize:10,fontWeight:700,color:HINT,letterSpacing:"0.06em"}}>PARTIDOS DEL GRUPO</div>
                {gm.map(m=><MatchRow key={m.id} match={m} equipos={equipos}/>)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GruposPage({onGoTorneos,onNavigate}){
  const torneoActivoId=useTorneosStore(s=>s.torneoActivoId);
  const allPartidos=useTorneosStore(s=>s.partidos);
  const allEquipos=useTorneosStore(s=>s.equipos);
  const allCategorias=useTorneosStore(s=>s.categorias);
  const setPartidos=useTorneosStore(s=>s.setPartidos);
  const registrarBracketSeeded=useTorneosStore(s=>s.registrarBracketSeeded);
  const[activeCatId,setActiveCatId]=useState(null);
  const[isGeneratingKnockout,setIsGeneratingKnockout]=useState(false);

  if(!torneoActivoId) return <ModuleEmptyState icon={LayoutGrid} title="Selecciona un torneo" subtitle="Debes abrir un torneo para ver la fase de grupos." ctaLabel="Ver torneos" onCta={onGoTorneos}/>;

  const categorias=allCategorias.filter(c=>c.torneoId===torneoActivoId&&c.format==="grupos_playoffs");
  if(categorias.length===0) return <ModuleEmptyState icon={LayoutGrid} title="Sin categorías de grupos" subtitle='Este torneo no tiene categorías con formato "Grupos + Fase Final".'/>;

  const activeCat=categorias.find(c=>c.id===activeCatId)??categorias[0];
  const partidosTorneo=allPartidos.filter(p=>p.torneoId===torneoActivoId);
  const partidos=partidosTorneo.filter(p=>p.categoriaId===activeCat.id);
  const groupMatches=partidos.filter(p=>p.fase==="grupos");
  const teamIds=new Set();
  groupMatches.forEach(p=>{if(p.equipoLocalId)teamIds.add(p.equipoLocalId);if(p.equipoVisitaId)teamIds.add(p.equipoVisitaId);});
  const equipos=allEquipos.filter(e=>e.torneoId===torneoActivoId&&teamIds.has(e.id));
  const config={groupsCount:activeCat.groupsCount??2,qualifyPerGroup:activeCat.qualifyPerGroup??2,allowBestThirds:activeCat.allowBestThirds??false,bestThirdsCount:activeCat.bestThirdsCount??0,tiebreakers:activeCat.tiebreakers??DEFAULT_TIEBREAKERS,pointsConfig:activeCat.pointsConfig??DEFAULT_POINTS_CONFIG};

  const rawStandings=calculateGroupStandings(partidos,equipos,config.pointsConfig);
  const sortedStandings={};
  Object.entries(rawStandings).forEach(([grp,rows])=>{sortedStandings[grp]=applyTiebreakers(rows,config.tiebreakers,partidos);});

  const groupLabels=[...new Set(equipos.filter(e=>e.grupo).map(e=>e.grupo))].sort();
  const finalGroupLabels=groupLabels.length>0?groupLabels:Object.keys(sortedStandings).sort();
  const closeCheck=canCloseGroupStage(groupMatches);
  const qualified=getQualifiedTeams(sortedStandings,config,partidos);
  const knockoutCheck=canGenerateKnockout(groupMatches,qualified);
  const existingKnockout=partidos.filter(p=>p.source==="knockout");
  const canMaterializeKnockout=knockoutCheck.ok&&!isGeneratingKnockout;

  const handleGenerateKnockout=async()=>{
    if(!knockoutCheck.ok){
      showToast(knockoutCheck.reason??"La fase final todavia no esta lista.", "error");
      return;
    }
    if(existingKnockout.length>0){
      showToast("La fase final ya fue generada para esta categoria.", "info");
      onNavigate?.("fase_final");
      return;
    }
    setIsGeneratingKnockout(true);
    try{
      const matches=generateKnockoutBracket(qualified,{...config,torneoId:torneoActivoId,categoriaId:activeCat.id});
      const preserved=partidosTorneo.filter(p=>!(p.categoriaId===activeCat.id&&p.source==="knockout"));
      await setPartidos(torneoActivoId,[...preserved,...matches]);
      await registrarBracketSeeded({torneoId:torneoActivoId,seededTeams:qualified,matches,method:config.crossingMethod??"seeded"});
      showToast("Fase final generada con los clasificados de esta categoria.", "success");
      onNavigate?.("fase_final");
    }finally{
      setIsGeneratingKnockout(false);
    }
  };

  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{fontFamily:FONT}}>
      <header style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <h2 style={{margin:0,fontSize:20,fontWeight:800,color:TEXT,letterSpacing:"-0.02em"}}>Fase de Grupos</h2>
          <p style={{margin:"4px 0 0",fontSize:13,color:MUTED}}>{finalGroupLabels.length} grupo{finalGroupLabels.length!==1?"s":""} · {groupMatches.filter(m=>m.estado==="finalizado").length}/{groupMatches.length} partidos jugados</p>
        </div>
        <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} onClick={handleGenerateKnockout} disabled={!canMaterializeKnockout&&existingKnockout.length===0} style={{display:"flex",alignItems:"center",gap:8,background:canMaterializeKnockout||existingKnockout.length>0?CU:BG,color:canMaterializeKnockout||existingKnockout.length>0?"#FFF":HINT,border:`1px solid ${canMaterializeKnockout||existingKnockout.length>0?CU:BORDER}`,borderRadius:10,padding:"10px 18px",fontSize:13,fontWeight:700,fontFamily:FONT,cursor:canMaterializeKnockout||existingKnockout.length>0?"pointer":"not-allowed",opacity:canMaterializeKnockout||existingKnockout.length>0?1:0.6}} title={knockoutCheck.reason??""}>
          <Trophy size={14}/> {existingKnockout.length>0?"Ver Fase Final":isGeneratingKnockout?"Generando...":"Generar Fase Final"} <ArrowRight size={13}/>
        </motion.button>
      </header>

      {!closeCheck.ok&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:PALETTE.amberDim,border:`1px solid ${PALETTE.amberBorder}`,borderRadius:12,marginBottom:20}}><AlertCircle size={16} color={PALETTE.amber}/><span style={{fontSize:12,color:PALETTE.amber,fontWeight:600}}>{closeCheck.reason}</span></div>}
      {closeCheck.ok&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:PALETTE.successDim,border:`1px solid ${PALETTE.successBorder}`,borderRadius:12,marginBottom:20}}><CheckCircle size={16} color={PALETTE.success}/><span style={{fontSize:12,color:PALETTE.success,fontWeight:600}}>Todos los partidos finalizados. {qualified.length} equipos clasificados para la fase final.</span></div>}

      {categorias.length>1&&(
        <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
          {categorias.map(cat=><button key={cat.id} onClick={()=>setActiveCatId(cat.id)} style={{padding:"7px 16px",borderRadius:10,fontSize:12,fontWeight:700,border:`1px solid ${activeCat.id===cat.id?CU:BORDER}`,background:activeCat.id===cat.id?CU_DIM:CARD,color:activeCat.id===cat.id?CU:MUTED,cursor:"pointer",fontFamily:FONT}}>{cat.nombre}</button>)}
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        {finalGroupLabels.length>0
          ?finalGroupLabels.map((label,idx)=><GroupCard key={label} label={label} rows={sortedStandings[label]??[]} matches={partidos} equipos={equipos} qualifyCount={config.qualifyPerGroup} defaultOpen={idx===0}/>)
          :<div style={{background:CARD,borderRadius:16,border:`1px solid ${BORDER}`,padding:40,textAlign:"center"}}><LayoutGrid size={32} color={CU} style={{opacity:0.3,marginBottom:12}}/><div style={{fontSize:14,fontWeight:700,color:TEXT,marginBottom:6}}>Sin grupos configurados</div><p style={{margin:0,fontSize:13,color:MUTED}}>Genera el fixture de grupos desde Gestión de Partidos.</p></div>
        }
      </div>

      {qualified.length>0&&(
        <div style={{marginTop:28,background:CARD,borderRadius:16,border:`1px solid ${BORDER}`,boxShadow:ELEV}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:10}}>
            <Trophy size={16} color={CU}/>
            <span style={{fontSize:13,fontWeight:700,color:TEXT}}>Clasificados a la fase final</span>
            <span style={{fontSize:11,fontWeight:700,color:CU,background:CU_DIM,border:`1px solid ${CU_BOR}`,borderRadius:6,padding:"2px 8px",marginLeft:"auto"}}>{qualified.length} equipos</span>
          </div>
          <div style={{padding:16,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {qualified.map(q=>(
              <div key={q.equipoId} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:BG,borderRadius:10,border:`1px solid ${BORDER}`}}>
                <div style={{minWidth:28,height:28,padding:"0 6px",borderRadius:8,background:CU_DIM,border:`1px solid ${CU_BOR}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:CU,flexShrink:0,whiteSpace:"nowrap"}}>{q.qualifyType}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:TEXT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.nombre}</div>
                  <div style={{fontSize:9,color:MUTED}}>Grupo {q.group} · {q.pts} pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
