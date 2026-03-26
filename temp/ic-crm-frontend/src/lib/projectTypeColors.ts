const TOKEN_COLOR_MAP: Record<string, string> = {
  default: '#615dff',
  green: '#39b69a',
  red: '#fc4b6c',
  azure: '#1a97f5',
  warning: '#fdd43f',
};

export const isHexColor = (value?: string | null) =>
  Boolean(value && /^#[0-9a-f]{6}$/i.test(String(value).trim()));

export const resolveUiColor = (value?: string | null) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (isHexColor(normalized)) {
    return normalized;
  }

  return TOKEN_COLOR_MAP[normalized] || TOKEN_COLOR_MAP.default;
};

export const hexToRgba = (value: string, alpha: number) => {
  const color = resolveUiColor(value).slice(1);
  const red = Number.parseInt(color.slice(0, 2), 16);
  const green = Number.parseInt(color.slice(2, 4), 16);
  const blue = Number.parseInt(color.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const getReadableTextColor = (value: string) => {
  const color = resolveUiColor(value).slice(1);
  const red = Number.parseInt(color.slice(0, 2), 16);
  const green = Number.parseInt(color.slice(2, 4), 16);
  const blue = Number.parseInt(color.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.62 ? '#111827' : '#ffffff';
};
