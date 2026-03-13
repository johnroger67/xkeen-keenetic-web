type AppConfig = {
  title: string;
};

const xkeenConfig: AppConfig = {
  title: 'XKEEN',
} as const;

export const useConfig = (): AppConfig => {
  return xkeenConfig;
};
