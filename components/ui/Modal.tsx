"use client";
import { ReactNode, useEffect } from "react";
export function Modal({ open, onClose, title, children, center=false }: { open:boolean; onClose:()=>void; title:string; children:ReactNode; center?:boolean }) {
  useEffect(()=>{ if(open)document.body.style.overflow="hidden"; else document.body.style.overflow=""; return()=>{document.body.style.overflow="";}; },[open]);
  if(!open) return null;
  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-end justify-center" style={center?{alignItems:"center"}:{}} onClick={onClose}>
      <div className={`bg-card border-t-[2.5px] border-accent w-full max-w-app max-h-[85vh] overflow-y-auto p-5 pb-9 ${center?"rounded-2xl mx-4 border":"rounded-t-2xl"}`} onClick={e=>e.stopPropagation()}>
        <span className="block text-[15px] font-bold text-[#F0F0F0] mb-4">{title}</span>
        {children}
      </div>
    </div>
  );
}
