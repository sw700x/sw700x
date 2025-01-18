# 2tip

## Описание проекта

2tip - сервис для получения чаевых через QR-код, доступный для работников любых сфер. Позволяет клиентам оставлять электронные чаевые, оплачивая картой или через платежные системы, а работникам быстро выводить средства на карту.

## Моя роль в проекте

В новой версии проекта я работаю над переходом на последнюю версию Next.js 15, что требует адаптации существующей архитектуры и модернизации приложения. Основной задачей стало улучшение производительности и удобства работы с кодом. В рамках этой работы я перерабатываю систему загрузки данных и компонентов, оптимизируя объём клиентского JavaScript и ускоряя работу приложения.

Также я внедряю поддержку смены цветовой темы (светлая/тёмная) и расширяю языковую локализацию, чтобы улучшить доступность для пользователей. Работаю над созданием новой архитектуры, которая упрощает масштабирование проекта и добавление новых функций в будущем.

## Технологии, используемые в проекте

![Next.js](https://img.shields.io/badge/-Next.js-000000?logo=next.js&logoColor=white&style=flat-square) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square) ![Redux](https://img.shields.io/badge/-Redux-764ABC?logo=redux&logoColor=white&style=flat-square) ![REST API](https://img.shields.io/badge/-REST%20API-FF6C37?style=flat-square)

## Код (Предпросмотр)

**Локализация:**

> Настройка контекста для управления локализацией и переводами.

<details>
<summary><strong>LocaleContext.tsx</strong> (Нажмите, чтобы раскрыть)</summary>

```
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LocaleContextType {
  locale: string;
  translations: Record<string, string>;
  setLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function setLocaleCookie(locale: string) {
  document.cookie = `locale=${locale}; path=/; max-age=31536000`;
}

export function LocaleProvider({
  children,
  initialLocale,
  initialTranslations,
}: {
  children: ReactNode;
  initialLocale: string;
  initialTranslations: Record<string, string>;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const [translations, setTranslations] = useState(initialTranslations);

  const changeLocale = async (newLocale: string) => {
    setLocale(newLocale);
    setLocaleCookie(newLocale);

    try {
      const response = await fetch(`/locales/${newLocale}/common.json`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch translations for locale: ${newLocale}`
        );
      }
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  };

  return (
    <LocaleContext.Provider
      value={{ locale, translations, setLocale: changeLocale }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

```

</details>

<br>

> Функциональный хук для обработки и получения переводов на основе текущей локализации.

<details>
<summary><strong>useTranslation.ts</strong> (Нажмите, чтобы раскрыть)</summary>

```
import { useLocale } from '@/context/LocaleContext';

export function useTranslations() {
  const { translations } = useLocale();

  function getNestedTranslation(
    obj: Record<string, unknown>,
    path: string
  ): string | undefined {
    return path.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object' && key in acc) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj) as string | undefined;
  }

  function t(key: string): string {
    const value = getNestedTranslation(translations, key);
    return value || key;
  }

  return { t };
}

```

</details>

<br>

> Асинхронная загрузка переводов с сервера.

<details>
<summary><strong>translations.ts</strong> (Нажмите, чтобы раскрыть)</summary>

```
export async function getTranslations(locale: string) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
	const response = await fetch(`${baseUrl}/locales/${locale}/common.json`, {
		next: { revalidate: 60 },
	});

	if (!response.ok) {
	throw new Error(`Failed to load translations for locale: ${locale}`);
	}

	return response.json();
}
```

</details>

<br>

> Настройка доступных локалей и дефолтной локали.

<details>
<summary><strong>i18n.ts</strong> (Нажмите, чтобы раскрыть)</summary>

```
import type { I18NConfig } from 'next/dist/server/config-shared';

const LOCALES = process.env.LOCALES
  ? process.env.LOCALES.split(',').map((item) => item.trim())
  : [];

const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE || 'ru';

export const i18nConfig: I18NConfig = {
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localeDetection: false,
};

export { LOCALES, DEFAULT_LOCALE };
```

</details>

<br>

**Темизация:**

> Настройка контекста для управления темами и их переключения.

<details>
<summary><strong>ThemeContext.tsx</strong> (Нажмите, чтобы раскрыть)</summary>

```
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { DEFAULT_THEME, themeMap, THEMES } from '../../config/themes';

type ThemeContextType = {
  currentTheme: string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
  initialTheme?: string;
};

export const ThemeProvider = ({
  children,
  initialTheme = DEFAULT_THEME,
}: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<string>(initialTheme);

  useEffect(() => {
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
  }, [theme]);

  const setTheme = (newTheme: string) => {
    if (THEMES.includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    const currentIndex = THEMES.indexOf(theme);
    const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{ currentTheme: theme, setTheme, toggleTheme }}
    >
      <MuiThemeProvider theme={themeMap[theme] || themeMap[DEFAULT_THEME]}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useToggleTheme = () => {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error(
      'useCustomTheme должен использоваться внутри ThemeProvider'
    );
  return context;
};

```

</details>

<br>

**Дополнитено:**

<br>

> Утилиты для работы с куками, которые обеспечивают извлечение информации о локализации и выбранной теме из cookies

<details>
<summary><strong>cookies.ts</strong> (Нажмите, чтобы раскрыть)</summary>

```
import { cookies } from 'next/headers';
import { i18nConfig } from '../../config/i18n';
import { DEFAULT_THEME } from '../../config/themes';

export async function getLocaleFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get('locale')?.value || i18nConfig.defaultLocale;
}

export async function getThemeFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get('theme')?.value || DEFAULT_THEME;
}
```

</details>

<br>

> Организация маршрутов для навигации в коде

<details>

<summary><strong>routes.ts</strong> (Нажмите, чтобы раскрыть)</summary>

```
import { RoutesTypes } from './routesTypes';

const routes: RoutesTypes = {
  HOME: '/',
  ABOUT_US: '/about-us',
  AUTH: '/auth',
  HOW_TO_START: '/how-to-start',
  FOR_PERSONNEL: {
    MAIN: '/for-personnel',
    TIPS: '/for-personnel/tips',
    FOR_WAITERS: '/for-personnel/waiters',
    FOR_COURIERS: '/for-personnel/couriers',
    FOR_TAXI_DRIVERS: '/for-personnel/taxi-drivers',
    FOR_GAS_STATION_ATTENDANTS: '/for-personnel/gas-station-attendants',
    FOR_DOORMEN: '/for-personnel/doormen',
    FOR_BARTENDERS: '/for-personnel/bartenders',
    FOR_HAIRDRESSERS: '/for-personnel/hairdressers',
    FOR_HOUSEKEEPERS: '/for-personnel/housekeepers',
  },
  FOR_BUSINESS: {
    MAIN: '/for-business',
    TIPS: '/for-business/tips',
    FOR_RESTAURANTS: '/for-business/restaurants',
    FOR_HOTELS: '/for-business/hotels',
    FOR_CAFES: '/for-business/cafes',
    FOR_TAXI_SERVICES: '/for-business/taxi-services',
    FOR_GAS_STATIONS: '/for-business/gas-stations',
  },
  PROFILE: {
    MAIN: '/profile',
    TRANSACTIONS: '/profile/transactions',
    TRANSFERS: {
      MAIN: '/profile/transfers',
      WITHDRAW_TO_CARD: '/profile/transfers/withdraw-to-card',
      FOR_USER: '/profile/transfers/for-user',
    },
    PRINT: {
      MAIN: '/profile/print',
      MATERIALS: '/profile/print/materials',
    },
    MY_RATINGS: '/profile/my-ratings',
  },
  CONTACTS: '/contacts',
  AGREEMENT: '/agreement',
  PRIVACY: '/privacy',
};

export default routes;

```

</details>

<details>
<summary><strong>routesTypes.ts</strong> (Нажмите, чтобы раскрыть)</summary>

```
export type Route = string;
export type DynamicRoute = (param: string | number) => string;

export type PersonnelRoutes = {
  MAIN: Route;
  TIPS: Route;
  FOR_WAITERS: Route;
  FOR_COURIERS: Route;
  FOR_TAXI_DRIVERS: Route;
  FOR_GAS_STATION_ATTENDANTS: Route;
  FOR_DOORMEN: Route;
  FOR_BARTENDERS: Route;
  FOR_HAIRDRESSERS: Route;
  FOR_HOUSEKEEPERS: Route;
};

export type BusinessRoutes = {
  MAIN: Route;
  TIPS: Route;
  FOR_RESTAURANTS: Route;
  FOR_HOTELS: Route;
  FOR_CAFES: Route;
  FOR_TAXI_SERVICES: Route;
  FOR_GAS_STATIONS: Route;
};

export type ProfileRoutes = {
  MAIN: Route;
  TRANSACTIONS: Route;
  TRANSFERS: {
    MAIN: Route;
    WITHDRAW_TO_CARD: Route;
    FOR_USER: Route;
  };
  PRINT: {
    MAIN: Route;
    MATERIALS: Route;
  };
  MY_RATINGS: Route;
};

export type RoutesTypes = {
  HOME: Route;
  AUTH: Route;
  ABOUT_US: Route;
  HOW_TO_START: Route;
  FOR_PERSONNEL: PersonnelRoutes;
  FOR_BUSINESS: BusinessRoutes;
  PROFILE: ProfileRoutes;
  CONTACTS: Route;
  AGREEMENT: Route;
  PRIVACY: Route;
};

```

</details>

## Принципы и инструменты разработки

- Код-стиль и форматирование: Prettier
- Система контроля версий: Gitlab
- Линтер: ESLint

## Особые вызовы и преодоленные препятствия

Одной из ключевых сложностей стало создание новой версии приложения на базе Next.js 15, начиная с нуля. Этот процесс потребовал полной переработки архитектуры, разработки серверной и клиентской логики с учётом современных стандартов и устранения ограничений, присущих устаревшей версии. Основное внимание было уделено обеспечению стабильности и производительности, а также созданию гибкой структуры, которая упростит дальнейшее развитие проекта.

## Ссылки

Код проекта находится под защитой соглашения о неразглашении NDA, из-за чего, к сожалению, не может быть предоставлен для общего доступа или просмотра.
