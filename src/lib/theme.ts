import { ThemeConfig, theme } from 'antd';

/**
 * Centralized Design Tokens for Warehouse Platform
 * Professional Industrial & Logistics Theme
 */
export const WAREHOUSE_COLORS = {
  primary: '#2563eb', // Blue 600
  primaryHover: '#3b82f6', // Blue 500
  primaryDark: '#1d4ed8', // Blue 700

  bg: '#0b0f19', // Deep dark slate
  surface: '#111827', // Slate 900
  card: '#1e293b', // Slate 800
  cardHover: '#334155', // Slate 700

  border: '#334155',
  borderSubtle: '#1e293b',

  text: '#f8fafc',
  textMuted: '#94a3b8',
  textDim: '#64748b',

  amber: '#f59e0b', // Low-stock warning
  amberLight: 'rgba(245, 158, 11, 0.15)',
  emerald: '#10b981', // Success
  rose: '#ef4444', // Danger/Out of stock
} as const;

// Legacy alias to avoid breaking any old imports
export const SUSHICOLORS = WAREHOUSE_COLORS;

/**
 * Centralized Typography Scale & Fonts Tokens
 */
export const WAREHOUSE_TYPO = {
  fontFamily: 'var(--font-sans)',
  fontFamilyMono: 'var(--font-mono)',
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
} as const;

export const SUSHITYPO = WAREHOUSE_TYPO;

/**
 * Ant Design ConfigProvider Theme
 */
export const antdThemeConfig: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: WAREHOUSE_COLORS.primary,
    controlItemBgActive: 'rgba(37, 99, 235, 0.2)',
    controlItemBgHover: WAREHOUSE_COLORS.cardHover,
    colorBgBase: WAREHOUSE_COLORS.bg,
    colorBgContainer: WAREHOUSE_COLORS.surface,
    colorBgElevated: WAREHOUSE_COLORS.card,
    colorBorder: WAREHOUSE_COLORS.border,
    colorBorderSecondary: WAREHOUSE_COLORS.borderSubtle,
    colorText: WAREHOUSE_COLORS.text,
    colorTextSecondary: WAREHOUSE_COLORS.textMuted,
    colorTextTertiary: WAREHOUSE_COLORS.textDim,
    colorTextPlaceholder: WAREHOUSE_COLORS.textDim,
    borderRadius: 8,
    fontFamily: WAREHOUSE_TYPO.fontFamily,
    fontSize: WAREHOUSE_TYPO.fontSize.sm,
  },
  components: {
    Card: {
      colorBgContainer: WAREHOUSE_COLORS.card,
      colorBorderSecondary: WAREHOUSE_COLORS.border,
    },
    Table: {
      colorBgContainer: WAREHOUSE_COLORS.card,
      borderColor: WAREHOUSE_COLORS.border,
      headerBg: WAREHOUSE_COLORS.surface,
      headerColor: WAREHOUSE_COLORS.textMuted,
      fontSize: WAREHOUSE_TYPO.fontSize.sm,
    },
    Input: {
      colorBgContainer: WAREHOUSE_COLORS.surface,
      colorBorder: WAREHOUSE_COLORS.border,
      colorTextPlaceholder: '#64748b',
      activeBorderColor: WAREHOUSE_COLORS.primary,
      hoverBorderColor: WAREHOUSE_COLORS.primaryHover,
      fontSize: WAREHOUSE_TYPO.fontSize.sm,
    },
    Select: {
      colorBgContainer: WAREHOUSE_COLORS.surface,
      colorBgElevated: WAREHOUSE_COLORS.card,
      colorBorder: WAREHOUSE_COLORS.border,
      colorText: WAREHOUSE_COLORS.text,
      colorTextPlaceholder: '#64748b',
      optionSelectedBg: 'rgba(37, 99, 235, 0.2)',
      optionSelectedColor: '#ffffff',
      optionActiveBg: WAREHOUSE_COLORS.cardHover,
      activeBorderColor: WAREHOUSE_COLORS.primary,
      hoverBorderColor: WAREHOUSE_COLORS.primaryHover,
      borderRadius: 8,
      fontSize: WAREHOUSE_TYPO.fontSize.sm,
    },
    Button: {
      colorPrimary: WAREHOUSE_COLORS.primary,
      colorPrimaryHover: WAREHOUSE_COLORS.primaryHover,
      colorPrimaryActive: WAREHOUSE_COLORS.primaryDark,
      fontSize: WAREHOUSE_TYPO.fontSize.sm,
    },
    Menu: {
      itemBg: 'transparent',
      itemColor: WAREHOUSE_COLORS.textMuted,
      itemHoverBg: WAREHOUSE_COLORS.cardHover,
      itemHoverColor: WAREHOUSE_COLORS.text,
      itemSelectedBg: 'rgba(37, 99, 235, 0.2)',
      itemSelectedColor: '#ffffff',
      itemBorderRadius: 6,
      itemMarginInline: 8,
      itemMarginBlock: 4,
      iconSize: 18,
      subMenuItemBg: WAREHOUSE_COLORS.surface,
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(37, 99, 235, 0.2)',
      darkItemSelectedColor: '#ffffff',
      darkItemHoverBg: WAREHOUSE_COLORS.cardHover,
      darkItemColor: WAREHOUSE_COLORS.textMuted,
      darkItemHoverColor: WAREHOUSE_COLORS.text,
      darkSubMenuItemBg: WAREHOUSE_COLORS.surface,
    },
    Layout: {
      siderBg: WAREHOUSE_COLORS.surface,
      headerBg: WAREHOUSE_COLORS.surface,
      bodyBg: WAREHOUSE_COLORS.bg,
      triggerBg: WAREHOUSE_COLORS.surface,
      triggerColor: WAREHOUSE_COLORS.textMuted,
    },
    Dropdown: {
      colorBgElevated: WAREHOUSE_COLORS.card,
      colorText: WAREHOUSE_COLORS.text,
      colorTextDescription: WAREHOUSE_COLORS.textDim,
      colorSplit: WAREHOUSE_COLORS.border,
      paddingBlock: 6,
    },
  },
};
