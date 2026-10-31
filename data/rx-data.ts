/* =========================================================
 * 다국어 복약지도 가이드 - 데이터
 *  - DRUGS   : 약품 목록 (제품명/성분명/효능/약품별 주의사항)
 *  - UNITS   : 용량 단위
 *  - TIMINGS : 복용 시점
 *  - GENERAL : 공통 주의사항 (체크박스로 선택)
 *  - UI      : 출력 화면 문구
 * 새 약을 추가하려면 DRUGS 배열에 같은 형식으로 항목을 추가하세요.
 * route: 'oral'(내복) | 'eye'(점안) | 'topical'(외용)
 * ========================================================= */

import type { Drug, GeneralKey, Timing, TimingKey, Tr, UiKey, Unit, UnitKey } from '@/lib/types';

export const DRUGS: Drug[] = [
  {
    id: 'acetaminophen',
    brand: '타이레놀정 500mg',
    brandEn: 'Tylenol 500mg',
    aliases: ['타이레놀', 'tylenol', 'paracetamol', '파라세타몰'],
    cat: '해열진통제',
    route: 'oral',
    ing: { ko: '아세트아미노펜', en: 'Acetaminophen (Paracetamol)', zh: '对乙酰氨基酚', ja: 'アセトアミノフェン' },
    use: {
      ko: '해열, 진통 (두통, 치통, 생리통, 근육통 등)',
      en: 'Relief of fever and pain (headache, toothache, menstrual pain, muscle pain, etc.)',
      zh: '退烧、止痛（头痛、牙痛、痛经、肌肉痛等）',
      ja: '解熱・鎮痛（頭痛、歯痛、生理痛、筋肉痛など）'
    },
    warn: [
      {
        ko: '하루 최대 4,000mg(이 약 8정)을 넘기지 마세요.',
        en: 'Do not take more than 4,000 mg (8 tablets of this medicine) in 24 hours.',
        zh: '24小时内不得超过4,000毫克（本药8片）。',
        ja: '1日の最大量4,000mg（本剤8錠）を超えないでください。'
      },
      {
        ko: '아세트아미노펜이 들어 있는 다른 약(종합감기약 등)과 함께 복용하지 마세요.',
        en: 'Do not take with other products containing acetaminophen (e.g., cold medicines).',
        zh: '请勿与其他含对乙酰氨基酚的药物（如复方感冒药）同时服用。',
        ja: 'アセトアミノフェンを含む他の薬（総合感冒薬など）と一緒に服用しないでください。'
      },
      {
        ko: '복용 중 음주하면 간 손상 위험이 커집니다.',
        en: 'Drinking alcohol while taking this medicine increases the risk of liver damage.',
        zh: '服药期间饮酒会增加肝损伤的风险。',
        ja: '服用中に飲酒すると肝障害のリスクが高まります。'
      }
    ],
    def: { unit: 'tab', qty: 1, freq: 'prn', interval: 4, max: 4 },
    general: []
  },
  {
    id: 'ibuprofen',
    brand: '부루펜정 200mg',
    brandEn: 'Brufen 200mg',
    aliases: ['부루펜', '애드빌', 'advil', 'brufen'],
    cat: '해열진통소염제',
    route: 'oral',
    ing: { ko: '이부프로펜', en: 'Ibuprofen', zh: '布洛芬', ja: 'イブプロフェン' },
    use: {
      ko: '해열, 진통, 소염',
      en: 'Relief of fever, pain and inflammation',
      zh: '退烧、止痛、消炎',
      ja: '解熱・鎮痛・消炎'
    },
    warn: [
      {
        ko: '위장 장애를 줄이기 위해 식후에 복용하세요.',
        en: 'Take after meals to reduce stomach upset.',
        zh: '为减少胃肠不适，请饭后服用。',
        ja: '胃腸障害を防ぐため、食後に服用してください。'
      },
      {
        ko: '위궤양이나 신장 질환이 있거나 임신 중이면 약사에게 알려주세요.',
        en: 'Tell the pharmacist if you have a stomach ulcer or kidney disease, or if you are pregnant.',
        zh: '如有胃溃疡、肾病或正在怀孕，请告知药师。',
        ja: '胃潰瘍や腎臓の病気がある方、妊娠中の方は薬剤師にお伝えください。'
      },
      {
        ko: '음주 시 위장 출혈 위험이 커집니다.',
        en: 'Alcohol increases the risk of stomach bleeding.',
        zh: '饮酒会增加胃肠出血的风险。',
        ja: '飲酒により胃腸出血のリスクが高まります。'
      }
    ],
    def: { unit: 'tab', qty: 1, freq: '3', timing: 'after_30' },
    general: []
  },
  {
    id: 'cetirizine',
    brand: '지르텍정 10mg',
    brandEn: 'Zyrtec 10mg',
    aliases: ['지르텍', 'zyrtec'],
    cat: '항히스타민제',
    route: 'oral',
    ing: { ko: '세티리진염산염', en: 'Cetirizine hydrochloride', zh: '盐酸西替利嗪', ja: 'セチリジン塩酸塩' },
    use: {
      ko: '알레르기 비염, 두드러기, 가려움',
      en: 'Allergic rhinitis (hay fever), hives, itching',
      zh: '过敏性鼻炎、荨麻疹、瘙痒',
      ja: 'アレルギー性鼻炎、じんましん、かゆみ'
    },
    warn: [
      {
        ko: '졸음이 올 수 있어 저녁(취침 전)에 복용하는 것이 좋습니다.',
        en: 'It may cause drowsiness, so taking it in the evening (at bedtime) is recommended.',
        zh: '可能引起嗜睡，建议晚上（睡前）服用。',
        ja: '眠気が出ることがあるため、夜（就寝前）の服用をおすすめします。'
      }
    ],
    def: { unit: 'tab', qty: 1, freq: '1', timing: 'bedtime' },
    general: ['drowsy', 'no_alcohol']
  },
  {
    id: 'loratadine',
    brand: '클라리틴정 10mg',
    brandEn: 'Claritin 10mg',
    aliases: ['클라리틴', 'claritin'],
    cat: '항히스타민제',
    route: 'oral',
    ing: { ko: '로라타딘', en: 'Loratadine', zh: '氯雷他定', ja: 'ロラタジン' },
    use: {
      ko: '알레르기 비염, 두드러기, 가려움',
      en: 'Allergic rhinitis (hay fever), hives, itching',
      zh: '过敏性鼻炎、荨麻疹、瘙痒',
      ja: 'アレルギー性鼻炎、じんましん、かゆみ'
    },
    warn: [
      {
        ko: '졸음은 적은 편이지만 사람에 따라 나타날 수 있습니다.',
        en: 'Drowsiness is uncommon but may occur in some people.',
        zh: '嗜睡较少见，但个别人可能出现。',
        ja: '眠気は少ないですが、人によっては現れることがあります。'
      }
    ],
    def: { unit: 'tab', qty: 1, freq: '1', timing: 'anytime' },
    general: []
  },
  {
    id: 'pseudoephedrine',
    brand: '슈다페드정 60mg',
    brandEn: 'Sudafed 60mg',
    aliases: ['슈다페드', 'sudafed'],
    cat: '비충혈제거제',
    route: 'oral',
    ing: { ko: '슈도에페드린염산염', en: 'Pseudoephedrine hydrochloride', zh: '盐酸伪麻黄碱', ja: 'プソイドエフェドリン塩酸塩' },
    use: {
      ko: '코막힘 완화',
      en: 'Relief of nasal congestion (stuffy nose)',
      zh: '缓解鼻塞',
      ja: '鼻づまりの緩和'
    },
    warn: [
      {
        ko: '잠이 오지 않을 수 있으니 취침 직전 복용은 피하세요.',
        en: 'It may cause sleeplessness, so avoid taking it right before bedtime.',
        zh: '可能引起失眠，请避免在临睡前服用。',
        ja: '眠れなくなることがあるため、就寝直前の服用は避けてください。'
      },
      {
        ko: '고혈압, 심장 질환, 갑상선 질환, 녹내장, 전립선비대증이 있으면 약사에게 알려주세요.',
        en: 'Tell the pharmacist if you have high blood pressure, heart disease, thyroid disease, glaucoma, or an enlarged prostate.',
        zh: '如有高血压、心脏病、甲状腺疾病、青光眼或前列腺增生，请告知药师。',
        ja: '高血圧、心臓病、甲状腺の病気、緑内障、前立腺肥大症のある方は薬剤師にお伝えください。'
      }
    ],
    def: { unit: 'tab', qty: 1, freq: '3', timing: 'after_30' },
    general: []
  },
  {
    id: 'enzyme',
    brand: '베아제정 / 훼스탈플러스정',
    brandEn: 'Bearse / Festal Plus',
    aliases: ['베아제', '훼스탈', 'bearse', 'festal', '소화제'],
    cat: '소화제',
    route: 'oral',
    ing: { ko: '소화효소 복합제', en: 'Digestive enzyme combination', zh: '复方消化酶', ja: '消化酵素配合剤' },
    use: {
      ko: '소화불량, 식욕감퇴, 과식',
      en: 'Indigestion, loss of appetite, overeating',
      zh: '消化不良、食欲不振、饮食过量',
      ja: '消化不良、食欲不振、食べ過ぎ'
    },
    warn: [],
    def: { unit: 'tab', qty: 1, freq: '3', timing: 'after_now' },
    general: ['swallow']
  },
  {
    id: 'alphosphate',
    brand: '겔포스엠현탁액',
    brandEn: 'Gelfos M suspension',
    aliases: ['겔포스', 'gelfos', '제산제'],
    cat: '제산제',
    route: 'oral',
    ing: { ko: '인산알루미늄겔 (제산제)', en: 'Aluminum phosphate gel (antacid)', zh: '磷酸铝凝胶（抗酸药）', ja: 'リン酸アルミニウムゲル（制酸剤）' },
    use: {
      ko: '속쓰림, 위산과다, 위통',
      en: 'Heartburn, excess stomach acid, stomach pain',
      zh: '烧心、胃酸过多、胃痛',
      ja: '胸やけ、胃酸過多、胃痛'
    },
    warn: [
      {
        ko: '복용 전 포를 손으로 충분히 주물러 섞으세요.',
        en: 'Knead the packet well with your fingers before taking.',
        zh: '服用前请用手充分揉匀药包。',
        ja: '服用前に袋をよく揉んで混ぜてください。'
      },
      {
        ko: '다른 약의 흡수를 방해할 수 있으니 다른 약과 1~2시간 간격을 두고 복용하세요.',
        en: 'It may reduce the absorption of other medicines. Take it 1–2 hours apart from other medicines.',
        zh: '可能影响其他药物的吸收，请与其他药物间隔1~2小时服用。',
        ja: '他の薬の吸収を妨げることがあるため、他の薬とは1〜2時間あけて服用してください。'
      }
    ],
    def: { unit: 'pkt', qty: 1, freq: '3', timing: 'between' },
    general: []
  },
  {
    id: 'alginate',
    brand: '개비스콘더블액션현탁액',
    brandEn: 'Gaviscon Double Action',
    aliases: ['개비스콘', 'gaviscon'],
    cat: '위식도역류 증상 완화제',
    route: 'oral',
    ing: { ko: '알긴산나트륨 복합제', en: 'Sodium alginate combination', zh: '海藻酸钠复方制剂', ja: 'アルギン酸ナトリウム配合剤' },
    use: {
      ko: '위식도역류 증상 (속쓰림, 신물 올라옴)',
      en: 'Symptoms of acid reflux (heartburn, sour taste in the mouth)',
      zh: '胃食管反流症状（烧心、反酸）',
      ja: '胃食道逆流の症状（胸やけ、呑酸）'
    },
    warn: [
      {
        ko: '다른 약의 흡수를 방해할 수 있으니 다른 약과 1~2시간 간격을 두고 복용하세요.',
        en: 'It may reduce the absorption of other medicines. Take it 1–2 hours apart from other medicines.',
        zh: '可能影响其他药物的吸收，请与其他药物间隔1~2小时服用。',
        ja: '他の薬の吸収を妨げることがあるため、他の薬とは1〜2時間あけて服用してください。'
      }
    ],
    def: { unit: 'pkt', qty: 1, freq: '4', timing: 'after_bed' },
    general: []
  },
  {
    id: 'diosmectite',
    brand: '스멕타현탁액',
    brandEn: 'Smecta',
    aliases: ['스멕타', 'smecta', '지사제'],
    cat: '지사제',
    route: 'oral',
    ing: { ko: '디옥타헤드랄스멕타이트', en: 'Diosmectite', zh: '蒙脱石（双八面体蒙脱石）', ja: 'ジオスメクタイト' },
    use: {
      ko: '설사',
      en: 'Diarrhea',
      zh: '腹泻',
      ja: '下痢'
    },
    warn: [
      {
        ko: '다른 약의 흡수를 방해할 수 있으니 다른 약과 1~2시간 간격을 두고 복용하세요.',
        en: 'It may reduce the absorption of other medicines. Take it 1–2 hours apart from other medicines.',
        zh: '可能影响其他药物的吸收，请与其他药物间隔1~2小时服用。',
        ja: '他の薬の吸収を妨げることがあるため、他の薬とは1〜2時間あけて服用してください。'
      },
      {
        ko: '설사로 인한 탈수를 막기 위해 수분을 충분히 섭취하세요.',
        en: 'Drink plenty of fluids to prevent dehydration from diarrhea.',
        zh: '请多补充水分，以防腹泻引起脱水。',
        ja: '下痢による脱水を防ぐため、水分を十分にとってください。'
      }
    ],
    def: { unit: 'pkt', qty: 1, freq: '3', timing: 'between' },
    general: ['consult']
  },
  {
    id: 'loperamide',
    brand: '로페라미드 캡슐 2mg',
    brandEn: 'Loperamide 2mg (Imodium)',
    aliases: ['imodium', '이모디움', '지사제'],
    cat: '지사제',
    route: 'oral',
    ing: { ko: '로페라미드염산염', en: 'Loperamide hydrochloride', zh: '盐酸洛哌丁胺', ja: 'ロペラミド塩酸塩' },
    use: {
      ko: '급성 설사',
      en: 'Acute diarrhea',
      zh: '急性腹泻',
      ja: '急性の下痢'
    },
    warn: [
      {
        ko: '혈변이 있거나 고열을 동반한 설사에는 복용하지 말고 진료를 받으세요.',
        en: 'Do not take if you have bloody stools or a high fever. See a doctor instead.',
        zh: '如有便血或高烧，请勿服用，并请就医。',
        ja: '血便や高熱を伴う下痢の場合は服用せず、医療機関を受診してください。'
      },
      {
        ko: '변비나 복부 팽만이 생기면 복용을 중단하세요.',
        en: 'Stop taking if constipation or bloating occurs.',
        zh: '如出现便秘或腹胀，请停止服用。',
        ja: '便秘やお腹の張りが現れたら服用を中止してください。'
      }
    ],
    def: { unit: 'cap', qty: 1, freq: 'prn', interval: '', max: 4 },
    general: []
  },
  {
    id: 'bisacodyl',
    brand: '둘코락스 장용정',
    brandEn: 'Dulcolax',
    aliases: ['둘코락스', 'dulcolax', '변비약'],
    cat: '변비약',
    route: 'oral',
    ing: { ko: '비사코딜 (자극성 변비약)', en: 'Bisacodyl (stimulant laxative)', zh: '比沙可啶（刺激性泻药）', ja: 'ビサコジル（刺激性下剤）' },
    use: {
      ko: '변비',
      en: 'Constipation',
      zh: '便秘',
      ja: '便秘'
    },
    warn: [
      {
        ko: '장용정이므로 씹거나 부수지 말고 그대로 삼키세요.',
        en: 'This is an enteric-coated tablet. Swallow it whole; do not crush or chew.',
        zh: '本品为肠溶片，请整片吞服，不要咀嚼或掰碎。',
        ja: '腸溶錠のため、噛んだり砕いたりせず、そのまま飲み込んでください。'
      },
      {
        ko: '우유나 제산제와는 1시간 이상 간격을 두고 복용하세요.',
        en: 'Do not take within 1 hour of drinking milk or taking antacids.',
        zh: '请与牛奶或抗酸药间隔1小时以上服用。',
        ja: '牛乳や制酸剤とは1時間以上あけて服用してください。'
      },
      {
        ko: '보통 복용 후 6~12시간 뒤에 효과가 나타납니다.',
        en: 'It usually works within 6–12 hours.',
        zh: '一般服药后6~12小时起效。',
        ja: '通常、服用後6〜12時間で効果が現れます。'
      }
    ],
    def: { unit: 'tab', qty: 2, freq: '1', timing: 'bedtime' },
    general: []
  },
  {
    id: 'butylscopolamine',
    brand: '부스코판당의정 10mg',
    brandEn: 'Buscopan 10mg',
    aliases: ['부스코판', 'buscopan', '진경제'],
    cat: '진경제 (복통)',
    route: 'oral',
    ing: { ko: '부틸스코폴라민브롬화물', en: 'Hyoscine butylbromide (Butylscopolamine)', zh: '丁溴东莨菪碱', ja: 'ブチルスコポラミン臭化物' },
    use: {
      ko: '위경련, 복통',
      en: 'Stomach cramps, abdominal pain',
      zh: '胃痉挛、腹痛',
      ja: '胃けいれん、腹痛'
    },
    warn: [
      {
        ko: '입마름, 시야 흐림, 변비가 나타날 수 있습니다.',
        en: 'Dry mouth, blurred vision, or constipation may occur.',
        zh: '可能出现口干、视物模糊、便秘。',
        ja: '口の渇き、目のかすみ、便秘が現れることがあります。'
      },
      {
        ko: '녹내장이나 전립선비대증이 있으면 약사에게 알려주세요.',
        en: 'Tell the pharmacist if you have glaucoma or an enlarged prostate.',
        zh: '如有青光眼或前列腺增生，请告知药师。',
        ja: '緑内障や前立腺肥大症のある方は薬剤師にお伝えください。'
      }
    ],
    def: { unit: 'tab', qty: 1, freq: '3', timing: 'after_30' },
    general: []
  },
  {
    id: 'amoxicillin',
    brand: '아목시실린캡슐 500mg',
    brandEn: 'Amoxicillin 500mg',
    aliases: ['아목시실린', 'amoxil', '항생제'],
    cat: '항생제',
    route: 'oral',
    ing: { ko: '아목시실린 (페니실린계 항생제)', en: 'Amoxicillin (penicillin antibiotic)', zh: '阿莫西林（青霉素类抗生素）', ja: 'アモキシシリン（ペニシリン系抗生物質）' },
    use: {
      ko: '세균 감염 치료',
      en: 'Treatment of bacterial infections',
      zh: '治疗细菌感染',
      ja: '細菌感染症の治療'
    },
    warn: [
      {
        ko: '페니실린 알레르기가 있으면 반드시 알려주세요.',
        en: 'Tell the pharmacist if you are allergic to penicillin.',
        zh: '如对青霉素过敏，请务必告知药师。',
        ja: 'ペニシリンにアレルギーがある方は必ずお申し出ください。'
      },
      {
        ko: '설사가 생길 수 있습니다. 심하거나 계속되면 상담하세요.',
        en: 'Diarrhea may occur. Consult a doctor or pharmacist if it is severe or does not stop.',
        zh: '可能引起腹泻，如症状严重或持续，请咨询医生或药师。',
        ja: '下痢が起こることがあります。ひどい場合や続く場合はご相談ください。'
      }
    ],
    def: { unit: 'cap', qty: 1, freq: '3', timing: 'after_30', days: 5 },
    general: ['complete', 'missed', 'stop_rash']
  },
  {
    id: 'amoxiclav',
    brand: '오구멘틴정 625mg',
    brandEn: 'Augmentin 625mg',
    aliases: ['오구멘틴', 'augmentin', '아목시클라브', '항생제'],
    cat: '항생제',
    route: 'oral',
    ing: { ko: '아목시실린·클라불란산', en: 'Amoxicillin / Clavulanic acid', zh: '阿莫西林克拉维酸钾', ja: 'アモキシシリン・クラブラン酸' },
    use: {
      ko: '세균 감염 치료',
      en: 'Treatment of bacterial infections',
      zh: '治疗细菌感染',
      ja: '細菌感染症の治療'
    },
    warn: [
      {
        ko: '위장 장애를 줄이기 위해 식사 직후(또는 식사와 함께) 복용하세요.',
        en: 'Take right after (or with) a meal to reduce stomach upset.',
        zh: '为减少胃肠不适，请饭后立即（或随餐）服用。',
        ja: '胃腸障害を防ぐため、食直後（または食事と一緒に）服用してください。'
      },
      {
        ko: '페니실린 알레르기가 있으면 반드시 알려주세요.',
        en: 'Tell the pharmacist if you are allergic to penicillin.',
        zh: '如对青霉素过敏，请务必告知药师。',
        ja: 'ペニシリンにアレルギーがある方は必ずお申し出ください。'
      },
      {
        ko: '설사가 생길 수 있습니다. 심하거나 계속되면 상담하세요.',
        en: 'Diarrhea may occur. Consult a doctor or pharmacist if it is severe or does not stop.',
        zh: '可能引起腹泻，如症状严重或持续，请咨询医生或药师。',
        ja: '下痢が起こることがあります。ひどい場合や続く場合はご相談ください。'
      }
    ],
    def: { unit: 'tab', qty: 1, freq: '3', timing: 'after_now', days: 5 },
    general: ['complete', 'missed', 'stop_rash']
  },
  {
    id: 'rebamipide',
    brand: '무코스타정 100mg',
    brandEn: 'Mucosta 100mg',
    aliases: ['무코스타', 'mucosta', '위장약'],
    cat: '위점막 보호제',
    route: 'oral',
    ing: { ko: '레바미피드', en: 'Rebamipide', zh: '瑞巴派特', ja: 'レバミピド' },
    use: {
      ko: '위염, 위궤양 (위 점막 보호)',
      en: 'Gastritis, stomach ulcers (protects the stomach lining)',
      zh: '胃炎、胃溃疡（保护胃黏膜）',
      ja: '胃炎・胃潰瘍（胃粘膜の保護）'
    },
    warn: [
      {
        ko: '다른 약과 함께 처방되어 위를 보호하는 역할을 합니다.',
        en: 'It is often prescribed together with other medicines to protect the stomach.',
        zh: '常与其他药物一起处方，用于保护胃部。',
        ja: '他の薬と一緒に処方され、胃を保護する目的で使われます。'
      }
    ],
    def: { unit: 'tab', qty: 1, freq: '3', timing: 'after_30' },
    general: []
  },
  {
    id: 'mosapride',
    brand: '가스모틴정 5mg',
    brandEn: 'Gasmotin 5mg',
    aliases: ['가스모틴', 'gasmotin', '위장약'],
    cat: '위장운동 촉진제',
    route: 'oral',
    ing: { ko: '모사프리드시트르산염', en: 'Mosapride citrate', zh: '枸橼酸莫沙必利', ja: 'モサプリドクエン酸塩' },
    use: {
      ko: '소화불량, 속 더부룩함 (위장 운동 촉진)',
      en: 'Indigestion, bloating (helps the stomach move food along)',
      zh: '消化不良、腹胀（促进胃肠蠕动）',
      ja: '消化不良、胃もたれ（胃腸の動きを良くする）'
    },
    warn: [],
    def: { unit: 'tab', qty: 1, freq: '3', timing: 'before_30' },
    general: []
  },
  {
    id: 'esomeprazole',
    brand: '넥시움정 20mg / 40mg',
    brandEn: 'Nexium 20mg / 40mg',
    aliases: ['넥시움', 'nexium', 'ppi', '위장약'],
    cat: '위산분비 억제제 (PPI)',
    route: 'oral',
    ing: { ko: '에스오메프라졸', en: 'Esomeprazole', zh: '埃索美拉唑', ja: 'エソメプラゾール' },
    use: {
      ko: '위식도역류질환, 위궤양 (위산 분비 억제)',
      en: 'Acid reflux, stomach ulcers (reduces stomach acid)',
      zh: '胃食管反流病、胃溃疡（抑制胃酸分泌）',
      ja: '逆流性食道炎、胃潰瘍（胃酸の分泌を抑える）'
    },
    warn: [],
    def: { unit: 'tab', qty: 1, freq: '1', timing: 'before_30' },
    general: ['swallow']
  },
  {
    id: 'prednisolone',
    brand: '소론도정 5mg',
    brandEn: 'Solondo 5mg',
    aliases: ['소론도', '스테로이드', 'steroid'],
    cat: '부신피질호르몬제 (스테로이드)',
    route: 'oral',
    ing: { ko: '프레드니솔론 (스테로이드)', en: 'Prednisolone (corticosteroid)', zh: '泼尼松龙（糖皮质激素）', ja: 'プレドニゾロン（副腎皮質ステロイド）' },
    use: {
      ko: '염증 및 알레르기 반응 억제',
      en: 'Reducing inflammation and allergic reactions',
      zh: '抑制炎症和过敏反应',
      ja: '炎症やアレルギー反応の抑制'
    },
    warn: [
      {
        ko: '임의로 갑자기 중단하지 말고 처방대로 복용하세요.',
        en: 'Do not stop taking it suddenly on your own. Take it exactly as prescribed.',
        zh: '请勿自行突然停药，请严格按照处方服用。',
        ja: '自己判断で急に中止せず、処方どおりに服用してください。'
      },
      {
        ko: '1일 1회 복용하는 경우 아침 식후에 복용하세요.',
        en: 'If you take it once a day, take it in the morning after breakfast.',
        zh: '若每日服用1次，请在早餐后服用。',
        ja: '1日1回の場合は朝食後に服用してください。'
      }
    ],
    def: { unit: 'tab', qty: 1, freq: '1', timing: 'morning_after', days: 5 },
    general: []
  },
  {
    id: 'oseltamivir',
    brand: '타미플루캡슐 75mg',
    brandEn: 'Tamiflu 75mg',
    aliases: ['타미플루', 'tamiflu', '독감', 'influenza'],
    cat: '항바이러스제 (독감)',
    route: 'oral',
    ing: { ko: '오셀타미비르', en: 'Oseltamivir', zh: '奥司他韦', ja: 'オセルタミビル' },
    use: {
      ko: '인플루엔자(독감) 치료',
      en: 'Treatment of influenza (flu)',
      zh: '治疗流行性感冒（流感）',
      ja: 'インフルエンザの治療'
    },
    warn: [
      {
        ko: '소아·청소년은 복용 후 이상행동이 나타날 수 있으니 보호자가 주의 깊게 지켜보세요(특히 처음 2일).',
        en: 'Children and teenagers may show unusual behavior after taking it. Caregivers should watch them closely, especially for the first 2 days.',
        zh: '儿童和青少年服药后可能出现异常行为，监护人请密切观察（尤其是最初2天）。',
        ja: '小児・未成年者では服用後に異常行動が現れることがあるため、保護者は注意深く見守ってください（特に最初の2日間）。'
      }
    ],
    def: { unit: 'cap', qty: 1, freq: '2', timing: 'after_30', days: 5 },
    general: ['complete', 'missed']
  },
  {
    id: 'ambroxol',
    brand: '뮤코펙트정 30mg',
    brandEn: 'Mucopect 30mg',
    aliases: ['뮤코펙트', 'mucopect', '거담제', '가래'],
    cat: '거담제',
    route: 'oral',
    ing: { ko: '암브록솔염산염', en: 'Ambroxol hydrochloride', zh: '盐酸氨溴索', ja: 'アンブロキソール塩酸塩' },
    use: {
      ko: '가래 배출',
      en: 'Clearing phlegm (mucus)',
      zh: '化痰（帮助排痰）',
      ja: '去痰（痰を出しやすくする）'
    },
    warn: [],
    def: { unit: 'tab', qty: 1, freq: '3', timing: 'after_30' },
    general: ['water']
  },
  {
    id: 'dimenhydrinate',
    brand: '디멘히드리네이트 정 (멀미약)',
    brandEn: 'Dimenhydrinate (motion sickness)',
    aliases: ['멀미약', '멀미', 'dramamine', '드라마민'],
    cat: '멀미약',
    route: 'oral',
    ing: { ko: '디멘히드리네이트', en: 'Dimenhydrinate', zh: '茶苯海明', ja: 'ジメンヒドリナート' },
    use: {
      ko: '멀미 예방 및 완화',
      en: 'Prevention and relief of motion sickness',
      zh: '预防和缓解晕动症（晕车、晕船、晕机）',
      ja: '乗り物酔いの予防・緩和'
    },
    warn: [
      {
        ko: '차·배·비행기에 타기 30분~1시간 전에 복용하세요.',
        en: 'Take 30 minutes to 1 hour before travel (car, ship, or plane).',
        zh: '请在乘车、船或飞机前30分钟至1小时服用。',
        ja: '乗り物に乗る30分〜1時間前に服用してください。'
      }
    ],
    def: { unit: 'tab', qty: 1, freq: 'prn', interval: 4, max: 3 },
    general: ['drowsy', 'no_alcohol']
  },
  {
    id: 'hyaluronate',
    brand: '히알루론산나트륨 점안액 0.1% (히아레인 등)',
    brandEn: 'Sodium hyaluronate 0.1% eye drops (Hyalein, etc.)',
    aliases: ['인공눈물', '히아레인', 'hyalein', '안약', 'eye drops'],
    cat: '인공눈물 (점안제)',
    route: 'eye',
    ing: { ko: '히알루론산나트륨 (인공눈물)', en: 'Sodium hyaluronate (artificial tears)', zh: '玻璃酸钠（人工泪液）', ja: 'ヒアルロン酸ナトリウム（人工涙液）' },
    use: {
      ko: '안구건조증',
      en: 'Dry eyes',
      zh: '干眼症',
      ja: 'ドライアイ'
    },
    warn: [
      {
        ko: '용기 끝이 눈이나 손에 닿지 않도록 하세요.',
        en: 'Do not let the tip of the container touch your eye or fingers.',
        zh: '请勿让瓶口接触眼睛或手指。',
        ja: '容器の先が目や指に触れないようにしてください。'
      },
      {
        ko: '일회용 제품은 개봉 후 바로 사용하고 남은 것은 버리세요.',
        en: 'Single-use vials: use right after opening and throw away any leftover.',
        zh: '单剂量包装开启后请立即使用，剩余药液请丢弃。',
        ja: '使い切りタイプは開封後すぐに使用し、残りは捨ててください。'
      },
      {
        ko: '다른 안약과 함께 쓸 경우 5분 이상 간격을 두세요.',
        en: 'If you use other eye drops, wait at least 5 minutes between them.',
        zh: '如同时使用其他滴眼液，请间隔至少5分钟。',
        ja: '他の目薬と併用する場合は5分以上あけてください。'
      }
    ],
    def: { unit: 'drop', qty: 1, freq: '5' },
    general: []
  },
  {
    id: 'fusidic',
    brand: '후시딘연고',
    brandEn: 'Fucidin ointment',
    aliases: ['후시딘', 'fucidin', '연고', '항생제연고'],
    cat: '항생제 연고 (외용)',
    route: 'topical',
    ing: { ko: '퓨시드산나트륨 (항생제 연고)', en: 'Sodium fusidate (antibiotic ointment)', zh: '夫西地酸钠（抗生素软膏）', ja: 'フシジン酸ナトリウム（抗生物質軟膏）' },
    use: {
      ko: '피부의 세균 감염 (상처 감염, 농가진 등)',
      en: 'Bacterial skin infections (infected cuts, impetigo, etc.)',
      zh: '皮肤细菌感染（伤口感染、脓疱疮等）',
      ja: '皮膚の細菌感染症（傷の化膿、とびひなど）'
    },
    warn: [
      {
        ko: '피부에만 사용하세요. 먹지 마세요.',
        en: 'For external use only. Do not swallow.',
        zh: '仅供外用，请勿口服。',
        ja: '外用のみです。飲まないでください。'
      },
      {
        ko: '장기간 사용하지 말고, 1주일 사용해도 낫지 않으면 진료를 받으세요.',
        en: 'Do not use for a long time. If there is no improvement after 1 week, see a doctor.',
        zh: '请勿长期使用。如使用1周后仍未好转，请就医。',
        ja: '長期間使用せず、1週間使用しても改善しない場合は医療機関を受診してください。'
      }
    ],
    def: { freq: '3' },
    general: []
  },
  {
    id: 'centella',
    brand: '마데카솔연고',
    brandEn: 'Madecassol ointment',
    aliases: ['마데카솔', 'madecassol', '연고', '상처'],
    cat: '상처 치료제 (외용)',
    route: 'topical',
    ing: { ko: '센텔라아시아티카 정량추출물', en: 'Centella asiatica extract', zh: '积雪草提取物', ja: 'ツボクサ（センテラ・アジアチカ）エキス' },
    use: {
      ko: '상처 치유 촉진',
      en: 'Wound healing',
      zh: '促进伤口愈合',
      ja: '傷の治療（治りを助ける）'
    },
    warn: [
      {
        ko: '피부에만 사용하세요. 먹지 마세요.',
        en: 'For external use only. Do not swallow.',
        zh: '仅供外用，请勿口服。',
        ja: '外用のみです。飲まないでください。'
      }
    ],
    def: { freq: '2' },
    general: []
  }
];

/* 용량 단위 */
export const UNITS: Record<UnitKey, Unit> = {
  tab:  { label: '정',   ko: '정',   en: ['tablet', 'tablets'],   zh: '片',   ja: '錠',
          half: { ko: '반 정', en: 'half a tablet', zh: '半片', ja: '半錠' } },
  cap:  { label: '캡슐', ko: '캡슐', en: ['capsule', 'capsules'], zh: '粒',   ja: 'カプセル' },
  pkt:  { label: '포',   ko: '포',   en: ['packet', 'packets'],   zh: '包',   ja: '包' },
  ml:   { label: 'mL',   ko: 'mL',   en: ['mL', 'mL'],            zh: '毫升', ja: 'mL' },
  drop: { label: '방울', ko: '방울', en: ['drop', 'drops'],       zh: '滴',   ja: '滴' }
};

/* 복용 시점 (ko/ja는 조사를 포함, en1은 1일 1회일 때 사용) */
export const TIMINGS: Record<TimingKey, Timing> = {
  after_30:      { label: '식후 30분',         ko: '식후 30분에',          en: '30 minutes after meals', en1: '30 minutes after a meal', zh: '饭后30分钟',         ja: '食後30分に' },
  after_now:     { label: '식후 즉시',         ko: '식후 즉시',            en: 'right after meals',      en1: 'right after a meal',      zh: '饭后立即',           ja: '食直後に' },
  before_30:     { label: '식전 30분',         ko: '식전 30분에',          en: '30 minutes before meals', en1: '30 minutes before a meal', zh: '饭前30分钟',        ja: '食前30分に' },
  with_meal:     { label: '식사와 함께',       ko: '식사와 함께',          en: 'with meals',             en1: 'with a meal',             zh: '随餐',               ja: '食事と一緒に' },
  between:       { label: '식간 (식후 약 2시간)', ko: '식간(식후 약 2시간)에', en: 'between meals (about 2 hours after eating)', zh: '两餐之间（饭后约2小时）', ja: '食間（食後約2時間）に' },
  empty:         { label: '공복',              ko: '공복에',               en: 'on an empty stomach',    zh: '空腹',               ja: '空腹時に' },
  morning:       { label: '아침',              ko: '아침에',               en: 'in the morning',         zh: '早上',               ja: '朝に' },
  morning_after: { label: '아침 식후',         ko: '아침 식사 후에',       en: 'after breakfast',        zh: '早餐后',             ja: '朝食後に' },
  bedtime:       { label: '취침 전',           ko: '취침 전에',            en: 'at bedtime',             zh: '睡前',               ja: '就寝前に' },
  after_bed:     { label: '식후 및 취침 전',   ko: '식후 및 취침 전에',    en: 'after meals and at bedtime', zh: '饭后及睡前',       ja: '毎食後および就寝前に' },
  anytime:       { label: '시간 무관',         ko: '시간에 관계없이',      en: 'at any time of day',     zh: '不拘时间',           ja: '時間に関係なく' }
};

/* 공통 주의사항 */
export const GENERAL: Record<GeneralKey, Tr> = {
  drowsy: {
    ko: '졸음이 올 수 있으니 운전이나 기계 조작을 피하세요.',
    en: 'May cause drowsiness. Do not drive or operate machinery.',
    zh: '可能引起嗜睡，服药后请勿驾驶或操作机械。',
    ja: '眠気が出ることがあるので、車の運転や機械の操作は避けてください。'
  },
  no_alcohol: {
    ko: '복용 중에는 술을 마시지 마세요.',
    en: 'Avoid alcohol while taking this medicine.',
    zh: '服药期间请避免饮酒。',
    ja: '服用中は飲酒を避けてください。'
  },
  complete: {
    ko: '증상이 좋아져도 처방된 기간 동안 끝까지 복용하세요.',
    en: 'Finish the full course, even if you feel better.',
    zh: '即使症状好转，也请按疗程全部服完。',
    ja: '症状が良くなっても、処方された日数分を最後まで飲みきってください。'
  },
  missed: {
    ko: '복용을 잊었다면 생각난 즉시 복용하되, 다음 복용 시간이 가까우면 건너뛰세요. 한 번에 2회분을 복용하지 마세요.',
    en: 'If you miss a dose, take it as soon as you remember. If it is almost time for the next dose, skip the missed dose. Never take a double dose.',
    zh: '如果漏服，请在想起时尽快补服；若已接近下次服药时间，则跳过漏服的剂量。切勿一次服用双倍剂量。',
    ja: '飲み忘れた場合は気づいた時にすぐ服用してください。ただし、次の服用時間が近い場合は1回分を飛ばし、2回分を一度に飲まないでください。'
  },
  water: {
    ko: '물을 충분히 드세요.',
    en: 'Drink plenty of water.',
    zh: '请多喝水。',
    ja: '水分を十分にとってください。'
  },
  swallow: {
    ko: '씹거나 부수지 말고 그대로 삼키세요.',
    en: 'Swallow whole. Do not crush or chew.',
    zh: '请整片（粒）吞服，不要咀嚼或掰碎。',
    ja: '噛んだり砕いたりせず、そのまま飲み込んでください。'
  },
  stop_rash: {
    ko: '발진, 가려움, 호흡곤란 등이 나타나면 복용을 중단하고 의사·약사와 상담하세요.',
    en: 'Stop taking and contact a doctor or pharmacist if you get a rash, itching, or difficulty breathing.',
    zh: '如出现皮疹、瘙痒或呼吸困难等症状，请立即停药并咨询医生或药师。',
    ja: '発疹、かゆみ、息苦しさなどが現れた場合は服用を中止し、医師・薬剤師に相談してください。'
  },
  consult: {
    ko: '3일 이상 복용해도 증상이 나아지지 않으면 병원 진료를 받으세요.',
    en: 'If your symptoms do not improve after 3 days, see a doctor.',
    zh: '如服药3天后症状仍未改善，请就医。',
    ja: '3日以上服用しても症状が改善しない場合は、医療機関を受診してください。'
  },
  shake: {
    ko: '사용 전에 잘 흔드세요.',
    en: 'Shake well before use.',
    zh: '使用前请摇匀。',
    ja: '使用前によく振ってください。'
  },
  fridge: {
    ko: '냉장(2~8℃) 보관하세요.',
    en: 'Store in the refrigerator (2–8°C).',
    zh: '请冷藏保存（2~8°C）。',
    ja: '冷蔵庫（2〜8℃）で保管してください。'
  },
  room: {
    ko: '직사광선과 습기를 피해 실온에 보관하세요.',
    en: 'Store at room temperature, away from direct sunlight and moisture.',
    zh: '请在室温下避光、防潮保存。',
    ja: '直射日光と湿気を避け、室温で保管してください。'
  },
  child: {
    ko: '어린이의 손이 닿지 않는 곳에 보관하세요.',
    en: 'Keep out of reach of children.',
    zh: '请放在儿童接触不到的地方。',
    ja: '子どもの手の届かない所に保管してください。'
  }
};

/* 출력 화면 문구 */
export const UI: Record<UiKey, Tr> = {
  title:    { ko: '복약 안내',  en: 'Medication Guide', zh: '用药指导', ja: '服薬のご案内' },
  pharmacy: { ko: '약국',       en: 'Pharmacy',         zh: '药房',     ja: '薬局' },
  purpose:  { ko: '효능',       en: 'Used for',         zh: '用途',     ja: '効能' },
  howto:    { ko: '용법',       en: 'How to use',       zh: '用法用量', ja: '使い方' },
  caution:  { ko: '주의사항',   en: 'Precautions',      zh: '注意事项', ja: '注意事項' },
  product:  { ko: '제품명',     en: 'Product',          zh: '产品名',   ja: '製品名' },
  footer: {
    ko: '궁금한 점이 있으면 약사에게 문의하세요.',
    en: 'If you have any questions, please ask the pharmacist.',
    zh: '如有任何疑问，请咨询药师。',
    ja: 'ご不明な点がございましたら、薬剤師にお尋ねください。'
  }
};
