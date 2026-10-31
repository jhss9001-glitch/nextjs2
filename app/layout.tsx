import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps } from '@mantine/core';
import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Source_Serif_4 } from 'next/font/google';
import '@mantine/core/styles.css';
// Pretendard: 글자 범위별로 나뉜 웹폰트 (필요한 조각만 내려받음)
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './globals.css';

const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });
// 영어 안내문 제목·약 이름: 인쇄물다운 세리프
const serif = Source_Serif_4({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-serif-src', display: 'swap' });

export const metadata: Metadata = {
  title: '약속 YakSok · 영문 복약지도',
  description: '약 이름만 검색하면 외국인 환자에게 건넬 영문 복약 안내문과 스크립트를 만들어 주는 약국용 도구'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};

// 약속 팔레트(--primary: #0e6f63 계열)와 폰트에 맞춘 Mantine 테마
const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 7, dark: 5 },
  colors: {
    brand: ['#e4f3ef', '#c3e6e0', '#9fd8cf', '#78c9bd', '#52b9ab', '#2fb3a1', '#13998a', '#0e6f63', '#0a5a50', '#084a42']
  },
  fontFamily: "'Pretendard Variable', Pretendard, -apple-system, 'Malgun Gothic', system-ui, sans-serif",
  fontFamilyMonospace: "var(--font-jetbrains), 'JetBrains Mono', ui-monospace, monospace",
  headings: { fontFamily: "'Pretendard Variable', Pretendard, system-ui, sans-serif" },
  defaultRadius: 'md',
  radius: { sm: '8px', md: '10px' }
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${jetbrains.variable} ${serif.variable}`} {...mantineHtmlProps}>
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
