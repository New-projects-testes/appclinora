
-- =========================================================
-- Helper: updated_at trigger
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.patient_status AS ENUM ('ativo','em_pausa','inativo','encerrado');
CREATE TYPE public.session_status AS ENUM ('scheduled','done','cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','isento');
CREATE TYPE public.task_status AS ENUM ('a_fazer','em_andamento','concluido');
CREATE TYPE public.modality AS ENUM ('online','presencial');
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','cancelled');

-- =========================================================
-- PROFILES (1:1 com auth.users)
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  specialty TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  registration_type TEXT NOT NULL DEFAULT '',
  registration_number TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  accepts_online BOOLEAN NOT NULL DEFAULT true,
  accepts_presential BOOLEAN NOT NULL DEFAULT false,
  catalog_visible BOOLEAN NOT NULL DEFAULT false,
  verification_status BOOLEAN NOT NULL DEFAULT false,
  price_online NUMERIC(10,2),
  price_presential NUMERIC(10,2),
  reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_interval_minutes INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_catalog_select" ON public.profiles
  FOR SELECT USING (catalog_visible = true);
CREATE POLICY "profiles_owner_select" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_owner_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_owner_update" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger: cria profile ao signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, name, specialty, city, state,
    registration_type, registration_number,
    accepts_online, accepts_presential
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'specialty', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'state', ''),
    COALESCE(NEW.raw_user_meta_data->>'registration_type', ''),
    COALESCE(NEW.raw_user_meta_data->>'registration_number', ''),
    COALESCE((NEW.raw_user_meta_data->>'accepts_online')::boolean, true),
    COALESCE((NEW.raw_user_meta_data->>'accepts_presential')::boolean, false)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- PATIENT TAGS
-- =========================================================
CREATE TABLE public.patient_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, name)
);
ALTER TABLE public.patient_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_owner_all" ON public.patient_tags
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER patient_tags_updated_at BEFORE UPDATE ON public.patient_tags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- PATIENTS
-- =========================================================
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT,
  notes TEXT,
  status public.patient_status NOT NULL DEFAULT 'ativo',
  is_minor BOOLEAN NOT NULL DEFAULT false,
  guardian_name TEXT,
  guardian_email TEXT,
  guardian_phone TEXT,
  avatar_url TEXT,
  last_session TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX patients_owner_idx ON public.patients(owner_id);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patients_owner_all" ON public.patients
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- PATIENT_TAG_ASSIGNMENTS
-- =========================================================
CREATE TABLE public.patient_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.patient_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (patient_id, tag_id)
);
CREATE INDEX pta_owner_idx ON public.patient_tag_assignments(owner_id);
ALTER TABLE public.patient_tag_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pta_owner_all" ON public.patient_tag_assignments
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- =========================================================
-- SESSIONS
-- =========================================================
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  date_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 50,
  status public.session_status NOT NULL DEFAULT 'scheduled',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  value NUMERIC(10,2) NOT NULL DEFAULT 0,
  modality public.modality NOT NULL DEFAULT 'presencial',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX sessions_owner_idx ON public.sessions(owner_id);
CREATE INDEX sessions_patient_idx ON public.sessions(patient_id);
CREATE INDEX sessions_datetime_idx ON public.sessions(owner_id, date_time);
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_owner_all" ON public.sessions
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- TASKS
-- =========================================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  status public.task_status NOT NULL DEFAULT 'a_fazer',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX tasks_owner_idx ON public.tasks(owner_id);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_owner_all" ON public.tasks
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- ANNOTATIONS
-- =========================================================
CREATE TABLE public.annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX annotations_owner_idx ON public.annotations(owner_id);
CREATE INDEX annotations_patient_idx ON public.annotations(patient_id);
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "annotations_owner_all" ON public.annotations
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER annotations_updated_at BEFORE UPDATE ON public.annotations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- SESSION TEMPLATES
-- =========================================================
CREATE TABLE public.session_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  approach TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.session_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_owner_all" ON public.session_templates
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER session_templates_updated_at BEFORE UPDATE ON public.session_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- BOOKINGS (do catálogo público)
-- =========================================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT,
  for_self BOOLEAN NOT NULL DEFAULT true,
  is_first_consultation BOOLEAN NOT NULL DEFAULT true,
  date_time TIMESTAMPTZ NOT NULL,
  modality public.modality NOT NULL DEFAULT 'online',
  price NUMERIC(10,2),
  comment TEXT,
  status public.booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX bookings_professional_idx ON public.bookings(professional_id);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa (anon ou logada) pode criar pedido de agendamento
CREATE POLICY "bookings_public_insert" ON public.bookings
  FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Apenas o profissional dono lê
CREATE POLICY "bookings_owner_select" ON public.bookings
  FOR SELECT TO authenticated USING (auth.uid() = professional_id);
CREATE POLICY "bookings_owner_update" ON public.bookings
  FOR UPDATE TO authenticated USING (auth.uid() = professional_id) WITH CHECK (auth.uid() = professional_id);
CREATE POLICY "bookings_owner_delete" ON public.bookings
  FOR DELETE TO authenticated USING (auth.uid() = professional_id);

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
