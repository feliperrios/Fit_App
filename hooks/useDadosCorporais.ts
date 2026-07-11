"use client";
import { useState, useEffect, useCallback } from "react";
import { DadosCorporais, PesoRegistro } from "@/lib/types";
import { getDb } from "@/lib/db";
export function useDadosCorporais(userId: string|undefined) {
  const [dados, setDados] = useState<DadosCorporais>({userId:userId??""});
  const [historico, setHistorico] = useState<PesoRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async()=>{
    if(!userId) return;
    const [d,h] = await Promise.all([getDb().getDadosCorporais(userId), getDb().getPesoHistorico(userId)]);
    setDados(d); setHistorico(h); setLoading(false);
  },[userId]);
  useEffect(()=>{reload();},[reload]);
  async function setDado(campo: keyof Omit<DadosCorporais,"userId">, valor: string){ if(!userId)return; await getDb().setDadoCorporal(userId,campo,valor); await reload(); }
  async function addPeso(data: string, peso: number){ if(!userId)return; await getDb().addPesoRegistro(userId,data,peso); await reload(); }
  async function removePeso(id: string){ if(!userId)return; await getDb().removePesoRegistro(userId,id); await reload(); }
  return {dados,historico,loading,reload,setDado,addPeso,removePeso};
}
