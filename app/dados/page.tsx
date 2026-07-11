"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/types";
import { useDadosCorporais } from "@/hooks/useDadosCorporais";
import { canEditDadosCorporais, readonlyReason } from "@/lib/permissions";
import { fmtDataBR, todayYmd } from "@/lib/date";
import { Button } from "@/components/ui/Button";
import { CollapsibleCard } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { ReadonlyBanner } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";

const CAMPOS = [
  {id:"idade" as const,label:"Idade",unidade:"anos",type:"number",placeholder:"Ex: 28"},
  {id:"sexo" as const,label:"Sexo",unidade:"",type:"select",options:["Masculino","Feminino","Outro"]},
  {id:"altura" as const,label:"Altura",unidade:"m",type:"number",placeholder:"Ex: 1.78",step:"0.01"},
];

export default function DadosPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile|null>(null);
  const [pesoOpen, setPesoOpen] = useState(false);
  const [novaPesoData, setNovaPesoData] = useState(todayYmd());
  const [novoPeso, setNovoPeso] = useState("");
  const [editCampo, setEditCampo] = useState<string|null>(null);
  const [editValor, setEditValor] = useState("");
  const [dupConfirm, setDupConfirm] = useState<{data:string;peso:number}|null>(null);

  useEffect(()=>{
    const s=sessionStorage.getItem("fitapp_user"); if(!s){router.push("/");return;} setUser(JSON.parse(s));
  },[router]);

  const {dados,historico,setDado,addPeso,removePeso} = useDadosCorporais(user?.id);
  const canEdit = canEditDadosCorporais(user);
  const reason = readonlyReason(user,"dados");

  async function handleAddPeso(){
    const p=parseFloat(novoPeso); if(!novaPesoData||isNaN(p)||p<30)return;
    const dup=historico.find(r=>r.data===novaPesoData);
    if(dup){setDupConfirm({data:novaPesoData,peso:p});return;}
    await addPeso(novaPesoData,p); setPesoOpen(false); setNovoPeso("");
  }

  if(!user) return null;
  return (
    <div className="px-4 py-4 pb-8">
      <div className="flex items-center gap-2.5 mb-5">
        <Button variant="icon" onClick={()=>router.push("/home")}><i className="ti ti-arrow-left"/></Button>
        <span className="text-[17px] font-bold text-[#F0F0F0] flex-1">Dados Corporais</span>
      </div>
      {reason && <ReadonlyBanner reason={reason}/>}
      <div className="bg-card border border-cardborder rounded-card p-4 mb-3">
        <span className="text-[11px] font-bold text-[#777] uppercase tracking-wider mb-3.5 block">Informacoes pessoais</span>
        {CAMPOS.map(campo=>{
          const valor=dados[campo.id]; const editing=editCampo===campo.id;
          return (
            <div key={campo.id} className="py-3 border-b border-mutedline last:border-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[12px] text-muted">{campo.label}</span>
                {valor&&canEdit&&<span className="text-[12px] text-accent-text underline cursor-pointer ml-auto" onClick={()=>{setEditCampo(campo.id);setEditValor(valor);}}>editar</span>}
              </div>
              {editing ? (
                <div className="flex gap-2 items-center">
                  {campo.type==="select"
                    ?<select className="flex-1 bg-surface border border-[#4A4A4C] rounded-lg px-3 py-2 text-[14px] text-[#F0F0F0] outline-none" value={editValor} onChange={e=>setEditValor(e.target.value)}>{campo.options!.map(o=><option key={o}>{o}</option>)}</select>
                    :<Input type={campo.type} value={editValor} onChange={e=>setEditValor(e.target.value)} placeholder={campo.placeholder} className="flex-1"/>}
                  <Button variant="ghost" size="sm" onClick={()=>setEditCampo(null)}>Cancelar</Button>
                  <Button size="sm" onClick={async()=>{await setDado(campo.id,editValor);setEditCampo(null);}}>Salvar</Button>
                </div>
              ) : valor ? (
                <div className="text-[15px] font-semibold text-[#F0F0F0]">{valor}<span className="text-[13px] text-muted ml-1">{campo.unidade}</span></div>
              ) : canEdit ? (
                <div className="flex gap-2 items-center mt-1">
                  {campo.type==="select"
                    ?<select className="flex-1 bg-surface border border-[#4A4A4C] rounded-lg px-3 py-2 text-[14px] text-[#F0F0F0] outline-none" onChange={e=>setEditValor(e.target.value)} onClick={()=>setEditCampo(campo.id)}>{campo.options!.map(o=><option key={o}>{o}</option>)}</select>
                    :<Input type={campo.type} placeholder={campo.placeholder} onChange={e=>setEditValor(e.target.value)} onFocus={()=>setEditCampo(campo.id)} className="flex-1"/>}
                  <Button size="sm" onClick={async()=>{if(editValor){await setDado(campo.id,editValor);setEditCampo(null);}}}>Salvar</Button>
                </div>
              ) : <div className="text-[14px] text-[#555] italic">Nao informado</div>}
            </div>
          );
        })}
      </div>
      <CollapsibleCard title="Historico de peso" icon={<i className="ti ti-history text-accent text-[15px]"/>}
        rightSlot={canEdit?<Button variant="icon" size="sm" onClick={e=>{e.stopPropagation();setPesoOpen(!pesoOpen);}}><i className="ti ti-plus"/></Button>:undefined}>
        {pesoOpen&&canEdit&&(
          <div className="bg-surface2 border border-cardborder rounded-lg p-3.5 mb-3">
            <div className="mb-3"><Label>Data</Label><Input type="date" value={novaPesoData} onChange={e=>setNovaPesoData(e.target.value)}/></div>
            <div className="mb-3"><Label>Peso (kg)</Label><Input type="number" value={novoPeso} onChange={e=>setNovoPeso(e.target.value)} placeholder="ex: 83.4" step="0.1"/></div>
            <div className="flex gap-2"><Button variant="ghost" onClick={()=>setPesoOpen(false)}>Cancelar</Button><Button className="flex-1 justify-center" onClick={handleAddPeso}>Salvar</Button></div>
          </div>
        )}
        {historico.length===0?<p className="text-[13px] text-[#555] text-center py-4">Nenhum registro ainda.</p>:historico.map((r,i)=>{
          const prev=historico[i+1]; const diff=prev?parseFloat((r.peso-prev.peso).toFixed(1)):null;
          return (
            <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-mutedline last:border-0">
              <span className="text-[13px] text-muted">{fmtDataBR(r.data)}</span>
              <div className="flex items-center gap-3.5">
                {diff!==null&&<span className={`text-[12px] font-bold ${diff>0?"text-danger-text":"text-accent-text"}`}>{diff>0?"+":""}{diff}kg</span>}
                <span className="text-[14px] font-bold text-[#F0F0F0]">{r.peso.toFixed(1)} kg</span>
                {canEdit&&<Button variant="icon-danger" size="sm" onClick={()=>removePeso(r.id)}><i className="ti ti-trash text-[13px]"/></Button>}
              </div>
            </div>
          );
        })}
      </CollapsibleCard>
      <Modal open={!!dupConfirm} onClose={()=>setDupConfirm(null)} title="Data ja registrada" center>
        <p className="text-[13px] text-muted mb-4">Ja existe um registro em {dupConfirm?fmtDataBR(dupConfirm.data):""}. Salvar mesmo assim?</p>
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1 justify-center" onClick={()=>setDupConfirm(null)}>Cancelar</Button>
          <Button className="flex-1 justify-center" onClick={async()=>{if(dupConfirm){await addPeso(dupConfirm.data,dupConfirm.peso);setPesoOpen(false);setNovoPeso("");setDupConfirm(null);}}}>Salvar mesmo assim</Button>
        </div>
      </Modal>
    </div>
  );
}
