export type IncidentStatus = 'pending' | 'verified' | 'alert_sent' | 'rejected';

export interface Incident {
  id: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  latitude: number;
  longitude: number;
  timestamp: any; // Firestore Timestamp
  status: IncidentStatus;
  confidenceScore: number;
  reportCount: number;
  type: 'fire' | 'flood' | 'accident' | 'medical' | 'other';
  description?: string;
  reporterId: string;
  reporterName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'citizen' | 'responder' | 'admin';
  createdAt: any;
}
