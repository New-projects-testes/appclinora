// Mock data store for Clinora — replace with Lovable Cloud later
import type { Patient, Session, Task, Annotation, Tag, Professional } from "./types";

export const currentUser: Professional = {
  id: "u1",
  name: "Dra. Marina Alves",
  email: "marina.alves@clinora.app",
  specialty: "Psicóloga Clínica",
  city: "São Paulo",
  state: "SP",
  registration_type: "CRP",
  registration_number: "06/123456",
  verification_status: true,
  catalog_visible: true,
  accepts_online: true,
  accepts_presential: true,
  bio: "Psicóloga clínica com abordagem em TCC. Atendo adultos com foco em ansiedade e burnout.",
  reminder_enabled: true,
  reminder_interval_minutes: 60,
  avatar: "https://i.pravatar.cc/200?img=47",
};

export const tags: Tag[] = [
  { id: "t1", name: "Ansiedade" },
  { id: "t2", name: "Depressão" },
  { id: "t3", name: "TCC" },
  { id: "t4", name: "Burnout" },
  { id: "t5", name: "Estresse" },
  { id: "t6", name: "Casal" },
];

export const patients: Patient[] = [
  { id: "p1", name: "Rafael Monteiro", email: "rafael.monteiro@email.com", phone: "(11) 98123-4521", status: "ativo", tags: ["t1", "t3"], lastSession: "2026-04-28", avatar: "https://i.pravatar.cc/100?img=12" },
  { id: "p2", name: "Helena Castro", email: "helena.castro@email.com", phone: "(11) 99234-1133", status: "ativo", tags: ["t2"], lastSession: "2026-05-01", avatar: "https://i.pravatar.cc/100?img=32" },
  { id: "p3", name: "João Pedro Lima", email: "joaopedro.lima@email.com", phone: "(11) 98777-6655", status: "em_pausa", tags: ["t4", "t5"], lastSession: "2026-04-22", avatar: "https://i.pravatar.cc/100?img=15" },
  { id: "p4", name: "Beatriz Souza", email: "beatriz.souza@email.com", phone: "(11) 91234-9988", status: "ativo", tags: ["t1"], lastSession: "2026-05-03", avatar: "https://i.pravatar.cc/100?img=49" },
  { id: "p5", name: "Camila Ferreira", email: "camila.ferreira@email.com", phone: "(11) 99888-1010", status: "inativo", tags: ["t6"], lastSession: "2026-04-30", avatar: "https://i.pravatar.cc/100?img=24" },
  { id: "p6", name: "Eduardo Reis", email: "eduardo.reis@email.com", phone: "(11) 98321-4400", status: "encerrado", tags: ["t3", "t1"], lastSession: "2026-04-18", avatar: "https://i.pravatar.cc/100?img=68" },
];

const today = new Date();
const t = (h: number, m = 0, dayOffset = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const sessions: Session[] = [
  { id: "s1", patient_id: "p1", date_time: t(9), duration_minutes: 50, status: "scheduled", payment_status: "pending", value: 220, notes: "" },
  { id: "s2", patient_id: "p2", date_time: t(11), duration_minutes: 50, status: "scheduled", payment_status: "paid", value: 220, notes: "" },
  { id: "s3", patient_id: "p4", date_time: t(14, 30), duration_minutes: 50, status: "scheduled", payment_status: "pending", value: 220, notes: "" },
  { id: "s4", patient_id: "p3", date_time: t(16), duration_minutes: 50, status: "scheduled", payment_status: "paid", value: 220, notes: "" },
  { id: "s5", patient_id: "p5", date_time: t(10, 0, 1), duration_minutes: 50, status: "scheduled", payment_status: "pending", value: 220, notes: "" },
  { id: "s6", patient_id: "p6", date_time: t(15, 0, 2), duration_minutes: 50, status: "scheduled", payment_status: "pending", value: 220, notes: "" },
  { id: "s7", patient_id: "p1", date_time: t(9, 0, -7), duration_minutes: 50, status: "done", payment_status: "paid", value: 220, notes: "Sessão produtiva, paciente relatou melhora no sono." },
  { id: "s8", patient_id: "p1", date_time: t(9, 0, -14), duration_minutes: 50, status: "done", payment_status: "paid", value: 220, notes: "Trabalhamos exposição gradual." },
  { id: "s9", patient_id: "p2", date_time: t(11, 0, -7), duration_minutes: 50, status: "done", payment_status: "paid", value: 220, notes: "" },
  { id: "s10", patient_id: "p3", date_time: t(16, 0, -7), duration_minutes: 50, status: "done", payment_status: "pending", value: 220, notes: "" },
];

export const tasks: Task[] = [
  { id: "tk1", title: "Enviar relatório psicológico", description: "Para encaminhamento médico de Rafael", patient_id: "p1", due_date: t(18, 0, 1), status: "a_fazer", position: 0 },
  { id: "tk2", title: "Atualizar prontuário", description: "Helena — última sessão", patient_id: "p2", due_date: t(18, 0), status: "a_fazer", position: 1 },
  { id: "tk3", title: "Estudar caso de TOC", description: "Revisar literatura recente", due_date: t(18, 0, 3), status: "em_andamento", position: 0 },
  { id: "tk4", title: "Reunião com supervisora", description: "Discussão de casos", due_date: t(15, 0, 2), status: "em_andamento", position: 1 },
  { id: "tk5", title: "Pagar anuidade CRP", description: "", due_date: t(18, 0, -2), status: "concluido", position: 0 },
];

export const annotations: Record<string, Annotation[]> = {
  p1: [
    { id: "a1", date: t(9, 0, -7), content: "Paciente relatou melhora significativa nos sintomas de ansiedade. Está dormindo melhor e conseguindo participar de reuniões no trabalho sem ataques de pânico." },
    { id: "a2", date: t(9, 0, -14), content: "Iniciamos exposição gradual a situações sociais. Combinamos diário de pensamentos para próxima semana." },
    { id: "a3", date: t(9, 0, -28), content: "Primeira sessão. Anamnese completa. Queixa principal: ansiedade generalizada com início há 8 meses." },
  ],
  p2: [
    { id: "a4", date: t(11, 0, -7), content: "Trabalhamos ativação comportamental. Paciente identificou 3 atividades prazerosas para incluir na rotina." },
  ],
};

export const catalog: Professional[] = [
  currentUser,
  { id: "u2", name: "Dr. Lucas Andrade", email: "lucas@x.com", specialty: "Psiquiatra", city: "Rio de Janeiro", state: "RJ", registration_type: "CRM", registration_number: "52/98765", verification_status: true, catalog_visible: true, accepts_online: true, accepts_presential: false, bio: "Psiquiatra com foco em transtornos do humor e ansiedade. Abordagem integrativa.", reminder_enabled: true, reminder_interval_minutes: 60, avatar: "https://i.pravatar.cc/200?img=33" },
  { id: "u3", name: "Camila Ribeiro", email: "camila@x.com", specialty: "Terapeuta", city: "Belo Horizonte", state: "MG", registration_type: "CRP", registration_number: "04/55512", verification_status: true, catalog_visible: true, accepts_online: true, accepts_presential: true, bio: "Terapia humanista. Acolhimento para jovens adultos em transição de vida.", reminder_enabled: true, reminder_interval_minutes: 60, avatar: "https://i.pravatar.cc/200?img=23" },
  { id: "u4", name: "Dr. Tiago Mendes", email: "tiago@x.com", specialty: "Psicólogo", city: "Curitiba", state: "PR", registration_type: "CRP", registration_number: "08/77231", verification_status: true, catalog_visible: true, accepts_online: false, accepts_presential: true, bio: "Psicanálise. Mais de 15 anos de experiência clínica com adultos.", reminder_enabled: true, reminder_interval_minutes: 60, avatar: "https://i.pravatar.cc/200?img=52" },
  { id: "u5", name: "Dra. Sofia Nakamura", email: "sofia@x.com", specialty: "Psicóloga", city: "Porto Alegre", state: "RS", registration_type: "CRP", registration_number: "07/12399", verification_status: true, catalog_visible: true, accepts_online: true, accepts_presential: true, bio: "TCC para casais e adolescentes. Atendimento bilíngue (PT/EN).", reminder_enabled: true, reminder_interval_minutes: 60, avatar: "https://i.pravatar.cc/200?img=41" },
  { id: "u6", name: "Dr. Henrique Costa", email: "henrique@x.com", specialty: "Psiquiatra", city: "São Paulo", state: "SP", registration_type: "CRM", registration_number: "06/22110", verification_status: true, catalog_visible: true, accepts_online: true, accepts_presential: true, bio: "Psiquiatria clínica com ênfase em ansiedade, depressão e burnout corporativo.", reminder_enabled: true, reminder_interval_minutes: 60, avatar: "https://i.pravatar.cc/200?img=60" },
];

export const sessionTemplates = [
  { id: "tpl1", name: "TCC — Sessão padrão", approach: "Cognitivo-Comportamental", content: "Humor inicial:\nPauta da sessão:\nReavaliação cognitiva:\nTarefa de casa:" },
  { id: "tpl2", name: "Psicanálise — Associação livre", approach: "Psicanálise", content: "Conteúdo manifesto:\nConteúdo latente:\nTransferência:\nIntervenção:" },
  { id: "tpl3", name: "Humanista — ACP", approach: "Humanista", content: "Experiência relatada:\nSentimentos predominantes:\nPotencial de crescimento:" },
];
