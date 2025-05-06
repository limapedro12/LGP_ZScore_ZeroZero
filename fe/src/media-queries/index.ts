export const BREAKPOINTS = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400,
    placard1: 1600,
    placard2: 2000,
    placard3: 2400,
    placard4: 2800,
};

export const MEDIA_QUERIES = {
    xs: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
    sm: `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
    md: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
    lg: `(min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl - 1}px)`,
    xl: `(min-width: ${BREAKPOINTS.xl}px) and (max-width: ${BREAKPOINTS.xxl - 1}px)`,
    xxl: `(min-width: ${BREAKPOINTS.xxl}px) and (max-width: ${BREAKPOINTS.placard1 - 1}px)`,
    placard1: `(min-width: ${BREAKPOINTS.placard1}px) and (max-width: ${BREAKPOINTS.placard2 - 1}px)`,
    placard2: `(min-width: ${BREAKPOINTS.placard2}px) and (max-width: ${BREAKPOINTS.placard3 - 1}px)`,
    placard3: `(min-width: ${BREAKPOINTS.placard3}px) and (max-width: ${BREAKPOINTS.placard4 - 1}px)`,
    placard4: `(min-width: ${BREAKPOINTS.placard4}px)`,
    xsSm: `(max-width: ${BREAKPOINTS.md - 1}px)`,
};

export type BreakpointKey = keyof typeof BREAKPOINTS;
