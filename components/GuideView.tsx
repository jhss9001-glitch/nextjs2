import BrandMark from '@/components/BrandMark';
import PillPhoto from '@/components/PillPhoto';
import { UI } from '@/data/rx-data';
import { pillCaption } from '@/lib/pill';
import { today } from '@/lib/plain-text';
import { cautions, directions, infoOf, itemName, koProductName, photoOf, pillOf } from '@/lib/sentences';
import type { Item } from '@/lib/types';

const lang = 'en';

function KoLine({ text, show }: { text: string; show: boolean }) {
  return show && text ? <span className="ko" lang="ko">{text}</span> : null;
}

/** 영어 안내문 (화면·인쇄 공통, 흰 종이 스타일) */
export default function GuideView({ list, showKo, pharmacy }: { list: Item[]; showKo: boolean; pharmacy: string }) {
  return (
    <article className="paper" lang={lang}>
      <header className="paper-head">
        <div>
          <div className="paper-title">{UI.title[lang]}</div>
          {showKo && <div className="paper-sub" lang="ko">{UI.title.ko}</div>}
        </div>
        <div className="paper-meta">
          {pharmacy && <div>{pharmacy}</div>}
          <div>{today(lang)}</div>
        </div>
      </header>

      {list.map((it, i) => {
        const d = it.drug;
        const dirs = directions(it, lang);
        const dirsKo = directions(it, 'ko');
        const cs = cautions(it, lang);
        const info = infoOf(it);
        // 한국어 병기: 영어 이름과 짝이 맞는 한글 제품명 (성분명은 넣지 않음)
        const koName = d ? koProductName(d.brand) : '';
        // 약 사진·모양: 환자가 이름만 보고 어떤 약인지 모를 때 실물과 맞춰 보게
        const photo = photoOf(it);
        const pill = pillOf(it);
        return (
          <section className="g-item" key={i}>
            <span className="g-num">{String(i + 1).padStart(2, '0')}</span>
            <div className="g-head">
              <div>
                <div className="g-name">{itemName(it, lang)}</div>
                {showKo && koName && <div className="g-name-ko" lang="ko">{koName}</div>}
              </div>
              {(photo || pill) && (
                <figure className="g-photo">
                  {photo && <PillPhoto src={photo} alt={pill ? pillCaption(pill, 'en') : itemName(it, lang)} />}
                  {pill && (
                    <figcaption>
                      {pillCaption(pill, 'en')}
                      <KoLine text={pillCaption(pill, 'ko')} show={showKo} />
                    </figcaption>
                  )}
                </figure>
              )}
            </div>
            <dl className="g-dl">
              {info.purpose && (
                <>
                  <dt>{UI.purpose[lang].toUpperCase()}</dt>
                  <dd><p>{info.purpose.en}<KoLine text={info.purpose.ko} show={showKo} /></p></dd>
                </>
              )}
              <dt>{UI.howto[lang].toUpperCase()}</dt>
              <dd className="g-how">
                {dirs.map((s, k) => <p key={k}>{s}<KoLine text={dirsKo[k]} show={showKo} /></p>)}
              </dd>
              {(info.sideEffects.length > 0 || info.serious) && (
                <>
                  <dt>{UI.sideEffects[lang].toUpperCase()}</dt>
                  <dd>
                    <ul className="g-caution">
                      {info.sideEffects.map((s, k) => <li key={k}>{s.en}<KoLine text={s.ko} show={showKo} /></li>)}
                    </ul>
                    {info.serious && (
                      <p className="g-serious">{info.serious.en}<KoLine text={info.serious.ko} show={showKo} /></p>
                    )}
                  </dd>
                </>
              )}
              {cs.length > 0 && (
                <>
                  <dt>{UI.caution[lang].toUpperCase()}</dt>
                  <dd>
                    <ul className="g-caution">
                      {cs.map((c, k) => <li key={k}>{c.t}<KoLine text={c.ko} show={showKo} /></li>)}
                    </ul>
                  </dd>
                </>
              )}
            </dl>
          </section>
        );
      })}

      <footer className="paper-foot">
        <span>{UI.footer[lang]}</span>
        <span className="paper-made"><BrandMark size={14} /> Made with YakSok</span>
      </footer>
    </article>
  );
}
