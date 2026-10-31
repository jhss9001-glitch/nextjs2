import { directions, itemTitle } from '@/lib/sentences';
import type { Item } from '@/lib/types';

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
    <div className="step list-step">
      <h2>조제 목록 <span id="listCount" className="count">{list.length}</span></h2>
      <ul id="rxList" className="rx-list">
        {list.length ? (
          list.map((it, i) => (
            <li key={i} className={editIndex === i ? 'editing' : ''}>
              <div className="rx-info">
                <strong>{i + 1}. {itemTitle(it)}</strong>
                <span>{directions(it, 'ko').join(' ')}</span>
              </div>
              <div className="rx-actions">
                <button type="button" aria-label="위로" disabled={i === 0} onClick={() => onUp(i)}>▲</button>
                <button type="button" onClick={() => onEdit(i)}>수정</button>
                <button type="button" className="danger" onClick={() => onDelete(i)}>삭제</button>
              </div>
            </li>
          ))
        ) : (
          <li className="empty">아직 추가된 약이 없습니다.</li>
        )}
      </ul>
      <button type="button" id="clearBtn" className="ghost small" hidden={!list.length} onClick={onClear}>
        {clearArmed ? '한 번 더 누르면 모두 비웁니다' : '전체 비우기'}
      </button>
    </div>
  );
}
