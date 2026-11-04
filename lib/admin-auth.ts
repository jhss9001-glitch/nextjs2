/* 관리자 확인 (서버 전용). 관리자 화면과 서버 액션은 모두 requireAdmin을 거친다 */
import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export interface Admin {
  id: string;
  name: string;
}

export async function findAdmin(userId: string): Promise<Admin | null> {
  const rows = await db()<Admin[]>`
    select user_id as id, display_name as name from error_board.admins where user_id = ${userId}`;
  return rows[0] ?? null;
}

/** 로그인하지 않았으면 로그인 화면으로, 관리자가 아니면 화면의 존재 자체를 알리지 않음 */
export async function requireAdmin(): Promise<Admin> {
  await connection(); // 인증 라이브러리가 시간을 읽으므로 요청 시점에만 실행
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect('/admin/login');
  const admin = await findAdmin(userId);
  if (!admin) notFound();
  return admin;
}
