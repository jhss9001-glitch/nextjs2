import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps } from '@mantine/core';
import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import '@mantine/core/styles.css';
// Pretendard: 글자 범위별로 나뉜 웹폰트 (필요한 조각만 내려받음)
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './globals.css';

const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  title: '영문 복약지도 가이드'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};

// C안 팔레트(--primary: #0f7a6c)와 폰트에 맞춘 Mantine 테마
const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 7, dark: 5 },
  colors: {
    brand: ['#e3f3f0', '#c3e6e0', '#9fd8cf', '#78c9bd', '#52b9ab', '#2fb3a1', '#13998a', '#0f7a6c', '#0b6458', '#084e45']
  },
  fontFamily: "'Pretendard Variable', Pretendard, -apple-system, 'Malgun Gothic', system-ui, sans-serif",
  fontFamilyMonospace: "var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace",
  headings: { fontFamily: "'Pretendard Variable', Pretendard, system-ui, sans-serif" },
  defaultRadius: 'sm',
  radius: { sm: '6px', md: '8px' }
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={jetbrains.variable} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
