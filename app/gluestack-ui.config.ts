import { createConfig } from '@gluestack-style/react';
import { config as defaultConfig } from '@gluestack-ui/config';

const tokens = {
  ...defaultConfig.tokens,
  colors: {
    ...(defaultConfig.tokens?.colors ?? {}),
    primaryBG: '#000000',
    secondaryBG: '#121212',
    elevatedBG: '#1a1a1a',
    primaryText: '#FFFFFF',
    secondaryText: '#AAAAAA',
    accentPrimary: '#E03B8C',
    accentSecondary: '#6F22BC',
    accentTertiary: '#2B9AF4',
    success: '#36D47D',
    error: '#FF5E5E',
    warning: '#FFB347',
    info: '#4FB8FF',
    borderSubtle: '#1f1f1f',
    borderDefault: '#2c2c2c',
    overlayScrim: 'rgba(0, 0, 0, 0.7)',
    overlayGlow: 'rgba(224, 59, 140, 0.35)',
    backgroundDark950: '$primaryBG',
    backgroundDark900: '$secondaryBG',
    backgroundDark800: '$elevatedBG',
    textDark0: '$primaryText',
    textDark400: '$secondaryText',
  },
  fonts: {
    ...(defaultConfig.tokens?.fonts ?? {}),
    brand: 'GangOfThree',
    heading: 'FunnelDisplay',
    body: 'FunnelSans',
  },
};

const defaultComponents = defaultConfig.components as Record<string, any>;

const components = {
  ...defaultConfig.components,
  Box: {
    ...defaultComponents?.Box,
    baseStyle: {
      ...(defaultComponents?.Box?.baseStyle ?? {}),
      _dark: {
        ...(defaultComponents?.Box?.baseStyle?._dark ?? {}),
        bg: '$primaryBG',
      },
    },
  },
  Heading: {
    ...defaultComponents?.Heading,
    baseStyle: {
      ...(defaultComponents?.Heading?.baseStyle ?? {}),
      fontFamily: '$heading',
      _dark: {
        ...(defaultComponents?.Heading?.baseStyle?._dark ?? {}),
        color: '$primaryText',
      },
    },
  },
  Text: {
    ...defaultComponents?.Text,
    baseStyle: {
      ...(defaultComponents?.Text?.baseStyle ?? {}),
      fontFamily: '$body',
      _dark: {
        ...(defaultComponents?.Text?.baseStyle?._dark ?? {}),
        color: '$primaryText',
      },
    },
    variants: {
      ...(defaultComponents?.Text?.variants ?? {}),
      subtitle: {
        ...defaultComponents?.Text?.variants?.subtitle,
        _dark: {
          ...(defaultComponents?.Text?.variants?.subtitle?._dark ?? {}),
          color: '$secondaryText',
        },
      },
      muted: {
        _dark: {
          color: '$secondaryText',
        },
      },
    },
  },
  Button: {
    ...defaultComponents?.Button,
    baseStyle: {
      ...(defaultComponents?.Button?.baseStyle ?? {}),
      borderRadius: '$sm',
    },
    variants: {
      ...(defaultComponents?.Button?.variants ?? {}),
      solid: {
        ...(defaultComponents?.Button?.variants?.solid ?? {}),
        _dark: {
          ...(defaultComponents?.Button?.variants?.solid?._dark ?? {}),
          bg: '$accentPrimary',
          ':hover': {
            ...(defaultComponents?.Button?.variants?.solid?._dark?.[':hover'] ?? {}),
            bg: '$accentPrimary',
            opacity: 0.9,
          },
          ':pressed': {
            ...(defaultComponents?.Button?.variants?.solid?._dark?.[':pressed'] ?? {}),
            bg: '$accentPrimary',
            opacity: 0.7,
          },
        },
      },
      outline: {
        ...(defaultComponents?.Button?.variants?.outline ?? {}),
        _dark: {
          ...(defaultComponents?.Button?.variants?.outline?._dark ?? {}),
          borderColor: '$accentSecondary',
          ':hover': {
            ...(defaultComponents?.Button?.variants?.outline?._dark?.[':hover'] ?? {}),
            borderColor: '$accentSecondary',
            bg: 'rgba(111, 34, 188, 0.1)',
          },
          ':pressed': {
            ...(defaultComponents?.Button?.variants?.outline?._dark?.[':pressed'] ?? {}),
            borderColor: '$accentSecondary',
            bg: 'rgba(111, 34, 188, 0.2)',
          },
        },
      },
    },
  },
  ButtonText: {
    ...defaultComponents?.ButtonText,
    baseStyle: {
      ...(defaultComponents?.ButtonText?.baseStyle ?? {}),
      fontFamily: '$body',
      fontWeight: '600',
      _dark: {
        ...(defaultComponents?.ButtonText?.baseStyle?._dark ?? {}),
        color: '$primaryText',
      },
    },
    variants: {
      ...(defaultComponents?.ButtonText?.variants ?? {}),
      outline: {
        ...(defaultComponents?.ButtonText?.variants?.outline ?? {}),
        _dark: {
          ...(defaultComponents?.ButtonText?.variants?.outline?._dark ?? {}),
          color: '$accentSecondary',
          ':hover': { color: '$accentSecondary' },
          ':pressed': { color: '$accentSecondary' },
        },
      },
    },
  },
  Card: {
    ...defaultComponents?.Card,
    baseStyle: {
      ...(defaultComponents?.Card?.baseStyle ?? {}),
      borderRadius: '$md',
      _dark: {
        ...(defaultComponents?.Card?.baseStyle?._dark ?? {}),
        bg: '$secondaryBG',
        borderColor: 'transparent',
      },
    },
  },
  Icon: {
    ...defaultComponents?.Icon,
    baseStyle: {
      ...(defaultComponents?.Icon?.baseStyle ?? {}),
      _dark: {
        ...(defaultComponents?.Icon?.baseStyle?._dark ?? {}),
        color: '$secondaryText',
      },
    },
    variants: {
      ...(defaultComponents?.Icon?.variants ?? {}),
      primary: {
        _dark: {
          color: '$accentPrimary',
        },
      },
    },
  },
  Input: {
    ...defaultComponents?.Input,
    baseStyle: {
      ...(defaultComponents?.Input?.baseStyle ?? {}),
      borderRadius: '$sm',
      _dark: {
        ...(defaultComponents?.Input?.baseStyle?._dark ?? {}),
        borderColor: '$secondaryText',
        _focus: {
          ...(defaultComponents?.Input?.baseStyle?._dark?._focus ?? {}),
          borderColor: '$accentPrimary',
        },
      },
    },
  },
  InputField: {
    ...defaultComponents?.InputField,
    baseStyle: {
      ...(defaultComponents?.InputField?.baseStyle ?? {}),
      fontFamily: '$body',
      _dark: {
        ...(defaultComponents?.InputField?.baseStyle?._dark ?? {}),
        color: '$primaryText',
        placeholderTextColor: '$secondaryText',
      },
    },
  },
  InputSlot: {
    ...defaultComponents?.InputSlot,
    baseStyle: {
      ...(defaultComponents?.InputSlot?.baseStyle ?? {}),
      _dark: {
        ...(defaultComponents?.InputSlot?.baseStyle?._dark ?? {}),
        color: '$secondaryText',
      },
    },
  },
  InputIcon: {
    ...defaultComponents?.InputIcon,
    baseStyle: {
      ...(defaultComponents?.InputIcon?.baseStyle ?? {}),
      _dark: {
        ...(defaultComponents?.InputIcon?.baseStyle?._dark ?? {}),
        color: '$secondaryText',
      },
    },
  },
  Fab: {
    ...defaultComponents?.Fab,
    baseStyle: {
      ...(defaultComponents?.Fab?.baseStyle ?? {}),
      borderRadius: '$full',
      _dark: {
        ...(defaultComponents?.Fab?.baseStyle?._dark ?? {}),
        bg: '$accentPrimary',
        ':hover': {
          ...(defaultComponents?.Fab?.baseStyle?._dark?.[':hover'] ?? {}),
          bg: '$accentPrimary',
          opacity: 0.9,
        },
        ':pressed': {
          ...(defaultComponents?.Fab?.baseStyle?._dark?.[':pressed'] ?? {}),
          bg: '$accentPrimary',
          opacity: 0.7,
        },
      },
    },
  },
  FabLabel: {
    ...defaultComponents?.FabLabel,
    baseStyle: {
      ...(defaultComponents?.FabLabel?.baseStyle ?? {}),
      fontFamily: '$body',
      fontWeight: '600',
      _dark: {
        ...(defaultComponents?.FabLabel?.baseStyle?._dark ?? {}),
        color: '$primaryText',
      },
    },
  },
};

export const config = createConfig({
  ...defaultConfig,
  tokens,
  components,
});

export type AppConfig = typeof config;
