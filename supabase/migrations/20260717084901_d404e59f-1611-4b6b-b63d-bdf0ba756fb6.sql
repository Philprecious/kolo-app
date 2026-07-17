
-- =================== ENUMS ===================
CREATE TYPE public.circle_role AS ENUM ('admin','member');
CREATE TYPE public.circle_frequency AS ENUM ('Weekly','Monthly','Custom');
CREATE TYPE public.circle_rotation AS ENUM ('Random','Manual','Fixed Order');
CREATE TYPE public.member_status AS ENUM ('paid','pending','overdue');
CREATE TYPE public.payment_status AS ENUM ('upcoming','paid','missed');
CREATE TYPE public.activity_type AS ENUM ('contribution','joined','payout','reminder','overdue','created','invitation','notified');

-- =================== PROFILES ===================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  phone text,
  avatar_url text,
  virtual_account_number text NOT NULL DEFAULT '',
  virtual_account_name text NOT NULL DEFAULT '',
  notify_email boolean NOT NULL DEFAULT true,
  notify_push boolean NOT NULL DEFAULT true,
  notify_reminders boolean NOT NULL DEFAULT true,
  pin_hash text,
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- =================== CIRCLES ===================
CREATE TABLE public.circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  contribution_amount integer NOT NULL,
  frequency public.circle_frequency NOT NULL DEFAULT 'Weekly',
  max_members integer NOT NULL DEFAULT 10,
  rotation public.circle_rotation NOT NULL DEFAULT 'Fixed Order',
  total_cycles integer NOT NULL DEFAULT 10,
  current_cycle integer NOT NULL DEFAULT 1,
  next_due text NOT NULL DEFAULT 'In 7 days',
  next_payout_member text NOT NULL DEFAULT 'You',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.circles TO authenticated;
GRANT ALL ON public.circles TO service_role;
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;

-- =================== CIRCLE MEMBERS ===================
CREATE TABLE public.circle_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  initials text NOT NULL,
  position integer NOT NULL,
  role public.circle_role NOT NULL DEFAULT 'member',
  status public.member_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (circle_id, position)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.circle_members TO authenticated;
GRANT ALL ON public.circle_members TO service_role;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;

-- =================== HELPER FUNCTIONS (security definer) ===================
CREATE OR REPLACE FUNCTION public.is_circle_member(_circle_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = _circle_id AND user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_circle_admin(_circle_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = _circle_id AND user_id = _user_id AND role = 'admin');
$$;

-- policies now that helpers exist
CREATE POLICY "circles visible to members" ON public.circles FOR SELECT TO authenticated
  USING (public.is_circle_member(id, auth.uid()));
CREATE POLICY "circles insert by creator" ON public.circles FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "circles updatable by admin" ON public.circles FOR UPDATE TO authenticated
  USING (public.is_circle_admin(id, auth.uid())) WITH CHECK (public.is_circle_admin(id, auth.uid()));
CREATE POLICY "circles deletable by admin" ON public.circles FOR DELETE TO authenticated
  USING (public.is_circle_admin(id, auth.uid()));

CREATE POLICY "members visible in own circles" ON public.circle_members FOR SELECT TO authenticated
  USING (public.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "members insert self on join" ON public.circle_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_circle_admin(circle_id, auth.uid()));
CREATE POLICY "members admin updates" ON public.circle_members FOR UPDATE TO authenticated
  USING (public.is_circle_admin(circle_id, auth.uid()) OR user_id = auth.uid())
  WITH CHECK (public.is_circle_admin(circle_id, auth.uid()) OR user_id = auth.uid());
CREATE POLICY "members admin deletes" ON public.circle_members FOR DELETE TO authenticated
  USING (public.is_circle_admin(circle_id, auth.uid()) OR user_id = auth.uid());

-- =================== PAYMENTS ===================
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.circle_members(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  due text NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'upcoming',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments visible in own circles" ON public.payments FOR SELECT TO authenticated
  USING (public.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "payments insert by admin" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (public.is_circle_admin(circle_id, auth.uid()));
CREATE POLICY "payments update self or admin" ON public.payments FOR UPDATE TO authenticated
  USING (public.is_circle_admin(circle_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.circle_members m WHERE m.id = member_id AND m.user_id = auth.uid()))
  WITH CHECK (public.is_circle_admin(circle_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.circle_members m WHERE m.id = member_id AND m.user_id = auth.uid()));

-- =================== ACTIVITY ===================
CREATE TABLE public.activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type public.activity_type NOT NULL,
  title text NOT NULL,
  meta text NOT NULL DEFAULT '',
  invite jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity TO authenticated;
GRANT ALL ON public.activity TO service_role;
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity visible to self or circle members" ON public.activity FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (circle_id IS NOT NULL AND public.is_circle_member(circle_id, auth.uid())));
CREATE POLICY "activity insert self" ON public.activity FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "activity update own" ON public.activity FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =================== NOTIFICATIONS ===================
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circle_id uuid REFERENCES public.circles(id) ON DELETE SET NULL,
  kind text NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications own read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications own update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =================== INVITATIONS ===================
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz,
  used_at timestamptz,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invitations visible to admin" ON public.invitations FOR SELECT TO authenticated
  USING (public.is_circle_admin(circle_id, auth.uid()));
CREATE POLICY "invitations insert by admin" ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (public.is_circle_admin(circle_id, auth.uid()));

-- =================== TRIGGERS: profile + demo seed on signup ===================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _name text;
  _initials text;
  _acct text;
  _circle_id uuid;
  _member_a uuid;
  _member_b uuid;
  _self_member uuid;
BEGIN
  _name := COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1));
  _initials := upper(substring(_name from 1 for 2));
  _acct := lpad((floor(random()*9000000000)+1000000000)::bigint::text, 10, '0');

  INSERT INTO public.profiles (id, display_name, virtual_account_number, virtual_account_name)
  VALUES (NEW.id, _name, _acct, upper(_name) || ' / KOLO');

  -- seed a demo circle so the app is never empty
  INSERT INTO public.circles (name, description, contribution_amount, frequency, max_members, rotation, total_cycles, current_cycle, next_due, next_payout_member, created_by)
  VALUES ('Bodija Women Ajo', 'Weekly market Ajo for the Bodija women''s cooperative.',
          10000, 'Weekly', 3, 'Fixed Order', 3, 1, 'Tomorrow', _name, NEW.id)
  RETURNING id INTO _circle_id;

  INSERT INTO public.circle_members (circle_id, user_id, name, initials, position, role, status)
  VALUES (_circle_id, NEW.id, _name || ' (You)', _initials, 1, 'admin', 'paid')
  RETURNING id INTO _self_member;

  INSERT INTO public.circle_members (circle_id, user_id, name, initials, position, role, status)
  VALUES (_circle_id, NULL, 'Aisha Bello', 'AB', 2, 'member', 'paid')
  RETURNING id INTO _member_a;

  INSERT INTO public.circle_members (circle_id, user_id, name, initials, position, role, status)
  VALUES (_circle_id, NULL, 'Tunde Bakare', 'TB', 3, 'member', 'pending')
  RETURNING id INTO _member_b;

  INSERT INTO public.payments (circle_id, member_id, amount, due, status) VALUES
    (_circle_id, _self_member, 10000, 'Tomorrow', 'upcoming'),
    (_circle_id, _member_b, 10000, 'Tomorrow', 'upcoming');

  INSERT INTO public.activity (circle_id, user_id, type, title, meta) VALUES
    (_circle_id, NEW.id, 'created', 'You created Bodija Women Ajo', 'Weekly · 3 members');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
