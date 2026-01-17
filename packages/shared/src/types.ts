// User types
export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'premium' | 'enterprise';
  created_at: string;
  updated_at: string;
}

// Hair style types
export interface HairStyle {
  id: string;
  name: string;
  description?: string;
  category: HairCategory;
  color_base?: string;
  thumbnail_url?: string;
  texture_url?: string;
  model_url?: string;
  tags: string[];
  is_premium: boolean;
  created_at: string;
}

export type HairCategory =
  | 'short'
  | 'medium'
  | 'long'
  | 'curly'
  | 'straight'
  | 'wavy'
  | 'braids'
  | 'updos'
  | 'bangs'
  | 'pixie'
  | 'bob'
  | 'layers';

// Nail style types
export interface NailStyle {
  id: string;
  name: string;
  description?: string;
  category: NailCategory;
  color_code?: string;
  pattern_url?: string;
  thumbnail_url?: string;
  tags: string[];
  is_premium: boolean;
  created_at: string;
}

export type NailCategory =
  | 'solid'
  | 'french'
  | 'glitter'
  | 'ombre'
  | 'marble'
  | 'geometric'
  | 'floral'
  | 'abstract'
  | 'seasonal'
  | 'custom';

// Try-on types
export interface TryOn {
  id: string;
  user_id: string;
  type: 'hair' | 'nails';
  style_id?: string;
  original_image_url?: string;
  result_image_url?: string;
  settings: TryOnSettings;
  is_favorite: boolean;
  created_at: string;
}

export interface TryOnSettings {
  opacity?: number;
  color_adjustment?: ColorAdjustment;
  blend_mode?: BlendMode;
  intensity?: number;
  custom_params?: Record<string, any>;
}

export interface ColorAdjustment {
  hue: number; // -180 to 180
  saturation: number; // 0 to 200
  lightness: number; // 0 to 200
}

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light';

// Gallery types
export interface Gallery {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  gallery_id: string;
  try_on_id: string;
  position: number;
  created_at: string;
}

// AR Camera types
export interface CameraConfig {
  facingMode: 'user' | 'environment';
  width: number;
  height: number;
  frameRate: number;
}

export interface FaceDetectionResult {
  detected: boolean;
  landmarks?: FaceLandmark[];
  boundingBox?: BoundingBox;
  confidence: number;
}

export interface FaceLandmark {
  x: number;
  y: number;
  z?: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HandDetectionResult {
  detected: boolean;
  hands: Hand[];
}

export interface Hand {
  landmarks: HandLandmark[];
  handedness: 'left' | 'right';
  confidence: number;
}

export interface HandLandmark {
  x: number;
  y: number;
  z?: number;
}

// Analytics types
export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  event_type: AnalyticsEventType;
  event_data: Record<string, any>;
  created_at: string;
}

export type AnalyticsEventType =
  | 'page_view'
  | 'try_on_started'
  | 'try_on_completed'
  | 'style_selected'
  | 'image_saved'
  | 'image_shared'
  | 'style_favorited'
  | 'subscription_upgraded'
  | 'error_occurred';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Export all
export * from './types';
