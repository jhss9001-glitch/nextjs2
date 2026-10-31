import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps } from '@mantine/core';
import type { Metadata, Viewport } from 'next';
import '@mantine/core/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: '영문 복약지도 가이드'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};

// 기존 팔레트(--primary: #0f7a6c)에 맞춘 Mantine 색상
const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 7, dark: 5 },
  colors: {
    brand: ['#e3f3f0', '#c3e6e0', '#9fd8cf', '#78c9bd', '#52b9ab', '#2fb3a1', '#13998a', '#0f7a6c', '#0b6458', '#084e45']
  },
  fontFamily: '"Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", system-ui, sans-serif',
  defaultRadius: 'md'
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" {...mantineHtmlProps}>
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
