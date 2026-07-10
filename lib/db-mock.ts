// lib/db-mock.ts
import { Database } from "./db";
import { Profile, PesoRegistro, DadosCorporais, ExercicioBiblioteca, Treino, DiaTreinoMap, Refeicao } from "./types";
import { DIAS_SEMANA_KEYS } from "./date";
function uid(p="id"){ return p+"_"+Math.random().toString(36).slice(2,10); }
const state = {
  profiles: [
    {id:"u1",nome:"Admin FitApp",email:"admin@fitapp.com",senha:"admin123",admin:true,status:"active" as const,teste:false,expira:null,coachNutri:false,coachTrainer:false},
    {id:"u2",nome:"Rafael Silva",email:"rafael@email.com",senha:"123456",admin:false,status:"active" as const,teste:false,expira:"2025-12-31",coachNutri:false,coachTrainer:false},
    {id:"u3",nome:"Ana Lima",email:"ana@email.com",senha:"123456",admin:false,status:"active" as const,teste:false,expira:"2025-10-15",coachNutri:true,coachTrainer:false},
    {id:"u4",nome:"Bruno Costa",email:"bruno@email.com",senha:"123456",admin:false,status:"active" as const,teste:true,expira:null,coachNutri:false,coachTrainer:true},
    {id:"u5",nome:"Carla Melo",email:"carla@email.com",senha:"123456",admin:false,status:"active" as const,teste:false,expira:"2025-09-01",coachNutri:true,coachTrainer:true},
  ] as (Profile & {senha:string})[],
  pesoHist:{} as Record<string,PesoRegistro[]>,
  dadosCorp:{} as Record<string,DadosCorporais>,
  treinos:{} as Record<string,Record<string,Treino>>,
  biblioteca:{} as Record<string,ExercicioBiblioteca[]>,
  diaTreinoMap:{} as Record<string,DiaTreinoMap>,
  treinosConcluidos:{} as Record<string,Record<string,boolean>>,
  refeicoes:{} as Record<string,Refeicao[]>,
  dietaObs:{} as Record<string,string>,
};
function ensureUser(userId:string){
  if(!state.pesoHist[userId]) state.pesoHist[userId]=[];
  if(!state.dadosCorp[userId]) state.dadosCorp[userId]={userId};
  if(!state.treinos[userId]) state.treinos[userId]={};
  if(!state.biblioteca[userId]) state.biblioteca[userId]=[];
  if(!state.diaTreinoMap[userId]){ const m={} as DiaTreinoMap; DIAS_SEMANA_KEYS.forEach(k=>m[k]=null); state.diaTreinoMap[userId]=m; }
  if(!state.treinosConcluidos[userId]) state.treinosConcluidos[userId]={};
  if(!state.refeicoes[userId]) state.refeicoes[userId]=[
    {id:uid("ref"),userId,nome:"Ref 1",alimentos:[],concluida:false},
    {id:uid("ref"),userId,nome:"Ref 2",alimentos:[],concluida:false},
    {id:uid("ref"),userId,nome:"Ref 3",alimentos:[],concluida:false},
  ];
  if(state.dietaObs[userId]===undefined) state.dietaObs[userId]="";
}
function stripSenha(p:Profile&{senha:string}):Profile{ const{senha,...r}=p; return r; }
export const mockDb: Database = {
  async login(email,senha){ const u=state.profiles.find(x=>x.email===email); if(!u)return{error:"E-mail nao cadastrado."}; if(u.senha!==senha)return{error:"Senha incorreta."}; if(u.status==="blocked")return{error:"Conta bloqueada."}; ensureUser(u.id); return stripSenha(u); },
  async signup(nome,email,senha){ if(state.profiles.find(x=>x.email===email))return{error:"E-mail ja cadastrado."}; const n={id:uid("u"),nome,email,senha,admin:false,status:"active" as const,teste:false,expira:null,coachNutri:false,coachTrainer:false}; state.profiles.push(n); ensureUser(n.id); return stripSenha(n); },
  async logout(){},
  async listProfiles(){ return state.profiles.map(stripSenha); },
  async updateProfile(id,patch){ const u=state.profiles.find(x=>x.id===id); if(u)Object.assign(u,patch); },
  async deleteProfile(id){ state.profiles=state.profiles.filter(x=>x.id!==id); },
  async getPesoHistorico(userId){ ensureUser(userId); return [...state.pesoHist[userId]].sort((a,b)=>b.data.localeCompare(a.data)); },
  async addPesoRegistro(userId,data,peso){ ensureUser(userId); state.pesoHist[userId].push({id:uid("peso"),userId,data,peso}); },
  async removePesoRegistro(userId,registroId){ ensureUser(userId); state.pesoHist[userId]=state.pesoHist[userId].filter(r=>r.id!==registroId); },
  async getDadosCorporais(userId){ ensureUser(userId); return state.dadosCorp[userId]; },
  async setDadoCorporal(userId,campo,valor){ ensureUser(userId); (state.dadosCorp[userId] as Record<string,string>)[campo]=valor; },
  async getTreinos(userId){ ensureUser(userId); return state.treinos[userId]; },
  async addGrupoTreino(userId){ ensureUser(userId); const a=Object.keys(state.treinos[userId]); let l="A"; for(const c of "ABCDEFGHIJKLMNOPQRSTUVWXYZ"){if(!a.includes(c)){l=c;break;}} state.treinos[userId][l]={id:l,userId,nome:"",observacao:"",exercicios:[]}; return l; },
  async removeGrupoTreino(userId,grupo){ ensureUser(userId); if(Object.keys(state.treinos[userId]).length<=1)throw new Error("Mantenha ao menos um treino."); delete state.treinos[userId][grupo]; DIAS_SEMANA_KEYS.forEach(k=>{if(state.diaTreinoMap[userId][k]===grupo)state.diaTreinoMap[userId][k]=null;}); },
  async updateTreino(userId,grupo,patch){ ensureUser(userId); const t=state.treinos[userId][grupo]; if(t)Object.assign(t,patch); },
  async addExercicioAoTreino(userId,grupo,id){ ensureUser(userId); const ex=state.biblioteca[userId].find(e=>e.id===id); const t=state.treinos[userId][grupo]; if(ex&&t)t.exercicios.push({exercicioId:ex.id,nome:ex.nome,grupoMuscular:ex.grupoMuscular,seriesPadrao:ex.seriesPadrao,repsMin:ex.repsMin,repsMax:ex.repsMax,descansoPadrao:ex.descansoPadrao,series:[]}); },
  async removeExercicioDoTreino(userId,grupo,i){ ensureUser(userId); state.treinos[userId][grupo]?.exercicios.splice(i,1); },
  async registrarSerie(userId,grupo,i,se,r,c,d){ ensureUser(userId); const ex=state.treinos[userId][grupo]?.exercicios[i]; if(ex){ const h=new Date(); ex.series.push({series:se,reps:r,carga:c,descanso:d,data:`${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,"0")}-${String(h.getDate()).padStart(2,"0")}`}); } },
  async getBibliotecaExercicios(userId){ ensureUser(userId); return state.biblioteca[userId]; },
  async addExercicioBiblioteca(userId,ex){ ensureUser(userId); state.biblioteca[userId].push({...ex,id:uid("ex"),userId,midias:[]}); },
  async removeExercicioBiblioteca(userId,id){ ensureUser(userId); state.biblioteca[userId]=state.biblioteca[userId].filter(e=>e.id!==id); },
  async addMidiaExercicio(userId,id,tipo,url){ ensureUser(userId); const ex=state.biblioteca[userId].find(e=>e.id===id); if(ex)ex.midias.push({tipo,url}); },
  async removeMidiaExercicio(userId,id,tipo,i){ ensureUser(userId); const ex=state.biblioteca[userId].find(e=>e.id===id); if(ex){const dt=ex.midias.filter(m=>m.tipo===tipo);const a=dt[i];ex.midias=ex.midias.filter(m=>m!==a);} },
  async getDiaTreinoMap(userId){ ensureUser(userId); return state.diaTreinoMap[userId]; },
  async setDiaTreinoMap(userId,map){ ensureUser(userId); state.diaTreinoMap[userId]=map; },
  async getTreinosConcluidos(userId){ ensureUser(userId); return state.treinosConcluidos[userId]; },
  async setTreinoConcluido(userId,chave,concluido){ ensureUser(userId); state.treinosConcluidos[userId][chave]=concluido; },
  async getRefeicoes(userId){ ensureUser(userId); return state.refeicoes[userId]; },
  async addRefeicao(userId){ ensureUser(userId); const n=state.refeicoes[userId].length+1; state.refeicoes[userId].push({id:uid("ref"),userId,nome:`Ref ${n}`,alimentos:[],concluida:false}); },
  async removeRefeicao(userId,id){ ensureUser(userId); state.refeicoes[userId]=state.refeicoes[userId].filter(r=>r.id!==id); },
  async toggleRefeicaoConcluida(userId,id){ ensureUser(userId); const r=state.refeicoes[userId].find(x=>x.id===id); if(r)r.concluida=!r.concluida; },
  async addAlimentoRefeicao(userId,id,alimento){ ensureUser(userId); const r=state.refeicoes[userId].find(x=>x.id===id); if(r)r.alimentos.push(alimento); },
  async removeAlimentoRefeicao(userId,id,i){ ensureUser(userId); const r=state.refeicoes[userId].find(x=>x.id===id); if(r)r.alimentos.splice(i,1); },
  async getDietaObs(userId){ ensureUser(userId); return state.dietaObs[userId]; },
  async setDietaObs(userId,obs){ ensureUser(userId); state.dietaObs[userId]=obs; },
};
