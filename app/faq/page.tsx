import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = { title: 'FAQ · 약속 YakSok' };

const SECTIONS: { title: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    title: '서비스 이용',
    items: [
      {
        q: '약속은 어떤 서비스인가요?',
        a: '약을 검색하고 복용 방법을 입력하면, 외국인 환자에게 건넬 영문 복약 안내문과 설명용 구어체 스크립트를 만들어 주는 약국용 도구입니다. 안내문은 인쇄하거나 텍스트로 복사할 수 있고, 음성으로 읽어 줄 수도 있습니다.'
      },
      {
        q: '회원가입이 필요한가요?',
        a: '아니요. 회원가입이나 로그인 없이 바로 사용할 수 있습니다.'
      },
      {
        q: '안내문은 어떤 언어로 만들어지나요?',
        a: '현재는 영어로 만들어지며, 한국어를 함께 표시해 내용을 확인할 수 있습니다.'
      }
    ]
  },
  {
    title: '약 정보와 번역',
    items: [
      {
        q: '약 정보는 어디에서 가져오나요?',
        a: '식품의약품안전처의 공공데이터(e약은요, 의약품 제품 허가정보, 낱알식별 정보)에서 가져옵니다.'
      },
      {
        q: '찾는 약이 검색되지 않아요.',
        a: '두 글자 이상 입력해 주세요. 취소·취하된 품목은 검색 결과에서 제외되며, 검색되지 않는 약은 직접 입력해 안내문을 만들 수 있습니다.'
      },
      {
        q: '번역과 환자 설명은 어떻게 만들어지나요?',
        a: '직접 입력한 문구의 번역과 환자 설명 초안은 AI(Google Gemini)가 작성합니다. 영어를 다시 한국어로 옮긴 확인용 문장도 제공하지만, AI의 결과는 틀릴 수 있으니 환자에게 전달하기 전에 약사가 반드시 확인해 주세요.'
      },
      {
        q: '안내문 내용을 그대로 믿어도 되나요?',
        a: '약속은 복약지도를 돕는 보조 도구입니다. 실제 조제 약품의 허가사항과 처방 내용은 약사가 최종 확인해 주세요.'
      }
    ]
  },
  {
    title: '개인정보',
    items: [
      {
        q: '입력한 조제 내용이 서버에 저장되나요?',
        a: '조제 목록은 서비스 DB에 저장하지 않으며, 새로고침하면 사라집니다. 약국명과 즐겨찾기 문구, 표시 설정은 사용 중인 브라우저에만 저장됩니다.'
      },
      {
        q: '환자 정보를 입력해도 되나요?',
        a: '입력하지 마세요. 직접 입력한 문구는 번역을 위해 AI 서비스로 전송됩니다. 환자 이름이나 연락처 같은 정보는 어떤 입력란에도 쓰지 말아 주세요.'
      }
    ]
  },
  {
    title: '오류 신고',
    items: [
      {
        q: '번역이나 약 정보가 잘못되었으면 어떻게 하나요?',
        a: <><Link href="/reports/new" prefetch={false}>오류 신고하기</Link>에서 약을 선택하고 내용을 적어 주세요. 회원가입 없이 닉네임과 숫자 비밀번호만 있으면 됩니다.</>
      },
      {
        q: '신고한 내용은 누가 볼 수 있나요?',
        a: '닉네임, 분류, 제목, 처리 상태, 접수 시각은 모두에게 공개됩니다. 선택한 약, 신고 내용, 운영자 답변은 본인과 운영자만 볼 수 있습니다.'
      },
      {
        q: '처리 결과는 어디에서 확인하나요?',
        a: <><Link href="/reports/mine" prefetch={false}>내 신고 확인</Link>에서 신고할 때 입력한 닉네임과 비밀번호로 확인할 수 있습니다.</>
      },
      {
        q: '비밀번호를 잊어버렸어요.',
        a: '이메일 등 본인을 확인할 정보를 받지 않아 비밀번호를 찾아 드릴 수 없습니다. 새 닉네임으로 다시 신고해 주세요. 이전 신고의 처리 상태는 신고 목록에서 볼 수 있습니다.'
      }
    ]
  }
];

export default function FaqPage() {
  return (
    <>
      <SiteHeader active="/faq" />
      <main className="board-page">
        <h1 className="board-title">자주 묻는 질문</h1>
        {SECTIONS.map((section) => (
          <section key={section.title} className="faq-section">
            <h2>{section.title}</h2>
            <div className="faq-list">
              {section.items.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
