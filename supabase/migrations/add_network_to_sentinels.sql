-- ============================================
-- ADD NETWORK FIELD TO SENTINELS TABLE
-- ============================================
-- This migration adds a network field to track which Solana
-- network (devnet/mainnet) each sentinel was created for.
-- This prevents devnet sentinels from trying to operate on mainnet.
-- ============================================

-- Add network column to sentinels table
ALTER TABLE public.sentinels 
ADD COLUMN IF NOT EXISTS network TEXT NOT NULL DEFAULT 'devnet' 
CHECK (network IN ('devnet', 'mainnet'));

-- Add index for faster network-based queries
CREATE INDEX IF NOT EXISTS sentinels_network_idx ON public.sentinels(network);

-- Add composite index for user + network queries
CREATE INDEX IF NOT EXISTS sentinels_user_network_idx ON public.sentinels(user_id, network);

-- Add composite index for user + network + active status
CREATE INDEX IF NOT EXISTS sentinels_user_network_active_idx ON public.sentinels(user_id, network, is_active);

-- Add comment to document the field
COMMENT ON COLUMN public.sentinels.network IS 'Solana network this sentinel was created for (devnet/mainnet). Sentinels cannot operate across networks.';

-- Log migration success
DO $$ 
BEGIN 
  RAISE NOTICE 'Successfully added network field to sentinels table';
END $$;

