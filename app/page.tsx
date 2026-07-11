"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDb } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [senha2, setSenha2] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setErr(""); setOk("");
    if(!email||!senha){setErr("Preencha e-mail e senha.");return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setErr("E-mail invalido.");return;}
    setLoading(true);
    const result = await getDb().login(email,senha);
    setLoading(false);
    if("error" in result){setErr(result.error);return;}
    sessionStorage.setItem("fitapp_user", JSON.stringify(result));
    if(result.admin) router.push("/admin"); else router.push("/home");
  }

  async function handleSignup() {
    setErr(""); setOk("");
    if(!nome){setErr("Informe seu nome.");return;}
    if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setErr("E-mail invalido.");return;}
    if(senha.length<6){setErr("Senha minima de 6 caracteres.");return;}
    if(senha!==senha2){setErr("As senhas nao coincidem.");return;}
    setLoading(true);
    const result = await getDb().signup(nome,email,senha);
    setLoading(false);
    if("error" in result){setErr(result.error);return;}
    setOk("Conta criada! Faca login agora.");
    setTimeout(()=>{setMode("login");setOk("");},1500);
  }

  return (
    <div className="flex flex-col justify-center px-6 py-8 min-h-screen">
      <div className="text-center mb-7">
        <div className="w-[76px] h-[76px] bg-accent-soft border-2 border-accent rounded-[22px] flex items-center justify-center mx-auto mb-3.5">
          <i className="ti ti-barbell text-[38px] text-accent"/>
        </div>
        <div className="text-[26px] font-extrabold text-[#F0F0F0]">FitApp</div>
        <div className="text-[13px] text-muted mt-1">Controle sua dieta e seus treinos</div>
      </div>
      <div className="bg-card border border-cardborder rounded-2xl p-6">
        <div className="text-[18px] font-bold text-[#F0F0F0] mb-4">{mode==="login"?"Entrar na conta":"Criar conta"}</div>
        {err && <div className="bg-danger-soft border border-[#E24B4A] rounded-lg px-3 py-2.5 text-[13px] text-danger-text mb-3">{err}</div>}
        {ok  && <div className="bg-accent-soft border border-accent rounded-lg px-3 py-2.5 text-[13px] text-accent-text mb-3">{ok}</div>}
        {mode==="signup" && <div className="mb-3.5"><Label>Nome</Label><Input type="text" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Seu nome completo"/></div>}
        <div className="mb-3.5"><Label>E-mail</Label><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/></div>
        <div className="mb-3.5"><Label>Senha</Label><Input type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder={mode==="login"?"Sua senha":"Min. 6 caracteres"} onKeyDown={e=>e.key==="Enter"&&mode==="login"&&handleLogin()}/></div>
        {mode==="signup" && <div className="mb-3.5"><Label>Confirmar senha</Label><Input type="password" value={senha2} onChange={e=>setSenha2(e.target.value)} placeholder="Repita a senha"/></div>}
        <Button variant="primary" size="lg" full onClick={mode==="login"?handleLogin:handleSignup} disabled={loading} className="mt-1 mb-3">
          {loading?"Carregando...":mode==="login"?"Entrar":"Criar conta"}
        </Button>
        <div className="flex items-center gap-2.5 my-3.5">
          <hr className="flex-1 border-t border-cardborder"/>
          <span className="text-xs text-[#555]">{mode==="login"?"nao tem conta?":"ja tem conta?"}</span>
          <hr className="flex-1 border-t border-cardborder"/>
        </div>
        <Button variant="ghost" size="md" full onClick={()=>{setErr("");setOk("");setMode(mode==="login"?"signup":"login");}}>
          {mode==="login"?"Criar conta":"Entrar na conta"}
        </Button>
      </div>
      <div className="text-center mt-4 text-[11px] text-[#444]">v1.0.0</div>
    </div>
  );
}
