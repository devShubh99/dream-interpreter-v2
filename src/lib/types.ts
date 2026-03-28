export interface DreamSymbol {
  symbol: string;
  meaning: string;
}

export interface DreamInterpretation {
  mainThemes: string[];
  emotionalTone: string;
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
  deleted_at?: string;
  created_at: string;
}
