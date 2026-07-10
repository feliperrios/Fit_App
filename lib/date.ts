// lib/date.ts
// IMPORTANTE: nunca usar toISOString() para chaves de calendario - desloca o dia em fusos negativos.
import { DiaSemanaKey } from "./types";
export function ymd(d: Date): string {
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
export function todayYmd(): string { return ymd(new Date()); }
export const DIAS_SEMANA_KEYS: DiaSemanaKey[] = ["seg","ter","qua","qui","sex","sab","dom"];
export const DIAS_SEMANA_LABELS: Record<DiaSemanaKey,string> = {seg:"Segunda",ter:"Terca",qua:"Quarta",qui:"Quinta",sex:"Sexta",sab:"Sabado",dom:"Domingo"};
export const DIAS_SEMANA_SHORT: Record<DiaSemanaKey,string> = {seg:"Seg",ter:"Ter",qua:"Qua",qui:"Qui",sex:"Sex",sab:"Sab",dom:"Dom"};
export function getDatasSemanaAtual(): Record<DiaSemanaKey,Date> {
  const hoje = new Date(); const dow = hoje.getDay();
  const segunda = new Date(hoje); segunda.setDate(hoje.getDate()-(dow===0?6:dow-1));
  const r = {} as Record<DiaSemanaKey,Date>;
  DIAS_SEMANA_KEYS.forEach((k,i)=>{ const d=new Date(segunda); d.setDate(segunda.getDate()+i); r[k]=d; });
  return r;
}
export function fmtDataBR(s: string): string {
  const [y,m,d]=s.split("-");
  const M=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  return parseInt(d)+" "+M[parseInt(m)-1]+" "+y;
}
export function saudacaoPorHora(): string {
  const h=new Date().getHours(); if(h<12)return"Bom dia"; if(h<18)return"Boa tarde"; return"Boa noite";
}
