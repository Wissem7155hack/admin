export type View =
  | 'agency'
  | 'merchant'
  | 'whitelabel'
  | 'settings'
  | 'clients'
  | 'shop'
  | 'memberships'
  | 'appbuilder'
  | 'user_settings';

export type AppBuilderTab =
  | 'Custom plans'
  | 'Offers'
  | 'Products'
  | 'Membership'
  | 'Rewards'
  | 'Settings';

export interface Merchant {
  id: string;
  name: string;
  clients: number;
  clientsCount?: number;
  active: boolean;
  status: 'to-verify' | 'info-required' | 'verified' | 'active' | 'inactive';
  verified?: boolean;
  color: string;
  brandColor?: string;
  language?: string;
  initials: string;
  logoUrl?: string;
  websiteUrl?: string;
  treatmentListUrl?: string;
  description?: string;
  currency?: string;
  timezone?: string;
  country?: string;
  address?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  ownerName?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpend: number;
  visits: number;
  lastVisit: string;
  status: 'active' | 'inactive' | 'vip';
  avatar?: string;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  akaName?: string;
  jobTitle: string;
  biography?: string;
  avatarUrl?: string;
  mrr?: number;
  sales?: number;
}

export interface CustomPlan {
  id: string;
  name: string;
  clientName: string;
  status: 'Available' | 'Purchased' | 'Removed';
  price: number;
  createdAt: string;
  expiresAt?: string;
  treatmentsCount: number;
}

export interface OneTimeOffer {
  id: string;
  visibility: 'Public' | 'Private';
  startDate: string;
  expiresInDays: number;
  headline: string;
  message: string;
  bannerBgColor: string;
  discountMode: 'Percentage' | 'Set $ amount';
  discountValue: number;
  targetMode: 'Includes' | 'Excludes';
  targetProducts: string[];
}

export interface AutomatedOffer {
  id: string;
  occasion: string;
  subtitle: string;
  dateWindow: string;
  bannerImage: string;
  bannerTitle: string;
  active: boolean;
  discountMode: 'Percentage' | 'Set $ amount';
  discountValue: number;
  includeRecentCart: boolean;
  includeSimilarBrowse: boolean;
  targetMode: 'Includes' | 'Excludes';
  targetProducts: string[];
  voiceNoteBoost?: boolean;
}

export interface Product {
  id: string;
  name: string;
  durationMinutes?: number;
  description?: string;
  schedulingUrl?: string;
  tags: string[];
  serviceUnitType: string;
  pricingModel: 'Individually' | 'In Bundles' | 'In Variations';
  price?: number;
  maxQuantity?: number;
  bundles?: { quantity: number; price: number }[];
  variations?: { name: string; price: number }[];
  imageUrl?: string;
  practitioner?: string;
  beforeInstructions?: string;
  afterInstructions?: string;
  consultationWarning: boolean;
  cashBalanceExclusion: boolean;
  hideFromShop: boolean;
  clientResults?: { photoUrl?: string; testimonial: string }[];
}

export interface SignupBonus {
  id: string;
  description: string;
  availability: 'In-app' | 'In-Office';
  discountType: 'Percentage' | 'Set $ amount' | 'Free service';
  value: number;
  productMode: 'Includes' | 'Excludes';
  products: string[];
}

export interface MembershipRecord {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  commitmentEnabled: boolean;
  commitmentMonths: number;
  benefits: string[];
  bonuses: SignupBonus[];
  hideFromShop?: boolean;
}

export interface RewardPointsConfig {
  signUpReward: number;
  referralReward: number;
  googleReviewReward: number;
  checkInReward: number;
  purchaseRewardPerDollar: number;
}

export interface EducationArticle {
  id: string;
  coverUrl: string;
  headline: string;
  description: string;
  link: string;
  publishedAt: string;
}
