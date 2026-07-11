"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/types";
import { getDb } from "@/lib/db";
import { useTreinos } from "@/hooks/useTreinos";
import { useDieta } from "@/hooks/useDieta";
import { useDadosCorporais } from "@/hooks/useDadosCorporais";
import { DIAS_SEMANA_KEYS, DIAS_SEMANA_SHORT, getDatasSemanaAtual, ymd, todayYmd, saudacaoPorHora, fmtDataBR } from "@/lib/date";
import { Button } from "@/components/ui/Button";
import { CollapsibleCard } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select, Label } from "@/components/ui/Input";
import { DiaSemanaKey, DiaTreinoMap } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile|null>(null);
  const [configDiasOpen, setConfigDiasOpen] = useState(false);
  const [tempMap, setTempMap] = useState<DiaTreinoMap>({} as DiaTreinoMap);
  const [dayExpandKey, setDayExpandKey] = useState<DiaSemanaKey|null>(null);

  useEffect(()=>{
    const s = sessionStorage.getItem("fitapp_user");
    if(!s){router.push("/");return;}
    setUser(JSON.parse(s));
  },[router]);

  const {treinos,diaTreinoMap,treinosConcluidos,totalSemana,concluidos,salvarDiaTreinoMap,toggleConcluido} = useTreinos(user?.id);
  const {refeicoes,totalKcal,toggleConcluida} = useDieta(user?.id);
  const {historico} = useDadosCorporais(user?.id);

  if(!user) return null;

  const datas = getDatasSemanaAtual();
  const hoje = todayYmd();
  const pct = totalSemana>0 ? Math.round(concluidos/totalSemana*100) : 0;
  const gruposAtivos = Object.keys(treinos).sort();

  return (
    <div className="px-4 py-4 pb-8">
      <div className="mb-4">
        <div className="text-[18px] font-bold text-[#F0F0F0]">{saudacaoPorHora()}, {user.nome.split(" ")[0]} 👋</div>
        <div className="text-[13px] text-muted mt-0.5">{new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})}</div>
      </div>

      <div className="bg-card border border-cardborder rounded-card p-4 mb-3 flex items-center gap-3.5">
        <div className="w-[52px] h-[52px] rounded-full bg-accent-soft border-2 border-accent flex items-center justify-center text-[20px] font-extrabold text-accent-text flex-shrink-0">{user.nome.charAt(0).toUpperCase()}</div>
        <div className="flex-1">
          <div className="text-[17px] font-bold text-[#F0F0F0]">{user.nome}</div>
          {historico[0] && <div className="flex gap-4 mt-2"><div><span className="text-[12px] text-muted block">Peso</span><span className="text-[15px] font-bold text-[#F0F0F0]">{historico[0].peso} kg</span></div></div>}
        </div>
        <Button variant="icon-danger" onClick={async()=>{await getDb().logout();sessionStorage.removeItem("fitapp_user");router.push("/")}}>
          <i className="ti ti-logout"/>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div className="bg-card border border-cardborder rounded-card p-4">
          <div className="text-[12px] text-muted font-semibold mb-2"><i className="ti ti-flame"/> Calorias hoje</div>
          <div className="text-[24px] font-extrabold text-[#F0F0F0]">{Math.round(totalKcal)}</div>
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            {refeicoes.map(r=><div key={r.id} className={`w-[11px] h-[11px] rounded-full flex-shrink-0 ${r.concluida?"bg-accent":"bg-surface border border-[#4A4A4C]"}`}/>)}
            <span className="text-[11px] text-muted font-semibold ml-1">{refeicoes.filter(r=>r.concluida).length} de {refeicoes.length}</span>
          </div>
        </div>
        <div className="bg-card border border-cardborder rounded-card p-4">
          <div className="text-[12px] text-muted font-semibold mb-2"><i className="ti ti-barbell"/> Treinos semana</div>
          <div className="text-[24px] font-extrabold text-[#F0F0F0]">{concluidos} <span className="text-[14px] font-normal text-muted">/ {totalSemana}</span></div>
          <div className="bg-surface rounded-full h-[7px] mt-2"><div className="h-[7px] rounded-full bg-[#185FA5]" style={{width:`${pct}%`}}/></div>
          <div className="flex justify-between text-[11px] text-muted mt-1 font-semibold"><span>{pct}%</span><span>{Math.max(0,totalSemana-concluidos)} restam</span></div>
        </div>
      </div>

      {/* Card dieta ANTES dos dias da semana */}
      <CollapsibleCard title="Refeicoes de hoje" icon={<i className="ti ti-salad text-accent text-[15px]"/>}>
        {refeicoes.length===0 ? <p className="text-[13px] text-[#555] text-center py-4">Nenhuma refeicao cadastrada.</p> : refeicoes.map(r=>{
          const kcal = r.alimentos.reduce((s,a)=>s+a.kcal,0);
          return (
            <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-mutedline last:border-0">
              <div className="flex items-center gap-2.5">
                <button onClick={()=>toggleConcluida(r.id)} className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 border-[2.5px] ${r.concluida?"bg-accent border-accent":"bg-transparent border-[#4A4A4C]"}`}>
                  {r.concluida&&<i className="ti ti-check text-white text-[14px]"/>}
                </button>
                <div><div className="text-[13px] font-semibold text-[#F0F0F0]">{r.nome}</div><div className="text-[11px] text-muted">{kcal>0?`${Math.round(kcal)} kcal`:"sem alimentos"}</div></div>
              </div>
            </div>
          );
        })}
        <Button variant="ghost" full size="sm" className="mt-2.5" onClick={()=>router.push("/dieta")}>Ver dieta completa</Button>
      </CollapsibleCard>

      <CollapsibleCard title="Dias da semana" icon={<i className="ti ti-calendar-week text-accent text-[15px]"/>}
        rightSlot={<button onClick={e=>{e.stopPropagation();setTempMap({...diaTreinoMap});setConfigDiasOpen(true);}} className="w-[26px] h-[26px] bg-surface rounded-lg flex items-center justify-center text-[#F0F0F0] text-[13px]"><i className="ti ti-calendar-event"/></button>}
      >
        <div className="flex gap-[5px]">
          {DIAS_SEMANA_KEYS.map(k=>{
            const g=diaTreinoMap[k]; const dt=datas[k]; const ds=ymd(dt);
            const isToday=ds===hoje; const chave=g?`${ds}_${g}`:null;
            const concl=chave?!!treinosConcluidos[chave]:false; const isRest=!g;
            let cls="flex-1 h-[38px] rounded-lg flex flex-col items-center justify-center text-[10px] font-bold gap-[3px] border border-cardborder text-[#555] cursor-pointer";
            if(isRest) cls+=" opacity-40 cursor-default";
            else if(concl) cls+=" bg-accent-soft text-accent-text border-accent";
            else if(isToday) cls+=" bg-accent text-white border-accent";
            return (
              <div key={k} className={cls} onClick={()=>{if(!isRest)setDayExpandKey(dayExpandKey===k?null:k);}}>
                {concl&&<i className="ti ti-check text-[12px]"/>}{!concl&&isToday&&<i className="ti ti-barbell text-[12px]"/>}
                {DIAS_SEMANA_SHORT[k]}
              </div>
            );
          })}
        </div>
        {dayExpandKey && diaTreinoMap[dayExpandKey] && (()=>{
          const g=diaTreinoMap[dayExpandKey]!; const t=treinos[g]; const ds=ymd(datas[dayExpandKey]); const chave=`${ds}_${g}`; const concl=!!treinosConcluidos[chave];
          return (
            <div className="mt-3 bg-surface2 border border-cardborder rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[13px] font-bold text-accent-text">{DIAS_SEMANA_SHORT[dayExpandKey]} — {t?.nome||`Treino ${g}`}</span>
                <button onClick={()=>setDayExpandKey(null)} className="w-[26px] h-[26px] bg-surface rounded-lg flex items-center justify-center text-[#F0F0F0]"><i className="ti ti-x"/></button>
              </div>
              {t?.exercicios.map((ex,i)=><div key={i} className="py-1.5 border-b border-mutedline last:border-0"><div className="text-[13px] font-semibold text-[#F0F0F0]">{ex.nome}</div><div className="text-[11px] text-muted">{ex.grupoMuscular}</div></div>)}
              <Button variant="primary" full size="md" className="mt-3" onClick={()=>toggleConcluido(dayExpandKey,g)}>
                {concl?<><i className="ti ti-check"/> Treino concluido</>:<><i className="ti ti-circle-check"/> Marcar como concluido</>}
              </Button>
            </div>
          );
        })()}
      </CollapsibleCard>

      {historico.length>0 && (
        <CollapsibleCard title="Evolucao do peso" icon={<i className="ti ti-chart-line text-accent text-[15px]"/>}>
          {historico.slice(0,5).map(r=><div key={r.id} className="flex items-center justify-between py-2 border-b border-mutedline last:border-0"><span className="text-[13px] text-muted">{fmtDataBR(r.data)}</span><span className="text-[14px] font-bold text-[#F0F0F0]">{r.peso.toFixed(1)} kg</span></div>)}
        </CollapsibleCard>
      )}

      <div className="grid grid-cols-3 gap-2 mt-4">
        {[{href:"/dados",icon:"ti-user-circle",label:"Dados Corporais"},{href:"/treinos",icon:"ti-barbell",label:"Treinos"},{href:"/dieta",icon:"ti-salad",label:"Dieta"}].map(item=>(
          <Button key={item.href} variant="nav" onClick={()=>router.push(item.href)}>
            <i className={`ti ${item.icon} text-[22px]`}/><span className="text-[11px] font-bold text-center">{item.label}</span>
          </Button>
        ))}
      </div>

      <Modal open={configDiasOpen} onClose={()=>setConfigDiasOpen(false)} title="Configurar dias de treino">
        {gruposAtivos.length===0 ? <p className="text-[13px] text-[#555] text-center py-4">Cadastre ao menos um treino antes de configurar os dias.</p> :
          DIAS_SEMANA_KEYS.map(k=>{
            const labels: Record<DiaSemanaKey,string> = {seg:"Segunda",ter:"Terca",qua:"Quarta",qui:"Quinta",sex:"Sexta",sab:"Sabado",dom:"Domingo"};
            return (
              <div key={k} className="mb-3.5">
                <Label>{labels[k]}</Label>
                <Select value={tempMap[k]??""} onChange={e=>setTempMap({...tempMap,[k]:e.target.value||null})}>
                  <option value="">Descanso</option>
                  {gruposAtivos.map(g=><option key={g} value={g}>Treino {g}{treinos[g]?.nome?` - ${treinos[g].nome}`:""}</option>)}
                </Select>
              </div>
            );
          })
        }
        <div className="flex gap-2 mt-4">
          <Button variant="ghost" onClick={()=>setConfigDiasOpen(false)}>Cancelar</Button>
          {gruposAtivos.length>0 && <Button variant="primary" className="flex-1 justify-center" onClick={async()=>{await salvarDiaTreinoMap(tempMap);setConfigDiasOpen(false);}}>Salvar</Button>}
        </div>
      </Modal>
    </div>
  );
}
