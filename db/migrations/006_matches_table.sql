CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cv_id UUID NOT NULL REFERENCES public.cvs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_text TEXT NOT NULL,
    result_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select their own matches" 
ON public.matches 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own matches" 
ON public.matches 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT ON public.matches TO authenticated;
GRANT SELECT ON public.matches TO service_role;

CREATE INDEX IF NOT EXISTS matches_cv_id_idx ON public.matches(cv_id);
CREATE INDEX IF NOT EXISTS matches_user_id_created_at_desc_idx ON public.matches(user_id, created_at DESC);