// Shared types for Sensory.
// Schemas mirror master plan §9 (MongoDB collections).

export type SensoryDimensions = {
  noise: number;
  lighting: number;
  crowd: number;
  smell: number;
  exits: number;
  composite: number;
};

export type WheelchairTag = "yes" | "limited" | "no" | null;

export type Venue = {
  _id: string;
  google_place_id: string;
  name: string;
  category: string;
  address: string;
  location: { type: "Point"; coordinates: [number, number] };
  sensory: SensoryDimensions;
  summary: string;
  osm_tags: { wheelchair: WheelchairTag; kerb: string | null };
  hours_temporal?: Record<string, number>;
  updated_at: string;
};

export type Review = {
  _id: string;
  venue_id: string;
  contributor_anon_id: string;
  text: string;
  sensory_tags: {
    noise: number | null;
    lighting: number | null;
    crowd: number | null;
  };
  timestamp: string;
};

export type NoiseSample = {
  venue_id: string;
  timestamp: string;
  metadata: { venue_id: string; contributor_anon_id: string };
  db_level: number;
};

export type Alert = {
  _id: string;
  title: string;
  description: string;
  geo_bounds: { type: "Polygon"; coordinates: number[][][] };
  start: string;
  end: string;
  severity: "low" | "moderate" | "high";
  affected_dimensions: ("noise" | "crowd" | "lighting")[];
};

export type AccessibilityNeed =
  | "noise"
  | "light"
  | "wheelchair"
  | "deaf"
  | "blind"
  | "esl";

export type Language = "en" | "es" | "zh";

export type UserProfile = {
  _id: string;
  supabase_id: string;
  profile: { needs: AccessibilityNeed[]; language: Language };
  voice_clone: { elevenlabs_voice_id: string; created_at: string } | null;
  created_at: string;
};

export type Bounds = {
  lng1: number;
  lat1: number;
  lng2: number;
  lat2: number;
};
