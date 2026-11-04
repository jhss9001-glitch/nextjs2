import type { Metadata } from 'next';
import { AdminLoginForm } from '@/components/admin/AdminForms';
import AdminShell from '@/components/admin/AdminShell';

export const metadata: Metadata = { title: '관리자 로그인 · 약속 YakSok', robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <AdminShell signedIn={false}>
      <div className="admin-login">
        <h1 className="board-title">관리자 로그인</h1>
        <AdminLoginForm />
      </div>
    </AdminShell>
  );
}
