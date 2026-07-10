// lib/db.ts
import { Profile, PesoRegistro, DadosCorporais, ExercicioBiblioteca, Treino, DiaTreinoMap, Refeicao } from "./types";
export interface Database {
  login(email:string,senha:string): Promise<Profile|{error:string}>;
  signup(nome:string,email:string,senha:string): Promise<Profile|{error:string}>;
  logout(): Promise<void>;
  listProfiles(): Promise<Profile[]>;
  updateProfile(id:string,patch:Partial<Profile>): Promise<void>;
  deleteProfile(id:string): Promise<void>;
  getPesoHistorico(userId:string): Promise<PesoRegistro[]>;
  addPesoRegistro(userId:string,data:string,peso:number): Promise<void>;
  removePesoRegistro(userId:string,registroId:string): Promise<void>;
  getDadosCorporais(userId:string): Promise<DadosCorporais>;
  setDadoCorporal(userId:string,campo:keyof Omit<DadosCorporais,"userId">,valor:string): Promise<void>;
  getTreinos(userId:string): Promise<Record<string,Treino>>;
  addGrupoTreino(userId:string): Promise<string>;
  removeGrupoTreino(userId:string,grupo:string): Promise<void>;
  updateTreino(userId:string,grupo:string,patch:Partial<Treino>): Promise<void>;
  addExercicioAoTreino(userId:string,grupo:string,exercicioBibliotecaId:string): Promise<void>;
  removeExercicioDoTreino(userId:string,grupo:string,exercicioIndex:number): Promise<void>;
  registrarSerie(userId:string,grupo:string,exercicioIndex:number,series:number,reps:number,carga:number,descanso:number): Promise<void>;
  getBibliotecaExercicios(userId:string): Promise<ExercicioBiblioteca[]>;
  addExercicioBiblioteca(userId:string,exercicio:Omit<ExercicioBiblioteca,"id"|"userId"|"midias">): Promise<void>;
  removeExercicioBiblioteca(userId:string,exercicioId:string): Promise<void>;
  addMidiaExercicio(userId:string,exercicioId:string,tipo:"foto"|"video",url:string): Promise<void>;
  removeMidiaExercicio(userId:string,exercicioId:string,tipo:"foto"|"video",midiaIndex:number): Promise<void>;
  getDiaTreinoMap(userId:string): Promise<DiaTreinoMap>;
  setDiaTreinoMap(userId:string,map:DiaTreinoMap): Promise<void>;
  getTreinosConcluidos(userId:string): Promise<Record<string,boolean>>;
  setTreinoConcluido(userId:string,chave:string,concluido:boolean): Promise<void>;
  getRefeicoes(userId:string): Promise<Refeicao[]>;
  addRefeicao(userId:string): Promise<void>;
  removeRefeicao(userId:string,refeicaoId:string): Promise<void>;
  toggleRefeicaoConcluida(userId:string,refeicaoId:string): Promise<void>;
  addAlimentoRefeicao(userId:string,refeicaoId:string,alimento:Refeicao["alimentos"][number]): Promise<void>;
  removeAlimentoRefeicao(userId:string,refeicaoId:string,alimentoIndex:number): Promise<void>;
  getDietaObs(userId:string): Promise<string>;
  setDietaObs(userId:string,obs:string): Promise<void>;
}
const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === "true";
import { mockDb } from "./db-mock";
let dbInstance: Database = mockDb;
export function getDb(): Database {
  if(useSupabase){ const {supabaseDb} = require("./db-supabase"); dbInstance=supabaseDb; }
  return dbInstance;
}
