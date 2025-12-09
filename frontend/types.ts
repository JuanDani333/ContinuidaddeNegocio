
export interface ChartDataPoint {
  scene: string;      // Short label for the axis (visual)
  value: number;      // Calculated PX (0-100) for the chart axis
  fullMark: number;
  fullLabel?: string; // Full descriptive text
  attempt?: number;   // NEW: Direct attempt count for tooltips
  time?: number;      // NEW: Time taken in seconds
}

export interface SceneScore {
  sceneId: string;    // ID from API (e.g., 'ecc_1')
  scene: string;      // Short label (derived for UI)
  attempt: number;    // NEW: The raw input from API (1, 2, 3...)
  value: number;      // Derived score (100, 80...) based on attempt
  time?: number;      // NEW: Time taken in seconds
}

export interface UserAssessment {
  id: string;   // Unique Identifier
  name: string; // Full Name
  scores: SceneScore[];
}

export interface SceneDefinition {
  id: string;
  short: string;
  full: string;
}

export interface AreaData {
  id: string;
  title: string;
  scenes: SceneDefinition[]; // Configuration of axes for this specific area
  assessments: UserAssessment[];
}

export interface UserSession {
  username: string;
  token: string;
  role: 'admin';
  display_name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserSession | null;
}
