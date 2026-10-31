import { UI } from '@/data/rx-data';
import { today } from '@/lib/plain-text';
import { findDrug } from '@/lib/search';
import { cautions, directions } from '@/lib/sentences';
import type { Item, OutLang } from '@/lib/types';

function KoLine({ text, show }: { text: string; show: boolean }) {
  return show ? <span className="ko" lang="ko">{text}</span> : null;
}

export default function GuideView({
  list,
  lang,
  showKo,
  pharmacy
}: {
  list: Item[];
  lang: OutLang;
  showKo: boolean;
  pharmacy: string;
}) {
  return (
    <article className="guide" lang={lang}>
      <header className="g-head">
        <h3>
          {UI.title[lang]}
          {showKo && <> <span className="ko-inline">{UI.title.ko}</span></>}
        </h3>
        <div className="g-meta">
          {pharmacy ? `${UI.pharmacy[lang]}: ${pharmacy} · ` : ''}
          {today(lang)}
        </div>
      </header>
      <ol className="g-items">
        {list.map((it, i) => {
          const d = findDrug(it.drugId);
          const name = d ? d.ing[lang] : it.customName;
          const sub = d ? `${d.brand} · ${d.brandEn}` : '';
          const dirs = directions(it, lang);
          const dirsKo = directions(it, 'ko');
          const cs = cautions(it, lang);
          return (
            <li className="g-item" key={i}>
              <div className="g-name">
                <span className="g-idx">{i + 1}</span>
                <div>
                  <strong>{name}</strong>
                  {sub && <small>{UI.product[lang]}: {sub}</small>}
                  {d && <KoLine text={d.ing.ko} show={showKo} />}
                </div>
              </div>
              <dl>
                {d && (
                  <>
                    <dt>{UI.purpose[lang]}</dt>
                    <dd><p>{d.use[lang]}<KoLine text={d.use.ko} show={showKo} /></p></dd>
                  </>
                )}
                <dt>{UI.howto[lang]}</dt>
                <dd className="g-how">
                  {dirs.map((s, k) => <p key={k}>{s}<KoLine text={dirsKo[k]} show={showKo} /></p>)}
                </dd>
                {cs.length > 0 && (
                  <>
                    <dt>{UI.caution[lang]}</dt>
                    <dd>
                      <ul className="g-caution">
                        {cs.map((c, k) => <li key={k}>{c.t}<KoLine text={c.ko} show={showKo} /></li>)}
                      </ul>
                    </dd>
                  </>
                )}
              </dl>
            </li>
          );
        })}
      </ol>
      <footer className="g-foot">{UI.footer[lang]}</footer>
    </article>
  );
}
