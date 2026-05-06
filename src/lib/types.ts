export type Tag = { id: string; name: string };

export type PatientStatus = "ativo" | "em_pausa" | "inativo" | "encerrado";

export type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  gender?: string;
  notes?: string;
  isMinor?: boolean;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  status: PatientStatus;
  tags: string[];
  lastSession?: string;
  avatar?: string;
};

export type Session = {
  id: string;
  patient_id: string;
  date_time: string;
  duration_minutes: number;
  status: "scheduled" | "done" | "cancelled";
  payment_status: "pending" | "paid";
  value: number;
  notes?: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  patient_id?: string;
  due_date: string;
  status: "a_fazer" | "em_andamento" | "concluido";
  position: number;
};

export type Annotation = {
  id: string;
  date: string;
  content: string;
};

export type Professional = {
  id: string;
  name: string;
  email: string;
  specialty: string;
  city: string;
  state: string;
  registration_type: string;
  registration_number: string;
  verification_status: boolean;
  catalog_visible: boolean;
  accepts_online: boolean;
  accepts_presential: boolean;
  bio: string;
  reminder_enabled: boolean;
  reminder_interval_minutes: number;
  avatar?: string;
};
