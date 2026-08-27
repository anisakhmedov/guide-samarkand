export type PlaceCategory = 'restaurant' | 'cafe' | 'attraction' | 'service';

export interface Place {
  _id: string;
  category: PlaceCategory;
  name: string;
  description: string;
  photos: string[];
  location: { lat: number; lng: number };
  district: string;
  workingHours: string;
  extraFields: Record<string, unknown>;
  recommendedByHotel: boolean;
}

export type RouteTheme = 'history' | 'food' | 'kids' | 'evening' | 'photo';
export type RouteDuration = 'short' | 'half_day' | 'full_day';
export type TransportType = 'walking' | 'transport';

export interface RoutePoint {
  placeId: Place | string;
  order: number;
  comment: string;
  legDistanceMeters: number;
  legDurationMinutes: number;
}

export interface GuideRoute {
  _id: string;
  title: string;
  theme?: RouteTheme;
  durationEstimate: RouteDuration;
  transportType: TransportType;
  points: RoutePoint[];
  totalDistanceMeters: number;
  totalDurationMinutes: number;
  createdBy: 'admin' | 'guest';
  published: boolean;
}

export type ChatSender = 'guest' | 'admin';

export interface ChatMessage {
  _id: string;
  guestId: string;
  sender: ChatSender;
  text: string;
  photo?: string;
  readStatus: boolean;
  timestamp: string;
}
