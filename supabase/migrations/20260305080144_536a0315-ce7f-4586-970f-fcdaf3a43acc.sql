-- Create lead_status enum
CREATE TYPE public.lead_status AS ENUM ('new', 'in_progress', 'client', 'rejected');

-- Create payout_status enum
CREATE TYPE public.payout_status AS ENUM ('pending', 'paid', 'cancelled');

-- Create partners table
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  telegram_id BIGINT NOT NULL UNIQUE,
  username TEXT,
  ref_code TEXT NOT NULL UNIQUE,
  traffic_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clicks table
CREATE TABLE public.clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ref_code TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip TEXT
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ref_code TEXT NOT NULL,
  name TEXT,
  telegram TEXT,
  contact TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payouts table
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  status payout_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_clicks_ref_code ON public.clicks(ref_code);
CREATE INDEX idx_leads_ref_code ON public.leads(ref_code);
CREATE INDEX idx_payouts_partner_id ON public.payouts(partner_id);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Partners: authenticated admins can read, service_role full access
CREATE POLICY "Allow authenticated read partners" ON public.partners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service role full access partners" ON public.partners FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Clicks: anon can insert (website tracking), authenticated can read
CREATE POLICY "Allow authenticated read clicks" ON public.clicks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service role full access clicks" ON public.clicks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon insert clicks" ON public.clicks FOR INSERT TO anon WITH CHECK (true);

-- Leads: anon can insert (website forms), authenticated can read/update
CREATE POLICY "Allow authenticated read leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update leads" ON public.leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access leads" ON public.leads FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon insert leads" ON public.leads FOR INSERT TO anon WITH CHECK (true);

-- Payouts: authenticated full access, service_role full access
CREATE POLICY "Allow authenticated all payouts" ON public.payouts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access payouts" ON public.payouts FOR ALL TO service_role USING (true) WITH CHECK (true);