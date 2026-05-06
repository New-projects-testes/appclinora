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
  { id: "p4", name: "Beatriz Souza", email: "beatriz.souza@email.com", phone: "(11) 91234-9988", birthDate: "1992-08-14", gender: "mulher_cis", notes: "Encaminhada pela Dra. Marina. Histórico de ansiedade generalizada e episódios de pânico desde 2020. Demonstra boa adesão ao tratamento.", status: "ativo", tags: ["t1", "t3"], lastSession: "2026-05-03", avatar: "https://i.pravatar.cc/100?img=49" },
  { id: "p4b", name: "Mateus Ribeiro", email: "mateus.ribeiro@email.com", phone: "(11) 95555-1212", birthDate: "2012-03-22", gender: "homem_cis", notes: "Acompanhamento por dificuldades de concentração na escola.", status: "ativo", isMinor: true, guardianName: "Carla Ribeiro", guardianEmail: "carla.ribeiro@email.com", guardianPhone: "(11) 98888-7777", tags: ["t5"], lastSession: "2026-04-29" },
  { id: "p5", name: "Camila Ferreira", email: "camila.ferreira@email.com", phone: "(11) 99888-1010", status: "inativo", tags: ["t6"], lastSession: "2026-04-30", avatar: "https://i.pravatar.cc/100?img=24" },
  { id: "p6", name: "Eduardo Reis", email: "eduardo.reis@email.com", phone: "(11) 98321-4400", status: "encerrado", tags: ["t3", "t1"], lastSession: "2026-04-18", avatar: "https://i.pravatar.cc/100?img=68" },
  { id: "p7", name: "Mariana Alves", email: "mariana.alves@email.com", phone: "(11) 99111-2233", status: "ativo", tags: ["t1"], lastSession: "2026-05-02" },
  { id: "p8", name: "Lucas Pereira", email: "lucas.pereira@email.com", phone: "(11) 98222-3344", status: "ativo", tags: ["t3"], lastSession: "2026-04-25" },
  { id: "p9", name: "Patricia Gomes", email: "patricia.gomes@email.com", phone: "(11) 97333-4455", status: "em_pausa", tags: ["t2"], lastSession: "2026-04-10" },
  { id: "p10", name: "Fernando Dias", email: "fernando.dias@email.com", phone: "(11) 96444-5566", status: "ativo", tags: ["t4"], lastSession: "2026-05-04" },
  { id: "p11", name: "Isabela Rocha", email: "isabela.rocha@email.com", phone: "(11) 95555-6677", status: "ativo", tags: ["t1", "t5"], lastSession: "2026-04-29" },
  { id: "p12", name: "Gabriel Martins", email: "gabriel.martins@email.com", phone: "(11) 94666-7788", status: "inativo", tags: ["t6"], lastSession: "2026-03-15" },
  { id: "p13", name: "Larissa Cunha", email: "larissa.cunha@email.com", phone: "(11) 93777-8899", status: "ativo", tags: ["t2", "t3"], lastSession: "2026-05-05" },
  { id: "p14", name: "Thiago Barbosa", email: "thiago.barbosa@email.com", phone: "(11) 92888-9900", status: "ativo", tags: ["t1"], lastSession: "2026-04-27" },
  { id: "p15", name: "Sofia Cardoso", email: "sofia.cardoso@email.com", phone: "(11) 91999-0011", status: "encerrado", tags: ["t4"], lastSession: "2026-02-20" },
  { id: "p16", name: "Ricardo Nunes", email: "ricardo.nunes@email.com", phone: "(11) 90000-1122", status: "ativo", tags: ["t5"], lastSession: "2026-05-01" },
  { id: "p17", name: "Juliana Pires", email: "juliana.pires@email.com", phone: "(11) 98888-2233", status: "em_pausa", tags: ["t1"], lastSession: "2026-04-12" },
  { id: "p18", name: "Bruno Tavares", email: "bruno.tavares@email.com", phone: "(11) 97777-3344", status: "ativo", tags: ["t3"], lastSession: "2026-04-30" },
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
  { id: "s11", patient_id: "p4", date_time: t(14, 30, -7), duration_minutes: 50, status: "done", payment_status: "paid", value: 220, notes: "<p>Paciente trouxe relato de melhora no quadro de ansiedade. Trabalhamos <strong>técnicas de respiração diafragmática</strong> e identificação de gatilhos.</p><p>Tarefa de casa: diário de pensamentos automáticos.</p>" },
  { id: "s12", patient_id: "p4", date_time: t(14, 30, -14), duration_minutes: 50, status: "done", payment_status: "paid", value: 220, notes: "<p>Sessão focada em <em>reestruturação cognitiva</em>. Identificamos três distorções principais.</p>" },
  { id: "s13", patient_id: "p4", date_time: t(14, 30, -21), duration_minutes: 50, status: "done", payment_status: "isento", value: 220, notes: "<p>Sessão de acolhimento. Paciente em momento delicado, sessão isenta.</p>" },
  { id: "s14", patient_id: "p4", date_time: t(14, 30, -28), duration_minutes: 50, status: "done", payment_status: "pending", value: 220, notes: "<h3>Anamnese</h3><p>Primeira consulta. Queixa principal: ansiedade no trabalho.</p>" },
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
  {
    id: "tpl1",
    name: "TCC — Sessão padrão",
    approach: "Cognitivo-Comportamental",
    content: `<h3>Humor inicial</h3><p>Avaliação subjetiva (0–10): </p><h3>Pauta da sessão</h3><ul><li>Revisão da tarefa de casa</li><li>Tema central</li><li>Técnica aplicada</li></ul><h3>Reestruturação cognitiva</h3><p>Pensamento automático identificado: </p><p>Distorção: </p><p>Pensamento alternativo: </p><h3>Tarefa de casa</h3><p></p>`,
  },
  {
    id: "tpl2",
    name: "Psicanálise — Associação livre",
    approach: "Psicanálise",
    content: `<h3>Conteúdo manifesto</h3><p></p><h3>Conteúdo latente</h3><p></p><h3>Transferência / contratransferência</h3><p></p><h3>Intervenção</h3><p></p>`,
  },
  {
    id: "tpl3",
    name: "Humanista — ACP",
    approach: "Abordagem Centrada na Pessoa",
    content: `<h3>Experiência relatada</h3><p></p><h3>Sentimentos predominantes</h3><p></p><h3>Empatia e congruência</h3><p></p><h3>Potencial de crescimento</h3><p></p>`,
  },
  {
    id: "tpl4",
    name: "Anamnese inicial",
    approach: "Genérico",
    content: `<h3>Identificação</h3><p>Nome, idade, profissão: </p><h3>Queixa principal</h3><p></p><h3>História da queixa</h3><p>Início, frequência, intensidade, fatores desencadeantes: </p><h3>História pessoal</h3><ul><li>Família</li><li>Escolaridade</li><li>Relacionamentos</li><li>Saúde geral</li></ul><h3>Hipótese diagnóstica</h3><p></p><h3>Plano terapêutico</h3><p></p>`,
  },
  {
    id: "tpl5",
    name: "Sessão de retorno",
    approach: "Genérico",
    content: `<h3>Como foi a semana</h3><p></p><h3>Eventos significativos</h3><ul><li></li></ul><h3>Trabalho na sessão</h3><p></p><h3>Encaminhamentos</h3><p></p>`,
  },
  {
    id: "tpl6",
    name: "Encerramento de processo",
    approach: "Genérico",
    content: `<h3>Avaliação do processo</h3><p>Objetivos alcançados: </p><h3>Ganhos identificados pelo paciente</h3><p></p><h3>Recursos desenvolvidos</h3><p></p><h3>Recomendações finais</h3><p></p><h3>Possibilidade de retorno</h3><p></p>`,
  },
];
