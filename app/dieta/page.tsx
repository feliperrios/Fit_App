"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Profile, TacoAlimento, AlimentoRefeicao } from "@/lib/types";
import { useDieta } from "@/hooks/useDieta";
import { canEditDieta, readonlyReason } from "@/lib/permissions";
import { Button } from "@/components/ui/Button";
import { CollapsibleCard } from "@/components/ui/Card";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { ReadonlyBanner, Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import tacoData from "@/data/taco.json";

const TACO = tacoData as TacoAlimento[];
const CATS = ["Todos",...Array.from(new Set(TACO.map(t=>t.categoria)))];
const MED: Record<string,{label:string;gramas:number}> = {g:{label:"g",gramas:1},un:{label:"unidade",gramas:60},cs:{label:"col. sopa",gramas:15},cc:{label:"col. cha",gramas:5},xi:{label:"xicara",gramas:200},cp:{label:"copo",gramas:200},ft:{label:"fatia",gramas:30},po:{label:"porcao",gramas:100}};
const METAS = {kcal:2400,proteina:180,carboidrato:250,gordura:70};

export default function DietaPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile|null>(null);
  const [cat, setCat] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [sel, setSel] = useState<TacoAlimento|null>(null);
  const [medida, setMedida] = useState("g");
  const [qtd, setQtd] = useState("");
  const [tacoModal, setTacoModal] = useState<{refId:string}|null>(null);
  const [obsEdit, setObsEdit] = useState(false);
  const [obsTemp, setObsTemp] = useState("");
  const [listaOpen, setListaOpen] = useState(false);

  useEffect(()=>{
    const s=sessionStorage.getItem("fitapp_user"); if(!s){router.push("/");return;} setUser(JSON.parse(s));
  },[router]);

  const {refeicoes,obs,totalKcal,addRefeicao,removeRefeicao,toggleConcluida,addAlimento,removeAlimento,salvarObs} = useDieta(user?.id);
  const canEdit = canEditDieta(user);
  const reason = readonlyReason(user,"dieta");

  const tFilt = TACO.filter(t=>(cat==="Todos"||t.categoria===cat)&&(!busca||t.nome.toLowerCase().includes(busca.toLowerCase())));

  function calcPrev(): AlimentoRefeicao|null {
    if(!sel||!qtd) return null;
    const g=parseFloat(qtd)*(MED[medida]?.gramas??1); const f=g/100;
    return {nomeTaco:sel.nome,gramas:Math.round(g),fatorCoccao:sel.fatorCoccao,medidaLabel:`${qtd} ${MED[medida]?.label??"g"} (${Math.round(g)}g)`,kcal:Math.round(sel.kcal*f*10)/10,proteina:Math.round(sel.proteina*f*10)/10,carboidrato:Math.round(sel.carboidrato*f*10)/10,gordura:Math.round(sel.gordura*f*10)/10};
  }

  const totais = refeicoes.filter(r=>r.concluida).flatMap(r=>r.alimentos).reduce((a,al)=>({kcal:a.kcal+al.kcal,proteina:a.proteina+al.proteina,carboidrato:a.carboidrato+al.carboidrato,gordura:a.gordura+al.gordura}),{kcal:0,proteina:0,carboidrato:0,gordura:0});

  const compraMap: Record<string,{nome:string;gramas:number;fc:number}> = {};
  refeicoes.flatMap(r=>r.alimentos).forEach(a=>{const k=a.nomeTaco.toLowerCase();if(!compraMap[k])compraMap[k]={nome:a.nomeTaco,gramas:0,fc:a.fatorCoccao};compraMap[k].gramas+=a.gramas;});
  const compraItems = Object.values(compraMap).sort((a,b)=>a.nome.localeCompare(b.nome));
  const prev = calcPrev();

  if(!user) return null;

  return (
    <div className="px-4 py-4 pb-8">
      <div className="flex items-center gap-2.5 mb-5">
        <Button variant="icon" onClick={()=>router.push("/home")}><i className="ti ti-arrow-left"/></Button>
        <span className="text-[17px] font-bold text-[#F0F0F0] flex-1">Dieta</span>
        {canEdit&&<Button size="sm" onClick={()=>setListaOpen(true)}><i className="ti ti-shopping-cart"/> Lista</Button>}
      </div>

      <CollapsibleCard title="Observacoes" icon={<i className="ti ti-notes text-warn text-[15px]"/>}
        rightSlot={canEdit&&<button onClick={e=>{e.stopPropagation();setObsEdit(!obsEdit);setObsTemp(obs);}} className="w-[26px] h-[26px] bg-surface rounded-lg flex items-center justify-center text-[#F0F0F0]"><i className="ti ti-pencil"/></button>}>
        {obsEdit?(<>
          <Textarea value={obsTemp} onChange={e=>setObsTemp(e.target.value)} className="mt-1.5 mb-2"/>
          <div className="flex gap-2"><Button variant="ghost" size="sm" onClick={()=>setObsEdit(false)}>Cancelar</Button><Button size="sm" className="flex-1 justify-center" onClick={async()=>{await salvarObs(obsTemp);setObsEdit(false);}}>Salvar</Button></div>
        </>):obs?<div className="text-[13px] text-[#CCC] whitespace-pre-wrap pt-1">{obs}</div>:<p className="text-[12px] text-[#555] italic pt-1">Nenhuma observacao.</p>}
      </CollapsibleCard>

      {reason&&<ReadonlyBanner reason={reason}/>}

      <div className="bg-card border border-cardborder rounded-card p-4 mb-3">
        <div className="flex justify-between gap-2">
          {[{label:"Kcal",v:Math.round(totais.kcal),m:METAS.kcal,u:"",cor:"#1D9E75"},{label:"Proteina",v:+totais.proteina.toFixed(1),m:METAS.proteina,u:"g",cor:"#5BA3F5"},{label:"Carbo",v:+totais.carboidrato.toFixed(1),m:METAS.carboidrato,u:"g",cor:"#F0A500"},{label:"Gordura",v:+totais.gordura.toFixed(1),m:METAS.gordura,u:"g",cor:"#F06060"}].map(x=>(
            <div key={x.label} className="flex-1 text-center">
              <div className="text-[11px] text-muted font-semibold mb-1">{x.label}</div>
              <div className="text-[17px] font-extrabold text-[#F0F0F0]">{x.v}{x.u&&<span className="text-[11px] text-muted"> {x.u}</span>}</div>
              <div className="text-[11px] text-[#777] mt-0.5">/ {x.m}{x.u?` ${x.u}`:""}</div>
              <div className="h-[5px] rounded-full bg-surface mt-1.5"><div className="h-[5px] rounded-full" style={{background:x.cor,width:`${Math.min(100,Math.round(x.v/x.m*100))}%`}}/></div>
            </div>
          ))}
        </div>
      </div>

      <CollapsibleCard title="Refeicoes do dia" icon={<i className="ti ti-salad text-accent text-[15px]"/>}>
        {refeicoes.map(r=>{
          const kcalR=r.alimentos.reduce((s,a)=>s+a.kcal,0);
          return (
            <div key={r.id} className={`mb-3 pb-3 border-b border-mutedline last:border-0 ${r.concluida?"opacity-60":""}`}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <button onClick={()=>toggleConcluida(r.id)} className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 border-[2.5px] ${r.concluida?"bg-accent border-accent":"bg-transparent border-[#4A4A4C]"}`}>{r.concluida&&<i className="ti ti-check text-white text-[14px]"/>}</button>
                  <div><div className="text-[15px] font-bold text-[#F0F0F0]">{r.nome}</div><div className="text-[12px] text-muted">{kcalR>0?`${Math.round(kcalR)} kcal`:"sem alimentos"}</div></div>
                </div>
                {canEdit&&<Button variant="icon-danger" size="sm" onClick={()=>removeRefeicao(r.id)}><i className="ti ti-trash text-[13px]"/></Button>}
              </div>
              {kcalR>0&&<div className="flex gap-1.5 flex-wrap mb-2"><Chip variant="green">{Math.round(kcalR)} kcal</Chip><Chip variant="blue">P {r.alimentos.reduce((s,a)=>s+a.proteina,0).toFixed(1)}g</Chip><Chip variant="orange">C {r.alimentos.reduce((s,a)=>s+a.carboidrato,0).toFixed(1)}g</Chip><Chip variant="red">G {r.alimentos.reduce((s,a)=>s+a.gordura,0).toFixed(1)}g</Chip></div>}
              {r.alimentos.length>0&&<div className="border-t border-mutedline pt-2">{r.alimentos.map((a,ai)=>(
                <div key={ai} className="flex items-center justify-between py-2 border-b border-mutedline last:border-0">
                  <div><div className="text-[13px] font-semibold text-[#F0F0F0]">{a.nomeTaco}</div><div className="text-[11px] text-muted">{a.medidaLabel} · {a.kcal} kcal</div></div>
                  {canEdit&&<Button variant="icon-danger" size="sm" onClick={()=>removeAlimento(r.id,ai)}><i className="ti ti-trash text-[13px]"/></Button>}
                </div>
              ))}</div>}
              {canEdit&&<button onClick={()=>{setTacoModal({refId:r.id});setBusca("");setSel(null);setQtd("");setMedida("g");setCat("Todos");}} className="w-full mt-2 py-2.5 text-[13px] font-bold text-accent-text bg-accent-soft border border-dashed border-accent rounded-lg flex items-center justify-center gap-1.5"><i className="ti ti-plus"/> Adicionar alimento</button>}
            </div>
          );
        })}
        {canEdit&&<button onClick={()=>{addRefeicao();window.scrollTo(0,0);}} className="w-full py-3.5 text-[15px] font-bold bg-accent text-white rounded-xl flex items-center justify-center gap-2 mt-1"><i className="ti ti-plus"/> Nova Refeicao</button>}
      </CollapsibleCard>

      <Modal open={!!tacoModal} onClose={()=>setTacoModal(null)} title="Adicionar Alimento">
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3">{CATS.map(c=><button key={c} onClick={()=>setCat(c)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold border-2 whitespace-nowrap ${cat===c?"bg-accent text-white border-accent":"bg-surface text-muted border-cardborder"}`}>{c}</button>)}</div>
        <Input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar na tabela TACO..." className="mb-2.5"/>
        <div className="max-h-[190px] overflow-y-auto border border-cardborder rounded-lg bg-surface2 mb-3">
          {tFilt.length===0?<div className="p-3 text-[13px] text-[#666]">Nenhum resultado.</div>:tFilt.map(item=>(
            <div key={item.nome} onClick={()=>setSel(item)} className={`p-3 border-b border-mutedline last:border-0 cursor-pointer ${sel?.nome===item.nome?"bg-accent-soft":""}`}>
              <div className="text-[13px] font-semibold text-[#F0F0F0]">{item.nome}</div>
              <div className="text-[11px] text-muted">{item.kcal} kcal · P {item.proteina}g / 100g</div>
            </div>
          ))}
        </div>
        {sel&&<div className="bg-accent-soft border border-accent rounded-lg p-3 mb-3"><div className="text-[13px] font-bold text-accent-text mb-1.5">{sel.nome}</div><div className="flex gap-1.5 flex-wrap"><Chip variant="green">{sel.kcal} kcal</Chip><Chip variant="blue">P {sel.proteina}g</Chip><Chip variant="orange">C {sel.carboidrato}g</Chip><Chip variant="red">G {sel.gordura}g</Chip></div></div>}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Select value={medida} onChange={e=>setMedida(e.target.value)}>{Object.entries(MED).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</Select>
          <Input type="number" value={qtd} onChange={e=>setQtd(e.target.value)} placeholder="Quantidade" step="0.1"/>
        </div>
        {prev&&<div className="text-[12px] text-accent-text bg-accent-soft border border-accent rounded-lg px-3 py-2 mb-3 font-semibold">{qtd} {MED[medida]?.label} → {prev.kcal} kcal · P:{prev.proteina}g C:{prev.carboidrato}g G:{prev.gordura}g</div>}
        <div className="text-[10px] text-[#444] text-right mb-3">Fonte: TACO 4a ed. (UNICAMP/NEPA)</div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={()=>setTacoModal(null)}>Cancelar</Button>
          <Button className="flex-1 justify-center" onClick={async()=>{if(!tacoModal)return;const p=calcPrev();if(!p)return;await addAlimento(tacoModal.refId,p);setTacoModal(null);setBusca("");setSel(null);setQtd("");setMedida("g");}}>Adicionar</Button>
        </div>
      </Modal>

      <Modal open={listaOpen} onClose={()=>setListaOpen(false)} title="Lista de Compras Semanal">
        <div className="text-[12px] text-muted mb-4">7 dias · peso bruto (FC aplicado)</div>
        {compraItems.length===0?<p className="text-[13px] text-[#555] text-center py-4">Cadastre alimentos primeiro.</p>:compraItems.map(item=>(
          <div key={item.nome} className="flex items-center justify-between py-2.5 border-b border-mutedline last:border-0">
            <div><div className="text-[14px] text-[#F0F0F0]">{item.nome}</div><div className="text-[11px] text-muted">{Math.round(item.gramas)}g/dia · FC {item.fc}</div></div>
            <div className="text-[14px] font-extrabold text-accent text-right ml-2">{Math.round(item.gramas*7*item.fc)}g<br/><span className="text-[10px] text-muted">bruto/sem</span></div>
          </div>
        ))}
        <Button variant="ghost" full className="mt-4" onClick={()=>setListaOpen(false)}>Fechar</Button>
      </Modal>
    </div>
  );
}
