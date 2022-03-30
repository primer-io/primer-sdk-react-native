var redirectSchemes = [
    'primer'
] as const;

export type RedirectScheme = typeof redirectSchemes[number];
