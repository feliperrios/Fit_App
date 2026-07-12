"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Profile, ExercicioBiblioteca, Treino } from "@/lib/types";
import { useTreinos } from "@/hooks/useTreinos";
import { getDb } from "@/lib/db";
import { canEditTreinos, readonlyReason } from "@/lib/permissions";
import { Button } from "@/components/ui/Button";
import { CollapsibleCard } from "@/components/ui/Card";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { ReadonlyBanner, Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";

const GM = ["Peito","Biceps","Costas","Triceps","Ombro","Perna","Gluteo","Abdomen","Outro"];

export default function TreinosPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile|null>(null);
  const [tab, setTab] = useState<"treinos"|"biblioteca">("treinos");
  const [bib, setBib] = useState<ExercicioBiblioteca[]>([]);
  const [bibFilt, setBibFilt] = useState(GM[0]);
  const [novoExModal, setNovoExModal] = useState(false);
  const [novoEx, setNovoEx] = useState({nome:"",grupo:GM[0],series:"",repsMin:"",repsMax:"",descanso:""});
  const [pickModal, setPickModal] = useState<{grupo:string}|null>(null);
  const [pickFilt, setPickFilt] = useState(GM[0]);
  const [midiaModal, setMidiaModal] = useState<{exId:string;tipo:"foto"|"video"}|null>(null);
  const [midiaUrl, setMidiaUrl] = useState("");
  const [serieForm, setSerieForm] = useState<{grupo:string;idx:number}|null>(null);
  const [serieVals, setSerieVals] = useState({series:"",reps:"",carga:"",descanso:""});
  const [obsForm, setObsForm] = useState<string|null>(null);
  const [obsValor, setObsValor] = useState("");
  const [nomeForm, setNomeForm] = useState<string|null>(null);
  const [nomeValor, setNomeValor] = useState("");
  const [configDias, setConfigDias] = useState(false);

  useEffect(()=>{
    const s=sessionStorage.getItem("fitapp_user"); if(!s){router.push("/");return;}
    const u=JSON.parse(s) as Profile; setUser(u); loadBib(u.id);
  },[router]);

  async function loadBib(uid:string){ setBib(await getDb().getBibliotecaExercicios(uid)); }

  const {treinos,diaTreinoMap,salvarDiaTreinoMap,addGrupo,removeGrupo,updateTreino,addExercicio,removeExercicio,registrarSerie} = useTreinos(user?.id);
  const canEdit = canEditTreinos(user);
  const reason = readonlyReason(user,"treinos");
  const grupos = Object.keys(treinos).sort();

  async function handleNovoEx(){
    if(!novoEx.nome||!novoEx.grupo||!user)return;
    await getDb().addExercicioBiblioteca(user.id,{nome:novoEx.nome,grupoMuscular:novoEx.grupo,seriesPadrao:novoEx.series?+novoEx.series:undefined,repsMin:novoEx.repsMin?+novoEx.repsMin:undefined,repsMax:novoEx.repsMax?+novoEx.repsMax:undefined,descansoPadrao:novoEx.descanso?+novoEx.descanso:60});
    await loadBib(user.id); setNovoExModal(false); setNovoEx({nome:"",grupo:GM[0],series:"",repsMin:"",repsMax:"",descanso:""});
  }

  async function handleSerie(){
    if(!serieForm||!serieVals.series||!serieVals.reps||!serieVals.carga)return;
    await registrarSerie(serieForm.grupo,serieForm.idx,+serieVals.series,+serieVals.reps,+serieVals.carga,+serieVals.descanso||0);
    setSerieForm(null); setSerieVals({series:"",reps:"",carga:"",descanso:""});
  }

  if(!user) return null;

  return (
    <div className="px-4 py-4 pb-8">
      <div className="flex items-center gap-2.5 mb-5">
        <Button variant="icon" onClick={()=>router.push("/home")}><i className="ti ti-arrow-left"/></Button>
        <span className="text-[17px] font-bold text-[#F0F0F0] flex-1">Treinos</span>
      </div>
      {reason&&<ReadonlyBanner reason={reason}/>}
      <div className="flex gap-2 mb-4">
        {(["treinos","biblioteca"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-5 py-2 rounded-full text-[13px] font-bold border-2 cursor-pointer ${tab===t?"bg-accent text-white border-accent":"bg-surface text-muted border-cardborder"}`}>
            {t==="treinos"?"Meus Treinos":"Exercicios"}
          </button>
        ))}
      </div>

      {tab==="treinos"&&(
        <>
          {canEdit&&<div className="flex gap-2 mb-3.5">
            <Button onClick={addGrupo}><i className="ti ti-plus"/> Adicionar treino</Button>
            <Button variant="ghost" onClick={()=>setConfigDias(true)}><i className="ti ti-calendar-event"/> Configurar dias</Button>
          </div>}
          <CollapsibleCard title="Meus treinos" icon={<i className="ti ti-barbell text-accent text-[15px]"/>}>
            {grupos.length===0?<p className="text-[13px] text-[#555] text-center py-4">Nenhum treino. Toque em Adicionar treino.</p>:grupos.map(g=>{
              const t=treinos[g];
              return (
                <div key={g} className="mb-5 pb-5 border-b border-mutedline last:border-0 last:mb-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-3.5 flex-wrap">
                    <span className="bg-accent-soft text-accent-text text-[15px] font-extrabold rounded-lg px-3 py-1.5 border border-accent flex-shrink-0">{g}</span>
                    {nomeForm===g?(
                      <><Input value={nomeValor} onChange={e=>setNomeValor(e.target.value)} className="flex-1 min-w-[80px]"/>
                      <Button size="sm" onClick={async()=>{await updateTreino(g,{nome:nomeValor});setNomeForm(null);}}>OK</Button>
                      <Button variant="ghost" size="sm" onClick={()=>setNomeForm(null)}>X</Button></>
                    ):(
                      <><span className="text-[14px] font-bold text-[#F0F0F0] flex-1">{t.nome||"Treino "+g}</span>
                      {canEdit&&<Button size="sm" onClick={()=>{setNomeForm(g);setNomeValor(t.nome);}}>Editar</Button>}</>
                    )}
                    {canEdit&&grupos.length>1&&<Button variant="icon-danger" size="sm" onClick={async()=>{if(confirm("Remover Treino "+g+"? Apaga todos os exercicios."))await removeGrupo(g);}}><i className="ti ti-trash text-[13px]"/></Button>}
                  </div>
                  <div className="mb-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-[#777] uppercase tracking-wider">Observacao</span>
                      {canEdit&&<Button variant="icon-grey" size="sm" onClick={()=>{setObsForm(obsForm===g?null:g);setObsValor(t.observacao);}}><i className="ti ti-pencil text-[13px]"/></Button>}
                    </div>
                    {obsForm===g?(
                      <><Textarea value={obsValor} onChange={e=>setObsValor(e.target.value)} className="mb-2"/>
                      <div className="flex gap-2"><Button variant="ghost" size="sm" onClick={()=>setObsForm(null)}>Cancelar</Button><Button size="sm" className="flex-1 justify-center" onClick={async()=>{await updateTreino(g,{observacao:obsValor});setObsForm(null);}}>Salvar</Button></div></>
                    ):t.observacao?<div className="border-l-[3px] border-warn rounded-r-lg bg-warn-soft px-3 py-2 text-[13px] text-[#CCC]">{t.observacao}</div>:<p className="text-[12px] text-[#555] italic">Nenhuma observacao.</p>}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#777] uppercase tracking-wider">Exercicios</span>
                    {canEdit&&<Button size="sm" onClick={()=>setPickModal({grupo:g})}><i className="ti ti-plus"/> Adicionar</Button>}
                  </div>
                  {t.exercicios.length===0?<p className="text-[13px] text-[#555] text-center py-2">Nenhum exercicio.</p>:t.exercicios.map((ex,i)=>{
                    const ul=ex.series[ex.series.length-1];
                    const rl=ex.repsMin&&ex.repsMax&&ex.repsMin!==ex.repsMax?`${ex.repsMin}-${ex.repsMax}`:ex.repsMin?`${ex.repsMin}`:"";
                    const exBib=bib.find(b=>b.id===ex.exercicioId);
                    return (
                      <div key={i} className="py-2.5 border-b border-mutedline last:border-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-semibold text-[#F0F0F0]">{ex.nome}</div>
                            <div className="text-[12px] text-muted mt-0.5">{[ex.grupoMuscular,ex.seriesPadrao&&rl?`${ex.seriesPadrao}x${rl}`:"",ex.descansoPadrao?`desc. ${ex.descansoPadrao}s`:"",ul?`ultimo: ${ul.carga}kg`:""].filter(Boolean).join(" · ")}</div>
                            {ex.series.slice(-3).map((s,si)=><Chip key={si} variant="green">{s.series}x{s.reps} · {s.carga}kg</Chip>)}
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {exBib&&<><button onClick={()=>setMidiaModal({exId:exBib.id,tipo:"foto"})} className="text-[11px] bg-surface text-[#F0F0F0] px-2 py-1 rounded-lg flex items-center gap-1"><i className="ti ti-photo"/> Imagens</button><button onClick={()=>setMidiaModal({exId:exBib.id,tipo:"video"})} className="text-[11px] bg-surface text-[#F0F0F0] px-2 py-1 rounded-lg flex items-center gap-1"><i className="ti ti-video"/> Videos</button></>}
                            </div>
                            {serieForm?.grupo===g&&serieForm?.idx===i&&(
                              <div className="bg-surface2 border border-cardborder rounded-lg p-3 mt-2">
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                  <div><Label>Series</Label><Input type="number" value={serieVals.series} onChange={e=>setSerieVals({...serieVals,series:e.target.value})} placeholder="4"/></div>
                                  <div><Label>Reps</Label><Input type="number" value={serieVals.reps} onChange={e=>setSerieVals({...serieVals,reps:e.target.value})} placeholder={rl||"12"}/></div>
                                  <div><Label>Carga kg</Label><Input type="number" value={serieVals.carga} onChange={e=>setSerieVals({...serieVals,carga:e.target.value})} step="0.5"/></div>
                                </div>
                                <div className="mb-2"><Label>Descanso s</Label><Input type="number" value={serieVals.descanso} onChange={e=>setSerieVals({...serieVals,descanso:e.target.value})} placeholder={`${ex.descansoPadrao||60}`}/></div>
                                <div className="flex gap-2"><Button variant="ghost" size="sm" onClick={()=>setSerieForm(null)}>Cancelar</Button><Button size="sm" className="flex-1 justify-center" onClick={handleSerie}>Registrar</Button></div>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-2 flex-shrink-0">
                            <Button variant="icon" size="sm" onClick={()=>setSerieForm(serieForm?.grupo===g&&serieForm?.idx===i?null:{grupo:g,idx:i})}><i className="ti ti-plus text-[13px]"/></Button>
                            {canEdit&&<Button variant="icon-danger" size="sm" onClick={()=>removeExercicio(g,i)}><i className="ti ti-trash text-[13px]"/></Button>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </CollapsibleCard>
        </>
      )}

      {tab==="biblioteca"&&(
        <div className="bg-card border border-cardborder rounded-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-semibold text-[#F0F0F0]">Biblioteca</span>
            {canEdit&&<Button size="sm" onClick={()=>setNovoExModal(true)}><i className="ti ti-plus"/> Novo</Button>}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3">
            {GM.map(gp=><button key={gp} onClick={()=>setBibFilt(gp)} className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold border-2 cursor-pointer whitespace-nowrap ${bibFilt===gp?"bg-accent text-white border-accent":"bg-surface text-muted border-cardborder"}`}>{gp}</button>)}
          </div>
          {bib.filter(e=>e.grupoMuscular===bibFilt).length===0?<p className="text-[13px] text-[#555] text-center py-4">Nenhum exercicio.</p>:bib.filter(e=>e.grupoMuscular===bibFilt).map(e=>(
            <div key={e.id} className="flex items-start justify-between py-2.5 border-b border-mutedline last:border-0">
              <div>
                <div className="text-[14px] font-semibold text-[#F0F0F0]">{e.nome}</div>
                <div className="text-[12px] text-muted">{e.grupoMuscular}{e.seriesPadrao?` · ${e.seriesPadrao} series`:""}{e.repsMin?` · ${e.repsMin}${e.repsMax&&e.repsMax!==e.repsMin?`-${e.repsMax}`:""} reps`:""}</div>
                <div className="flex gap-1.5 mt-1"><button onClick={()=>setMidiaModal({exId:e.id,tipo:"foto"})} className="text-[11px] bg-surface text-[#F0F0F0] px-2 py-1 rounded-lg flex items-center gap-1"><i className="ti ti-photo"/> {e.midias.filter(m=>m.tipo==="foto").length}</button><button onClick={()=>setMidiaModal({exId:e.id,tipo:"video"})} className="text-[11px] bg-surface text-[#F0F0F0] px-2 py-1 rounded-lg flex items-center gap-1"><i className="ti ti-video"/> {e.midias.filter(m=>m.tipo==="video").length}</button></div>
              </div>
              {canEdit&&<Button variant="icon-danger" size="sm" onClick={async()=>{if(!user)return;await getDb().removeExercicioBiblioteca(user.id,e.id);loadBib(user.id);}}><i className="ti ti-trash text-[13px]"/></Button>}
            </div>
          ))}
        </div>
      )}

      <Modal open={novoExModal} onClose={()=>setNovoExModal(false)} title="Novo Exercicio">
        <div className="mb-3"><Label>Nome</Label><Input value={novoEx.nome} onChange={e=>setNovoEx({...novoEx,nome:e.target.value})} placeholder="Ex: Supino reto"/></div>
        <div className="mb-3"><Label>Grupo muscular</Label><Select value={novoEx.grupo} onChange={e=>setNovoEx({...novoEx,grupo:e.target.value})}>{GM.map(g=><option key={g}>{g}</option>)}</Select></div>
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div><Label>Series</Label><Input type="number" value={novoEx.series} onChange={e=>setNovoEx({...novoEx,series:e.target.value})} placeholder="4"/></div>
          <div><Label>Reps min</Label><Input type="number" value={novoEx.repsMin} onChange={e=>setNovoEx({...novoEx,repsMin:e.target.value})} placeholder="8"/></div>
          <div><Label>Reps max</Label><Input type="number" value={novoEx.repsMax} onChange={e=>setNovoEx({...novoEx,repsMax:e.target.value})} placeholder="12"/></div>
          <div><Label>Desc s</Label><Input type="number" value={novoEx.descanso} onChange={e=>setNovoEx({...novoEx,descanso:e.target.value})} placeholder="60"/></div>
        </div>
        <div className="flex gap-2"><Button variant="ghost" onClick={()=>setNovoExModal(false)}>Cancelar</Button><Button className="flex-1 justify-center" onClick={handleNovoEx}>Salvar</Button></div>
      </Modal>

      <Modal open={!!pickModal} onClose={()=>setPickModal(null)} title="Escolher exercicio">
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3">{GM.map(gp=><button key={gp} onClick={()=>setPickFilt(gp)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold border-2 cursor-pointer whitespace-nowrap ${pickFilt===gp?"bg-accent text-white border-accent":"bg-surface text-muted border-cardborder"}`}>{gp}</button>)}</div>
        {bib.filter(e=>e.grupoMuscular===pickFilt).length===0?<p className="text-[13px] text-[#555] text-center py-4">Nenhum exercicio.</p>:bib.filter(e=>e.grupoMuscular===pickFilt).map(e=>(
          <div key={e.id} className="py-3 border-b border-mutedline last:border-0 cursor-pointer" onClick={async()=>{if(!pickModal)return;await addExercicio(pickModal.grupo,e.id);setPickModal(null);}}>
            <div className="text-[14px] font-semibold text-[#F0F0F0]">{e.nome}</div><div className="text-[12px] text-muted">{e.grupoMuscular}</div>
          </div>
        ))}
        <Button variant="ghost" full className="mt-3" onClick={()=>setPickModal(null)}>Cancelar</Button>
      </Modal>

      <Modal open={!!midiaModal} onClose={()=>{setMidiaModal(null);setMidiaUrl("");}} title={midiaModal?.tipo==="foto"?"Imagens":"Videos"}>
        {midiaModal&&(()=>{
          const ex=bib.find(e=>e.id===midiaModal.exId); const medias=ex?.midias.filter(m=>m.tipo===midiaModal.tipo)??[];
          return (<>
            {medias.length===0?<p className="text-[13px] text-[#555] text-center py-3 mb-3">Nenhum item ainda.</p>:medias.map((m,i)=>(
              <div key={i} className="mb-3">
                {midiaModal.tipo==="foto"?<img src={m.url} className="w-full rounded-lg mb-2" alt="" onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>:<a href={m.url} target="_blank" rel="noopener noreferrer" className="text-accent-text text-[13px] block mb-2 break-all">{m.url}</a>}
                <Button variant="ghost" size="sm" onClick={async()=>{if(!user||!ex)return;await getDb().removeMidiaExercicio(user.id,ex.id,midiaModal.tipo,i);loadBib(user.id);setMidiaModal(null);}}>Remover</Button>
              </div>
            ))}
            <div className="mb-2"><Label>Colar URL</Label><Input value={midiaUrl} onChange={e=>setMidiaUrl(e.target.value)} placeholder="https://..."/></div>
            <p className="text-[11px] text-[#666] mb-3">Com Supabase Storage ativo sera upload real de arquivo.</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={()=>{setMidiaModal(null);setMidiaUrl("");}}>Fechar</Button>
              <Button className="flex-1 justify-center" onClick={async()=>{if(!midiaUrl||!user||!midiaModal)return;await getDb().addMidiaExercicio(user.id,midiaModal.exId,midiaModal.tipo,midiaUrl);loadBib(user.id);setMidiaModal(null);setMidiaUrl("");}}>Adicionar</Button>
            </div>
          </>);
        })()}
      </Modal>

      <Modal open={configDias} onClose={()=>setConfigDias(false)} title="Configurar dias de treino">
        {grupos.length===0?<p className="text-[13px] text-[#555] text-center py-4">Cadastre ao menos um treino.</p>:
          (["seg","ter","qua","qui","sex","sab","dom"] as const).map(k=>{
            const L: Record<string,string>={seg:"Segunda",ter:"Terca",qua:"Quarta",qui:"Quinta",sex:"Sexta",sab:"Sabado",dom:"Domingo"};
            return (<div key={k} className="mb-3.5"><Label>{L[k]}</Label>
              <Select value={diaTreinoMap[k]??""} onChange={async e=>{await salvarDiaTreinoMap({...diaTreinoMap,[k]:e.target.value||null});}}>
                <option value="">Descanso</option>
                {grupos.map(g=><option key={g} value={g}>Treino {g}{treinos[g]?.nome?` - ${treinos[g].nome}`:""}</option>)}
              </Select></div>);
          })
        }
        <Button variant="ghost" full className="mt-2" onClick={()=>setConfigDias(false)}>Fechar</Button>
      </Modal>
    </div>
  );
}
