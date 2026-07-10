"use client";
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
const cls = "w-full bg-surface border-[1.5px] border-[#4A4A4C] rounded-lg px-3 py-2.5 text-[14px] text-[#F0F0F0] outline-none focus:border-accent font-sans";
export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input className={cls} {...props}/>; }
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={`${cls} resize-y min-h-[70px]`} {...props}/>; }
export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) { return <select className={cls} {...props}>{children}</select>; }
export function Label({ children, className="" }: { children: React.ReactNode; className?: string }) { return <label className={`text-xs text-muted font-semibold block mb-1.5 ${className}`}>{children}</label>; }
