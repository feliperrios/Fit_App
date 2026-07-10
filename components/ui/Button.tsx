"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";
type Variant = "primary"|"ghost"|"danger"|"icon"|"icon-danger"|"icon-grey"|"nav"|"dashed";
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: "sm"|"md"|"lg"; full?: boolean; children: ReactNode; }
const base = "cursor-pointer font-sans transition-colors font-semibold rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-50";
const variants: Record<Variant,string> = {
  primary:"bg-accent text-white hover:bg-[#178060]",
  ghost:"bg-surface text-[#F0F0F0] hover:bg-[#4A4A4C]",
  danger:"bg-danger text-white",
  icon:"bg-accent text-white w-[34px] h-[34px] flex-shrink-0",
  "icon-danger":"bg-danger text-white w-[34px] h-[34px] flex-shrink-0",
  "icon-grey":"bg-surface text-[#F0F0F0] w-[34px] h-[34px] flex-shrink-0",
  nav:"bg-accent text-white flex-1 flex-col py-3 px-2 rounded-xl gap-1.5 h-auto",
  dashed:"bg-accent-soft text-accent-text border border-dashed border-accent w-full py-2.5 text-sm font-bold",
};
const sizes: Record<string,string> = { sm:"text-xs px-2 py-1", md:"text-sm px-4 py-2.5", lg:"text-[15px] px-4 py-3.5" };
export function Button({ variant="primary", size="md", full=false, className="", children, ...rest }: Props) {
  const sc = ["icon","icon-danger","icon-grey"].includes(variant) ? "" : sizes[size];
  return <button className={[base,variants[variant],sc,full?"w-full":"",className].join(" ")} {...rest}>{children}</button>;
}
