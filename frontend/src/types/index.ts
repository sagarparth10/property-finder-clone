export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'rent' | 'sale';
  location: string;
  lat: number;
  lng: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  furnished: boolean;
  verified: boolean;
  images: string[];
  amenities: string[];
  agent: Agent;
  developer?: Developer;
  availability: 'available' | 'pending' | 'sold' | 'rented';
  createdAt: string;
  floorPlan?: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  avatar: string;
  specialization?: string;
  experience?: string;
  listings?: number;
  successRate?: number;
  rating?: number;
  totalSales?: number;
  languages?: string[];
}

export interface Developer {
  name: string;
  verified: boolean;
  logo?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'agent' | 'broker' | 'lawyer' | 'mortgage' | 'admin';
  avatar?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  savedProperties: string[];
  searchHistory: string[];
  notifications: boolean;
  language: string;
}

export interface PriceTrend {
  month: string;
  average: number;
}

export interface NeighborhoodInsights {
  crimeRate: string;
  schools: string;
  hospitals: string;
  malls: string;
  parks: string;
  transportation: string;
  walkability: number;
  safety: string;
}

export interface MortgageOption {
  id: string;
  bank: string;
  interestRate: number;
  type: 'fixed' | 'variable';
  duration: string;
  maxAmount: number;
  minAmount: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
}

export interface SearchFilters {
  search?: string;
  type?: 'rent' | 'sale';
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  furnished?: boolean;
  verified?: boolean;
  amenities?: string[];
}

