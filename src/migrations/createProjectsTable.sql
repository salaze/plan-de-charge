
-- Vérifier si la table projets existe et la créer si nécessaire
CREATE TABLE IF NOT EXISTS public.projets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ajouter un index sur le code du projet
CREATE INDEX IF NOT EXISTS idx_projets_code ON public.projets (code);

-- Activer la sécurité par ligne
ALTER TABLE public.projets ENABLE ROW LEVEL SECURITY;

-- Policy par défaut qui permet à tous les utilisateurs authentifiés de voir tous les projets
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read all projects" 
  ON public.projets 
  FOR SELECT 
  USING (auth.role() = 'authenticated');
