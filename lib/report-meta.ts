/* 오류 신고 게시판의 분류·상태·타입 (서버와 화면이 함께 씀) */

export type ReportCategory = 'translation' | 'drug_info' | 'guide' | 'feature' | 'other';
export type ReportStatus = 'received' | 'in_progress' | 'resolved' | 'declined';

export const CATEGORY_LABEL: Record<ReportCategory, string> = {
  translation: '번역 오류',
  drug_info: '약 정보 오류',
  guide: '안내문 오류',
  feature: '기능 문제',
  other: '기타'
};

export const STATUS_LABEL: Record<ReportStatus, string> = {
  received: '접수',
  in_progress: '처리 중',
  resolved: '처리 완료',
  declined: '처리 안 함'
};

/** 약을 선택하지 않아도 되는 분류 */
export const DRUG_OPTIONAL: ReportCategory[] = ['feature', 'other'];

/** 누구나 볼 수 있는 항목만 */
export interface PublicReport {
  id: string;
  nickname: string;
  category: ReportCategory;
  title: string;
  status: ReportStatus;
  createdAt: Date;
}

/** 닉네임과 비밀번호를 확인한 본인에게만 */
export interface MyReport extends Omit<PublicReport, 'nickname'> {
  body: string;
  itemSeq: string | null;
  drugName: string | null;
  drugCompany: string | null;
  adminReply: string | null;
  resolvedAt: Date | null;
}

export interface SubmitState {
  error?: string;
  done?: boolean;
}

export interface LookupState {
  error?: string;
  reports?: MyReport[];
}

export const formatKst = (d: Date) =>
  d.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'short' });
