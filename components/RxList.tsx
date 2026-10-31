import { routeLabel } from '@/components/DosageCard';
import { directions, itemTitle, joinDir } from '@/lib/sentences';
import type { Item } from '@/lib/types';

/** "조제 목록" 표 */
export default function RxList({
  list,
  editIndex,
  clearArmed,
  onUp,
  onEdit,
  onDelete,
  onClear
}: {
  list: Item[];
  editIndex: number | null;
  clearArmed: boolean;
  onUp: (i: number) => void;
  onEdit: (i: number) => void;
  onDelete: (i: number) => void;
  onClear: () => void;
}) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="card-head">
        <div className="card-title">
          조제 목록 <span className="mono" style={{ color: 'var(--muted)' }}>({list.length})</span>
        </div>
        {list.length > 0 && (
          <button type="button" id="clearBtn" className={`ghost-btn${clearArmed ? ' armed' : ''}`} onClick={onClear}>
            {clearArmed ? '한 번 더 누르면 모두 비웁니다' : '전체 비우기'}
          </button>
        )}
      </div>
      <div className="table-wrap">
        <table className="rx-table" id="rxList">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">제품명</th>
              <th scope="col">경로</th>
              <th scope="col">용법</th>
              <th scope="col">작업</th>
            </tr>
          </thead>
          <tbody>
            {list.length ? (
              list.map((it, i) => (
                <tr key={i} className={editIndex === i ? 'editing' : undefined}>
                  <td className="num">{String(i + 1).padStart(2, '0')}</td>
                  <td className="name">{itemTitle(it)}</td>
                  <td><span className={`route-badge route-${it.route}`}>{routeLabel(it)}</span></td>
                  <td className="dir">{joinDir(directions(it, 'ko'))}</td>
                  <td>
                    <button type="button" className="row-btn" aria-label="위로" disabled={i === 0} onClick={() => onUp(i)}>▲</button>
                    <button type="button" className="row-btn" onClick={() => onEdit(i)}>수정</button>
                    <button type="button" className="row-btn danger" onClick={() => onDelete(i)}>삭제</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="empty">아직 추가된 약이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
