export interface registerType {
  title?: string;
  subtitle?: any | any[];
  subtext?: any | any[];
}

export interface loginType {
  title?: string;
  subtitle?: any | any[];
  subtext?: any | any[];
}

export interface signInType {
  title?: string;
  onGoogleClick?: () => void;
  onFacebookClick?: () => void;
  disabled?: boolean;
}
