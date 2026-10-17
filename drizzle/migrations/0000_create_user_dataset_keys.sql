CREATE TABLE public.user_dataset_keys (
  user_id uuid PRIMARY KEY,
  key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.user_dataset_keys TO authenticated;
GRANT ALL ON public.user_dataset_keys TO service_role;

ALTER TABLE public.user_dataset_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own dataset key"
ON public.user_dataset_keys
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);