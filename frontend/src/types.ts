export interface VoteOption {
  id: string;
  label: string;
  description: string;
  color: 'blue' | 'cyan';
  iconName: string;
}

export type ViewState = 'vote' | 'dashboard';

export interface VoteHistoryItem {
  id: string;
  optionLabel: string;
  timestamp: string;
  isoTimestamp: string;
  optionColor: string;
}