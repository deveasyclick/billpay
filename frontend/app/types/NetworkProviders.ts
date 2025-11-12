export const networkProviders = ['mtn', 'airtel', 'glo', '9mobile'] as const;
export type NetworkProviders = (typeof networkProviders)[number];
