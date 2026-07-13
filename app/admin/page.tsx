"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/types";
import { getDb } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile|null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(()=>{
    const s=sessionStorage.getItem("fitapp_user");
    if(!s){router.push("/");return;}
    const u=JSON.parse(s) as Profile;
    if(!u.admin){router.push("/home");return;}
    setUser(u); loadProfiles();
  },[router]);

  async function loadProfiles(){ setProfiles(await getDb().listProfiles()); }

  async function toggle(id:string, campo:keyof Profile, valor:unknown){
    await getDb().updateProfile(id,{[campo]:valor} as Partial<Profile>);
    await loadProfiles();
  }

  async function handleDelete(id:string, nome:string){
    if(!confirm(`Deletar ${nome}?`)) return;
    await getDb().deleteProfile(id); await loadProfiles();
  }

  const filtrados = profiles.filter(p=>!busca||p.nome.toLowerCase().includes(busca.toLowerCase())||p.email.toLowerCase().includes(busca.toLowerCase()));
  const total=profiles.length, ativos=profiles.filter(p=>p.status==="active").length, bloqueados=profiles.filter(p=>p.status==="blocked").length;

  if(!user) return null;

  return (
    <div>
      <div className="flex items-center gap-2.5 px-4 py-4 bg-card border-b border-cardborder">
        <Button variant="icon-danger" onClick={async()=>{await getDb().logout();sessionStorage.removeItem("fitapp_user");router.push("/");}}>
          <i className="ti ti-logout"/>
        </Button>
        <div className="flex-1">
          <div className="text-[16px] font-bold text-[#F0F0F0]">Painel Admin</div>
          <div className="text-[11px] text-muted mt-0.5">{user.email}</div>
        </div>
        <span className="bg-danger-soft text-danger-text text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-[#E24B4A]">ADMIN</span>
      </div>
      <div className="px-4 py-4 pb-8">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[{label:"Total",valor:total,cor:"#F0F0F0"},{label:"Ativos",valor:ativos,cor:"#4CD9A0"},{label:"Bloqueados",valor:bloqueados,cor:"#F06060"}].map(s=>(
            <div key={s.label} className="bg-card border border-cardborder rounded-xl p-3.5 text-center">
              <div className="text-[24px] font-extrabold" style={{color:s.cor}}>{s.valor}</div>
              <div className="text-[11px] text-muted font-semibold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="text-[14px] font-bold text-[#F0F0F0] mb-2.5">Usuarios</div>
        <Input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar por nome ou e-mail..." className="mb-3.5"/>
        {filtrados.length===0?<p className="text-[13px] text-[#555] text-center py-4">Nenhum usuario.</p>:filtrados.map(p=>{
          const bl=p.status==="blocked";
          return (
            <div key={p.id} className="bg-card border border-cardborder rounded-xl p-3.5 mb-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center text-[15px] font-extrabold flex-shrink-0 border ${bl?"bg-danger-soft border-[#E24B4A] text-danger-text":"bg-accent-soft border-accent text-accent-text"}`}>
                    {p.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-[#F0F0F0]">{p.nome}</div>
                    <div className="text-[11px] text-muted">{p.email}</div>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {p.coachNutri&&<span className="text-[10px] bg-[#0D2D1A] text-accent-text px-1.5 py-0.5 rounded">Nutri</span>}
                      {p.coachTrainer&&<span className="text-[10px] bg-warn-soft text-warn px-1.5 py-0.5 rounded">Trainer</span>}
                      <span className="text-[11px] text-[#666]">{p.teste?"Teste":p.expira?`Expira ${p.expira}`:"Sem expiracao"}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.teste?"bg-purpleish-soft text-purpleish border-[#3A4A8C]":bl?"bg-danger-soft text-danger-text border-[#E24B4A]":"bg-accent-soft text-accent-text border-accent"}`}>
                  {p.teste?"Teste":bl?"Bloqueado":"Ativo"}
                </span>
              </div>
              <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-mutedline flex-wrap">
                <button onClick={()=>toggle(p.id,"status",bl?"active":"blocked")} className={`flex-1 rounded-lg py-2 text-[12px] font-bold cursor-pointer border-0 ${bl?"bg-accent-soft text-accent-text":"bg-[#2C2C2E] text-warn"}`}>{bl?"Desbloquear":"Bloquear"}</button>
                <button onClick={()=>toggle(p.id,"teste",!p.teste)} className={`flex-1 rounded-lg py-2 text-[12px] font-bold cursor-pointer border-0 ${p.teste?"bg-accent-soft text-accent-text":"bg-blueish-soft text-blueish"}`}>{p.teste?"Rem. teste":"Marcar teste"}</button>
                <button onClick={()=>toggle(p.id,"coachNutri",!p.coachNutri)} className={`flex-1 rounded-lg py-2 text-[12px] font-bold cursor-pointer border-0 ${p.coachNutri?"bg-accent-soft text-accent-text":"bg-purpleish-soft text-purpleish"}`}>{p.coachNutri?"Rem. Nutri":"+ Nutri"}</button>
                <button onClick={()=>toggle(p.id,"coachTrainer",!p.coachTrainer)} className={`flex-1 rounded-lg py-2 text-[12px] font-bold cursor-pointer border-0 ${p.coachTrainer?"bg-accent-soft text-accent-text":"bg-[#2C2C2E] text-warn"}`}>{p.coachTrainer?"Rem. Trainer":"+ Trainer"}</button>
                <button onClick={()=>handleDelete(p.id,p.nome)} className="flex-1 rounded-lg py-2 text-[12px] font-bold cursor-pointer border-0 bg-danger-soft text-danger-text">Deletar</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
