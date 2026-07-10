// lib/permissions.ts
import { Profile } from "./types";
export function canEditDadosCorporais(user: Profile|null): boolean { return !!user && !user.coachNutri; }
export function canEditTreinos(user: Profile|null): boolean { return !!user && !user.coachTrainer; }
export function canEditDieta(user: Profile|null): boolean { return !!user && !user.coachNutri; }
export function readonlyReason(user: Profile|null, area: "dados"|"treinos"|"dieta"): string|null {
  if(!user) return null;
  if((area==="dados"||area==="dieta") && user.coachNutri) return "Nutricionista";
  if(area==="treinos" && user.coachTrainer) return "Treinador";
  return null;
}
