import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Agent {
  id: string
  email: string
  full_name: string
  agent_id: string
  level: 'VC_CONSULTANT' | 'BUSINESS_DEV' | 'STRATEGY_PARTNER' | 'GENERAL_MANAGER'
  parent_agent_id?: string
  created_at: string
  updated_at: string
}

export interface Investor {
  id: string
  email: string
  full_name: string
  nric: string
  investment_type: 'STANDARD' | 'EXCLUSIVE'
  investment_tier: 'A1' | 'A' | 'B' | 'C' | 'D' | 'E'
  investment_amount: number
  quarterly_rate: number
  yearly_rate: number
  agent_id: string
  created_at: string
  updated_at: string
}

export interface Commission {
  id: string
  agent_id: string
  investor_id: string
  commission_type: 'PASSIVE' | 'ONE_OFF' | 'HIERARCHICAL'
  percentage: number
  amount: number
  created_at: string
}

export interface InvestmentTier {
  id: string
  tier: string
  type: 'STANDARD' | 'EXCLUSIVE'
  min_amount: number
  max_amount?: number
  quarterly_rate: number
  yearly_rate: number
}

// Investment tier configurations
export const INVESTMENT_TIERS: InvestmentTier[] = [
  // Standard tiers
  { id: '1', tier: 'A1', type: 'STANDARD', min_amount: 25000, max_amount: 25000, quarterly_rate: 2.0, yearly_rate: 8.0 },
  { id: '2', tier: 'A', type: 'STANDARD', min_amount: 50000, max_amount: 50000, quarterly_rate: 3.0, yearly_rate: 12.0 },
  { id: '3', tier: 'B', type: 'STANDARD', min_amount: 100000, max_amount: 150000, quarterly_rate: 3.5, yearly_rate: 14.0 },
  { id: '4', tier: 'C', type: 'STANDARD', min_amount: 200000, max_amount: 450000, quarterly_rate: 3.6, yearly_rate: 14.5 },
  { id: '5', tier: 'D', type: 'STANDARD', min_amount: 500000, max_amount: 950000, quarterly_rate: 3.9, yearly_rate: 15.5 },
  { id: '6', tier: 'E', type: 'STANDARD', min_amount: 1000000, quarterly_rate: 4.1, yearly_rate: 16.5 },
  // Exclusive tiers
  { id: '7', tier: 'EX1', type: 'EXCLUSIVE', min_amount: 0, quarterly_rate: 2.5, yearly_rate: 11.0 },
  { id: '8', tier: 'EX2', type: 'EXCLUSIVE', min_amount: 0, quarterly_rate: 3.5, yearly_rate: 14.2 },
  { id: '9', tier: 'EX3', type: 'EXCLUSIVE', min_amount: 0, quarterly_rate: 4.0, yearly_rate: 15.5 },
  { id: '10', tier: 'EX4', type: 'EXCLUSIVE', min_amount: 0, quarterly_rate: 4.3, yearly_rate: 17.0 },
  { id: '11', tier: 'EX5', type: 'EXCLUSIVE', min_amount: 0, quarterly_rate: 5.0, yearly_rate: 19.5 },
  { id: '12', tier: 'EX6', type: 'EXCLUSIVE', min_amount: 0, quarterly_rate: 5.5, yearly_rate: 22.0 },
]

// Commission rates
export const COMMISSION_RATES = {
  PASSIVE: 2.0, // 2% for passive payments
  ONE_OFF: 10.0, // 10% one-off
  BUSINESS_DEV: 1.5, // 1.5% goes to nearest Business Dev
  STRATEGY_PARTNER: 0.8, // 0.8% goes to nearest Strategy Partner
  GENERAL_MANAGER: 0.5, // 0.5% goes to nearest General Manager
}

// Helper functions
export const getInvestmentTier = (amount: number, type: 'STANDARD' | 'EXCLUSIVE') => {
  if (type === 'EXCLUSIVE') {
    return INVESTMENT_TIERS.filter(tier => tier.type === 'EXCLUSIVE')
  }
  
  return INVESTMENT_TIERS.find(tier => 
    tier.type === 'STANDARD' && 
    amount >= tier.min_amount && 
    (tier.max_amount ? amount <= tier.max_amount : true)
  )
}

export const calculateCommission = (investmentAmount: number, rate: number) => {
  return (investmentAmount * rate) / 100
}