// lib/types.ts
export interface Profile {
  id: string; nome: string; email: string; admin: boolean;
  status: "active" | "blocked"; teste: boolean; expira: string | null;
  coachNutri: boolean; coachTrainer: boolean;
}
export interface PesoRegistro { id: string; userId: string; data: string; peso: number; }
export interface DadosCorporais { 
  userId: string; 
  idade?: string; 
  sexo?: string; 
  altura?: string;
  [key: string]: string | undefined;
}
export interface ExercicioMidia { tipo: "foto" | "video"; url: string; }
export interface ExercicioBiblioteca {
  id: string; userId: string; nome: string; grupoMuscular: string;
  seriesPadrao?: number; repsMin?: number; repsMax?: number; descansoPadrao: number;
  midias: ExercicioMidia[];
}
export interface SerieRegistrada { series: number; reps: number; carga: number; descanso: number; data: string; }
export interface ExercicioTreino {
  exercicioId: string; nome: string; grupoMuscular: string;
  seriesPadrao?: number; repsMin?: number; repsMax?: number; descansoPadrao: number;
  series: SerieRegistrada[];
}
export interface Treino { id: string; userId: string; nome: string; observacao: string; exercicios: ExercicioTreino[]; }
export type DiaSemanaKey = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
export type DiaTreinoMap = Record<DiaSemanaKey, string | null>;
export interface AlimentoRefeicao {
  nomeTaco: string; gramas: number; fatorCoccao: number; medidaLabel: string;
  kcal: number; proteina: number; carboidrato: number; gordura: number;
}
export interface Refeicao { id: string; userId: string; nome: string; alimentos: AlimentoRefeicao[]; concluida: boolean; }
export interface TacoAlimento { nome: string; categoria: string; kcal: number; proteina: number; carboidrato: number; gordura: number; fatorCoccao: number; }
