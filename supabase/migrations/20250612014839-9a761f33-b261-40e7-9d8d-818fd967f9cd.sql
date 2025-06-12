
-- Drop existing update/delete policies if they exist
DROP POLICY IF EXISTS "Users can update their own announcements" ON public.announcements;
DROP POLICY IF EXISTS "Users can delete their own announcements" ON public.announcements;

-- Add due_date column to announcements table (if it doesn't exist)
ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Add policies for updating and deleting announcements
CREATE POLICY "Users can update their own announcements" 
  ON public.announcements 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own announcements" 
  ON public.announcements 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- Create a function to automatically delete expired announcements
CREATE OR REPLACE FUNCTION delete_expired_announcements()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.announcements 
  WHERE due_date IS NOT NULL 
    AND due_date < NOW();
END;
$$;
