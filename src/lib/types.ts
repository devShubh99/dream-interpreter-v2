export interface DreamSymbol {
  symbol: string;
  meaning: string;
}

export interface DreamInterpretation {
  mainThemes: string[];
  emotionalTone: string;
  sentimentScore: number;
  symbols: DreamSymbol[];
  personalInsight: string;
  guidance: string;
  userName?: string;
  userGender?: string;
}

export interface Dream {
  id: string;
  user_id: string;
  user_email: string | null;
  dream_text: string;
  interpretation: DreamInterpretation | null;
  is_shared: boolean;
  share_id: string;
  sentiment_score?: number | null;
  main_themes?: string[] | null;
  deleted_at?: string;
  created_at: string;
  archived_at?: string;
}
