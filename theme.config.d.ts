export type ThemeColorName =
  | 'primary'
  | 'background'
  | 'surface'
  | 'foreground'
  | 'muted'
  | 'border'
  | 'success'
  | 'warning'
  | 'error'
  | 'accent'
  | 'rpmLow'
  | 'rpmMid'
  | 'rpmHigh'
  | 'tempCold'
  | 'tempNormal'
  | 'tempHot';

export type ThemeColorSwatch = {
  light: string;
  dark: string;
};

export type ThemeColors = Record<ThemeColorName, ThemeColorSwatch>;

declare const themeColors: ThemeColors;

export { themeColors };
