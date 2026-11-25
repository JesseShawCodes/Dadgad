/** Shared API and bracket domain types for Dadgad. */

export type SongArtwork = {
  url?: string;
  bgColor?: string;
  textColor1?: string;
  width?: number;
  height?: number;
};

export type SongAttributes = {
  name?: string;
  albumName?: string;
  artistName?: string;
  artwork?: SongArtwork;
  [key: string]: unknown;
};

export type Song = {
  id: string;
  type?: string;
  rank?: number;
  attributes?: SongAttributes;
};

export type SongSlot = {
  song: Song;
  groupRank?: number;
  winner?: unknown;
};

export type MatchupAttributes = {
  matchupComplete?: boolean;
  song1?: SongSlot | null;
  song2?: SongSlot | null;
  winner?: Song | null;
  loser?: Song | null;
};

export type StructuredMatchup = {
  matchupId: string;
  round?: number;
  attributes: MatchupAttributes;
};

export type RoundData = {
  progress?: number | null;
  roundMatchups?: StructuredMatchup[] | null;
};

export type GroupBracket = Record<string, Record<string, RoundData>>;

export type ChampionshipBracket = {
  round5?: RoundData;
  round6?: RoundData;
  [key: string]: RoundData | undefined;
};

export type ChampionState = {
  song?: Song;
} & Partial<Song>;

export type ArtistPagePayload = {
  artist_name?: string;
  artist_id?: string;
  featured_albums?: unknown;
  top_songs_list?: Song[];
  matchups?: unknown[];
  bracket_id?: number;
  bracket?: GroupBracket;
};

export type TaskStatusResponse = {
  status: 'PENDING' | 'QUEUED' | 'SUCCESS' | 'FAILURE' | string;
  result?: {
    results?: {
      artists?: {
        data?: Array<{
          id: string;
          attributes?: {
            name?: string;
            artwork?: SongArtwork;
          };
        }>;
      };
    };
  };
  [key: string]: unknown;
};

export type StartSearchResponse = {
  task_id: string;
};

export type SelectMatchupWinnerRequest = {
  matchupId: string;
  selectedSong: SongSlot | { song: Song };
  bracket_id?: number | string;
};

export type ApiErrorBody = {
  error?: string;
  message?: string;
};
