"use client";
import { useState, useEffect, useCallback } from "react";
import { Treino, DiaTreinoMap } from "@/lib/types";
import { getDb } from "@/lib/db";
import { DIAS_SEMANA_KEYS, ymd, getDatasSemanaAtual } from "@/lib/date";
export function useTreinos(userId: string|undefined) {
  const [treinos, setTreinos] = useState<Record<string,Treino>>({});
  const [diaTreinoMap, setDiaTreinoMap] = useState<DiaTreinoMap>({} as DiaTreinoMap);
  const [treinosConcluidos, setTreinosConcluidos] = useState<Record<string,boolean>>({});
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async()=>{
    if(!userId)return;
    const [t,m,c] = await Promise.all([getDb().getTreinos(userId),getDb().getDiaTreinoMap(userId),getDb().getTreinosConcluidos(userId)]);
    setTreinos(t); setDiaTreinoMap(m); setTreinosConcluidos(c); setLoading(false);
  },[userId]);
  useEffect(()=>{reload();},[reload]);
  const totalSemana = DIAS_SEMANA_KEYS.filter(k=>!!diaTreinoMap[k]).length;
  function countConcluidos(){
    const datas=getDatasSemanaAtual(); let c=0;
    for(const k of DIAS_SEMANA_KEYS){ const g=diaTreinoMap[k]; if(!g)continue; if(treinosConcluidos[`${ymd(datas[k])}_${g}`])c++; }
    return c;
  }
  const concluidos = countConcluidos();
  async function addGrupo(){ if(!userId)return; await getDb().addGrupoTreino(userId); await reload(); }
  async function removeGrupo(g:string){ if(!userId)return; await getDb().removeGrupoTreino(userId,g); await reload(); }
  async function updateTreino(g:string,patch:Partial<Treino>){ if(!userId)return; await getDb().updateTreino(userId,g,patch); await reload(); }
  async function addExercicio(g:string,bibId:string){ if(!userId)return; await getDb().addExercicioAoTreino(userId,g,bibId); await reload(); }
  async function removeExercicio(g:string,idx:number){ if(!userId)return; await getDb().removeExercicioDoTreino(userId,g,idx); await reload(); }
  async function registrarSerie(g:string,i:number,se:number,r:number,c:number,d:number){ if(!userId)return; await getDb().registrarSerie(userId,g,i,se,r,c,d); await reload(); }
  async function salvarDiaTreinoMap(map:DiaTreinoMap){ if(!userId)return; await getDb().setDiaTreinoMap(userId,map); await reload(); }
  async function toggleConcluido(diaKey:string,grupo:string){
    if(!userId)return;
    const datas=getDatasSemanaAtual(); const chave=`${ymd(datas[diaKey as keyof typeof datas])}_${grupo}`;
    const jaConcluido=!!treinosConcluidos[chave];
    if(!jaConcluido&&totalSemana>0&&concluidos>=totalSemana){alert("Todos os treinos da semana ja foram concluidos.");return;}
    await getDb().setTreinoConcluido(userId,chave,!jaConcluido); await reload();
  }
  return {treinos,diaTreinoMap,treinosConcluidos,totalSemana,concluidos,loading,reload,addGrupo,removeGrupo,updateTreino,addExercicio,removeExercicio,registrarSerie,salvarDiaTreinoMap,toggleConcluido};
}
