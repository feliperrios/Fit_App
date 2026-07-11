"use client";
import { useState, useEffect, useCallback } from "react";
import { Refeicao, AlimentoRefeicao } from "@/lib/types";
import { getDb } from "@/lib/db";
export function useDieta(userId: string|undefined) {
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [obs, setObsState] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async()=>{
    if(!userId) return;
    const [r,o] = await Promise.all([getDb().getRefeicoes(userId), getDb().getDietaObs(userId)]);
    setRefeicoes(r); setObsState(o); setLoading(false);
  },[userId]);
  useEffect(()=>{reload();},[reload]);
  const totalKcal = refeicoes.filter(r=>r.concluida).flatMap(r=>r.alimentos).reduce((a,al)=>a+al.kcal,0);
  async function addRefeicao(){ if(!userId)return; await getDb().addRefeicao(userId); await reload(); }
  async function removeRefeicao(id:string){ if(!userId)return; await getDb().removeRefeicao(userId,id); await reload(); }
  async function toggleConcluida(id:string){ if(!userId)return; await getDb().toggleRefeicaoConcluida(userId,id); await reload(); }
  async function addAlimento(refId:string,alimento:AlimentoRefeicao){ if(!userId)return; await getDb().addAlimentoRefeicao(userId,refId,alimento); await reload(); }
  async function removeAlimento(refId:string,idx:number){ if(!userId)return; await getDb().removeAlimentoRefeicao(userId,refId,idx); await reload(); }
  async function salvarObs(texto:string){ if(!userId)return; await getDb().setDietaObs(userId,texto); await reload(); }
  return {refeicoes,obs,totalKcal,loading,reload,addRefeicao,removeRefeicao,toggleConcluida,addAlimento,removeAlimento,salvarObs};
}
