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
    ing: { ko: '아세트아미노펜', en: 'Acetaminophen (Paracetamol)' },
    use: {
      ko: '해열, 진통 (두통, 치통, 생리통, 근육통 등)',
      en: 'Relief of fever and pain (headache, toothache, menstrual pain, muscle pain, etc.)'
    },
    warn: [
      {
        ko: '하루 최대 4,000mg(이 약 8정)을 넘기지 마세요.',
        en: 'Do not take more than 4,000 mg (8 tablets of this medicine) in 24 hours.'
      },
      {
        ko: '아세트아미노펜이 들어 있는 다른 약(종합감기약 등)과 함께 복용하지 마세요.',
        en: 'Do not take with other products containing acetaminophen (e.g., cold medicines).'
      },
      {
        ko: '복용 중 음주하면 간 손상 위험이 커집니다.',
        en: 'Drinking alcohol while taking this medicine increases the risk of liver damage.'
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
    ing: { ko: '이부프로펜', en: 'Ibuprofen' },
    use: {
      ko: '해열, 진통, 소염',
      en: 'Relief of fever, pain and inflammation'
    },
    warn: [
      {
        ko: '위장 장애를 줄이기 위해 식후에 복용하세요.',
        en: 'Take after meals to reduce stomach upset.'
      },
      {
        ko: '위궤양이나 신장 질환이 있거나 임신 중이면 약사에게 알려주세요.',
        en: 'Tell the pharmacist if you have a stomach ulcer or kidney disease, or if you are pregnant.'
      },
      {
        ko: '음주 시 위장 출혈 위험이 커집니다.',
        en: 'Alcohol increases the risk of stomach bleeding.'
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
    ing: { ko: '세티리진염산염', en: 'Cetirizine hydrochloride' },
    use: {
      ko: '알레르기 비염, 두드러기, 가려움',
      en: 'Allergic rhinitis (hay fever), hives, itching'
    },
    warn: [
      {
        ko: '졸음이 올 수 있어 저녁(취침 전)에 복용하는 것이 좋습니다.',
        en: 'It may cause drowsiness, so taking it in the evening (at bedtime) is recommended.'
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
    ing: { ko: '로라타딘', en: 'Loratadine' },
    use: {
      ko: '알레르기 비염, 두드러기, 가려움',
      en: 'Allergic rhinitis (hay fever), hives, itching'
    },
    warn: [
      {
        ko: '졸음은 적은 편이지만 사람에 따라 나타날 수 있습니다.',
        en: 'Drowsiness is uncommon but may occur in some people.'
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
    ing: { ko: '슈도에페드린염산염', en: 'Pseudoephedrine hydrochloride' },
    use: {
      ko: '코막힘 완화',
      en: 'Relief of nasal congestion (stuffy nose)'
    },
    warn: [
      {
        ko: '잠이 오지 않을 수 있으니 취침 직전 복용은 피하세요.',
        en: 'It may cause sleeplessness, so avoid taking it right before bedtime.'
      },
      {
        ko: '고혈압, 심장 질환, 갑상선 질환, 녹내장, 전립선비대증이 있으면 약사에게 알려주세요.',
        en: 'Tell the pharmacist if you have high blood pressure, heart disease, thyroid disease, glaucoma, or an enlarged prostate.'
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
    ing: { ko: '소화효소 복합제', en: 'Digestive enzyme combination' },
    use: {
      ko: '소화불량, 식욕감퇴, 과식',
      en: 'Indigestion, loss of appetite, overeating'
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
    ing: { ko: '인산알루미늄겔 (제산제)', en: 'Aluminum phosphate gel (antacid)' },
    use: {
      ko: '속쓰림, 위산과다, 위통',
      en: 'Heartburn, excess stomach acid, stomach pain'
    },
    warn: [
      {
        ko: '복용 전 포를 손으로 충분히 주물러 섞으세요.',
        en: 'Knead the packet well with your fingers before taking.'
      },
      {
        ko: '다른 약의 흡수를 방해할 수 있으니 다른 약과 1~2시간 간격을 두고 복용하세요.',
        en: 'It may reduce the absorption of other medicines. Take it 1–2 hours apart from other medicines.'
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
    ing: { ko: '알긴산나트륨 복합제', en: 'Sodium alginate combination' },
    use: {
      ko: '위식도역류 증상 (속쓰림, 신물 올라옴)',
      en: 'Symptoms of acid reflux (heartburn, sour taste in the mouth)'
    },
    warn: [
      {
        ko: '다른 약의 흡수를 방해할 수 있으니 다른 약과 1~2시간 간격을 두고 복용하세요.',
        en: 'It may reduce the absorption of other medicines. Take it 1–2 hours apart from other medicines.'
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
    ing: { ko: '디옥타헤드랄스멕타이트', en: 'Diosmectite' },
    use: {
      ko: '설사',
      en: 'Diarrhea'
    },
    warn: [
      {
        ko: '다른 약의 흡수를 방해할 수 있으니 다른 약과 1~2시간 간격을 두고 복용하세요.',
        en: 'It may reduce the absorption of other medicines. Take it 1–2 hours apart from other medicines.'
      },
      {
        ko: '설사로 인한 탈수를 막기 위해 수분을 충분히 섭취하세요.',
        en: 'Drink plenty of fluids to prevent dehydration from diarrhea.'
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
    ing: { ko: '로페라미드염산염', en: 'Loperamide hydrochloride' },
    use: {
      ko: '급성 설사',
      en: 'Acute diarrhea'
    },
    warn: [
      {
        ko: '혈변이 있거나 고열을 동반한 설사에는 복용하지 말고 진료를 받으세요.',
        en: 'Do not take if you have bloody stools or a high fever. See a doctor instead.'
      },
      {
        ko: '변비나 복부 팽만이 생기면 복용을 중단하세요.',
        en: 'Stop taking if constipation or bloating occurs.'
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
    ing: { ko: '비사코딜 (자극성 변비약)', en: 'Bisacodyl (stimulant laxative)' },
    use: {
      ko: '변비',
      en: 'Constipation'
    },
    warn: [
      {
        ko: '장용정이므로 씹거나 부수지 말고 그대로 삼키세요.',
        en: 'This is an enteric-coated tablet. Swallow it whole; do not crush or chew.'
      },
      {
        ko: '우유나 제산제와는 1시간 이상 간격을 두고 복용하세요.',
        en: 'Do not take within 1 hour of drinking milk or taking antacids.'
      },
      {
        ko: '보통 복용 후 6~12시간 뒤에 효과가 나타납니다.',
        en: 'It usually works within 6–12 hours.'
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
    ing: { ko: '부틸스코폴라민브롬화물', en: 'Hyoscine butylbromide (Butylscopolamine)' },
    use: {
      ko: '위경련, 복통',
      en: 'Stomach cramps, abdominal pain'
    },
    warn: [
      {
        ko: '입마름, 시야 흐림, 변비가 나타날 수 있습니다.',
        en: 'Dry mouth, blurred vision, or constipation may occur.'
      },
      {
        ko: '녹내장이나 전립선비대증이 있으면 약사에게 알려주세요.',
        en: 'Tell the pharmacist if you have glaucoma or an enlarged prostate.'
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
    ing: { ko: '아목시실린 (페니실린계 항생제)', en: 'Amoxicillin (penicillin antibiotic)' },
    use: {
      ko: '세균 감염 치료',
      en: 'Treatment of bacterial infections'
    },
    warn: [
      {
        ko: '페니실린 알레르기가 있으면 반드시 알려주세요.',
        en: 'Tell the pharmacist if you are allergic to penicillin.'
      },
      {
        ko: '설사가 생길 수 있습니다. 심하거나 계속되면 상담하세요.',
        en: 'Diarrhea may occur. Consult a doctor or pharmacist if it is severe or does not stop.'
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
    ing: { ko: '아목시실린·클라불란산', en: 'Amoxicillin / Clavulanic acid' },
    use: {
      ko: '세균 감염 치료',
      en: 'Treatment of bacterial infections'
    },
    warn: [
      {
        ko: '위장 장애를 줄이기 위해 식사 직후(또는 식사와 함께) 복용하세요.',
        en: 'Take right after (or with) a meal to reduce stomach upset.'
      },
      {
        ko: '페니실린 알레르기가 있으면 반드시 알려주세요.',
        en: 'Tell the pharmacist if you are allergic to penicillin.'
      },
      {
        ko: '설사가 생길 수 있습니다. 심하거나 계속되면 상담하세요.',
        en: 'Diarrhea may occur. Consult a doctor or pharmacist if it is severe or does not stop.'
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
    ing: { ko: '레바미피드', en: 'Rebamipide' },
    use: {
      ko: '위염, 위궤양 (위 점막 보호)',
      en: 'Gastritis, stomach ulcers (protects the stomach lining)'
    },
    warn: [
      {
        ko: '다른 약과 함께 처방되어 위를 보호하는 역할을 합니다.',
        en: 'It is often prescribed together with other medicines to protect the stomach.'
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
    ing: { ko: '모사프리드시트르산염', en: 'Mosapride citrate' },
    use: {
      ko: '소화불량, 속 더부룩함 (위장 운동 촉진)',
      en: 'Indigestion, bloating (helps the stomach move food along)'
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
    ing: { ko: '에스오메프라졸', en: 'Esomeprazole' },
    use: {
      ko: '위식도역류질환, 위궤양 (위산 분비 억제)',
      en: 'Acid reflux, stomach ulcers (reduces stomach acid)'
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
    ing: { ko: '프레드니솔론 (스테로이드)', en: 'Prednisolone (corticosteroid)' },
    use: {
      ko: '염증 및 알레르기 반응 억제',
      en: 'Reducing inflammation and allergic reactions'
    },
    warn: [
      {
        ko: '임의로 갑자기 중단하지 말고 처방대로 복용하세요.',
        en: 'Do not stop taking it suddenly on your own. Take it exactly as prescribed.'
      },
      {
        ko: '1일 1회 복용하는 경우 아침 식후에 복용하세요.',
        en: 'If you take it once a day, take it in the morning after breakfast.'
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
    ing: { ko: '오셀타미비르', en: 'Oseltamivir' },
    use: {
      ko: '인플루엔자(독감) 치료',
      en: 'Treatment of influenza (flu)'
    },
    warn: [
      {
        ko: '소아·청소년은 복용 후 이상행동이 나타날 수 있으니 보호자가 주의 깊게 지켜보세요(특히 처음 2일).',
        en: 'Children and teenagers may show unusual behavior after taking it. Caregivers should watch them closely, especially for the first 2 days.'
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
    ing: { ko: '암브록솔염산염', en: 'Ambroxol hydrochloride' },
    use: {
      ko: '가래 배출',
      en: 'Clearing phlegm (mucus)'
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
    ing: { ko: '디멘히드리네이트', en: 'Dimenhydrinate' },
    use: {
      ko: '멀미 예방 및 완화',
      en: 'Prevention and relief of motion sickness'
    },
    warn: [
      {
        ko: '차·배·비행기에 타기 30분~1시간 전에 복용하세요.',
        en: 'Take 30 minutes to 1 hour before travel (car, ship, or plane).'
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
    ing: { ko: '히알루론산나트륨 (인공눈물)', en: 'Sodium hyaluronate (artificial tears)' },
    use: {
      ko: '안구건조증',
      en: 'Dry eyes'
    },
    warn: [
      {
        ko: '용기 끝이 눈이나 손에 닿지 않도록 하세요.',
        en: 'Do not let the tip of the container touch your eye or fingers.'
      },
      {
        ko: '일회용 제품은 개봉 후 바로 사용하고 남은 것은 버리세요.',
        en: 'Single-use vials: use right after opening and throw away any leftover.'
      },
      {
        ko: '다른 안약과 함께 쓸 경우 5분 이상 간격을 두세요.',
        en: 'If you use other eye drops, wait at least 5 minutes between them.'
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
    ing: { ko: '퓨시드산나트륨 (항생제 연고)', en: 'Sodium fusidate (antibiotic ointment)' },
    use: {
      ko: '피부의 세균 감염 (상처 감염, 농가진 등)',
      en: 'Bacterial skin infections (infected cuts, impetigo, etc.)'
    },
    warn: [
      {
        ko: '피부에만 사용하세요. 먹지 마세요.',
        en: 'For external use only. Do not swallow.'
      },
      {
        ko: '장기간 사용하지 말고, 1주일 사용해도 낫지 않으면 진료를 받으세요.',
        en: 'Do not use for a long time. If there is no improvement after 1 week, see a doctor.'
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
    ing: { ko: '센텔라아시아티카 정량추출물', en: 'Centella asiatica extract' },
    use: {
      ko: '상처 치유 촉진',
      en: 'Wound healing'
    },
    warn: [
      {
        ko: '피부에만 사용하세요. 먹지 마세요.',
        en: 'For external use only. Do not swallow.'
      }
    ],
    def: { freq: '2' },
    general: []
  }
];

/* 용량 단위 */
export const UNITS: Record<UnitKey, Unit> = {
  tab:  { label: '정',   ko: '정',   en: ['tablet', 'tablets'],
          half: { ko: '반 정', en: 'half a tablet' } },
  cap:  { label: '캡슐', ko: '캡슐', en: ['capsule', 'capsules'] },
  pkt:  { label: '포',   ko: '포',   en: ['packet', 'packets'] },
  ml:   { label: 'mL',   ko: 'mL',   en: ['mL', 'mL'] },
  drop: { label: '방울', ko: '방울', en: ['drop', 'drops'] }
};

/* 복용 시점 (ko는 조사를 포함, en1은 1일 1회일 때 사용) */
export const TIMINGS: Record<TimingKey, Timing> = {
  after_30:      { label: '식후 30분',         ko: '식후 30분에',          en: '30 minutes after meals', en1: '30 minutes after a meal' },
  after_now:     { label: '식후 즉시',         ko: '식후 즉시',            en: 'right after meals',      en1: 'right after a meal' },
  before_30:     { label: '식전 30분',         ko: '식전 30분에',          en: '30 minutes before meals', en1: '30 minutes before a meal' },
  with_meal:     { label: '식사와 함께',       ko: '식사와 함께',          en: 'with meals',             en1: 'with a meal' },
  between:       { label: '식간 (식후 약 2시간)', ko: '식간(식후 약 2시간)에', en: 'between meals (about 2 hours after eating)' },
  empty:         { label: '공복',              ko: '공복에',               en: 'on an empty stomach' },
  morning:       { label: '아침',              ko: '아침에',               en: 'in the morning' },
  morning_after: { label: '아침 식후',         ko: '아침 식사 후에',       en: 'after breakfast' },
  bedtime:       { label: '취침 전',           ko: '취침 전에',            en: 'at bedtime' },
  after_bed:     { label: '식후 및 취침 전',   ko: '식후 및 취침 전에',    en: 'after meals and at bedtime' },
  anytime:       { label: '시간 무관',         ko: '시간에 관계없이',      en: 'at any time of day' }
};

/* 공통 주의사항 */
export const GENERAL: Record<GeneralKey, Tr> = {
  drowsy: {
    ko: '졸음이 올 수 있으니 운전이나 기계 조작을 피하세요.',
    en: 'May cause drowsiness. Do not drive or operate machinery.'
  },
  no_alcohol: {
    ko: '복용 중에는 술을 마시지 마세요.',
    en: 'Avoid alcohol while taking this medicine.'
  },
  complete: {
    ko: '증상이 좋아져도 처방된 기간 동안 끝까지 복용하세요.',
    en: 'Finish the full course, even if you feel better.'
  },
  missed: {
    ko: '복용을 잊었다면 생각난 즉시 복용하되, 다음 복용 시간이 가까우면 건너뛰세요. 한 번에 2회분을 복용하지 마세요.',
    en: 'If you miss a dose, take it as soon as you remember. If it is almost time for the next dose, skip the missed dose. Never take a double dose.'
  },
  water: {
    ko: '물을 충분히 드세요.',
    en: 'Drink plenty of water.'
  },
  swallow: {
    ko: '씹거나 부수지 말고 그대로 삼키세요.',
    en: 'Swallow whole. Do not crush or chew.'
  },
  stop_rash: {
    ko: '발진, 가려움, 호흡곤란 등이 나타나면 복용을 중단하고 의사·약사와 상담하세요.',
    en: 'Stop taking and contact a doctor or pharmacist if you get a rash, itching, or difficulty breathing.'
  },
  consult: {
    ko: '3일 이상 복용해도 증상이 나아지지 않으면 병원 진료를 받으세요.',
    en: 'If your symptoms do not improve after 3 days, see a doctor.'
  },
  shake: {
    ko: '사용 전에 잘 흔드세요.',
    en: 'Shake well before use.'
  },
  fridge: {
    ko: '냉장(2~8℃) 보관하세요.',
    en: 'Store in the refrigerator (2–8°C).'
  },
  room: {
    ko: '직사광선과 습기를 피해 실온에 보관하세요.',
    en: 'Store at room temperature, away from direct sunlight and moisture.'
  },
  child: {
    ko: '어린이의 손이 닿지 않는 곳에 보관하세요.',
    en: 'Keep out of reach of children.'
  }
};

/* 출력 화면 문구 */
export const UI: Record<UiKey, Tr> = {
  title:    { ko: '복약 안내',  en: 'Medication Guide' },
  pharmacy: { ko: '약국',       en: 'Pharmacy' },
  purpose:  { ko: '효능',       en: 'Used for' },
  howto:    { ko: '용법',       en: 'How to use' },
  caution:  { ko: '주의사항',   en: 'Precautions' },
  product:  { ko: '제품명',     en: 'Product' },
  footer: {
    ko: '궁금한 점이 있으면 약사에게 문의하세요.',
    en: 'If you have any questions, please ask the pharmacist.'
  }
};
