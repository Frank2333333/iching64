import { liuShiSiGua, baGuaMap, yaoPositionNames, type Gua, type Yao } from '../data/guaxiang';

export interface DivinationResult {
  shangGuaNum: number;
  xiaGuaNum: number;
  dongYaoNum: number;
  shangGuaName: string;
  xiaGuaName: string;
  gua: Gua | null;
  dongYao: {
    position: number;
    name: string;
    text: string;
    xiangZhuan?: string;
    yinYang: 'yin' | 'yang';
  } | null;
  // 体用关系
  tiGua: number; // 体卦（代表自己、主体）
  yongGua: number; // 用卦（代表所测之事、外部环境）
  tiGuaName: string; // 体卦名称
  yongGuaName: string; // 用卦名称
  wuxingRelation: string; // 五行生克关系（兼容旧代码）
  wuxingDetail: {
    relation: string;
    judgment: string;
    level: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
    description: string;
  };
  // 互卦
  huGua: {
    shangGuaNum: number;
    xiaGuaNum: number;
    shangGuaName: string;
    xiaGuaName: string;
    guaId: number;
  } | null;
  // 变卦
  bianGua: {
    shangGuaNum: number;
    xiaGuaNum: number;
    shangGuaName: string;
    xiaGuaName: string;
    guaId: number;
  } | null;
  // 应期推断
  yingQi: {
    description: string;
    timeFrames: string[];
  };
  // AI 解卦结果（由外部填充）
  aiInterpretation?: {
    content: string;
    model: string;
    timestamp: number;
  };
}

// 八卦的五行属性
const baGuaWuXing: Record<string, string> = {
  '乾': '金', '兑': '金',
  '艮': '土', '坤': '土',
  '震': '木', '巽': '木',
  '坎': '水',
  '离': '火'
};

// 二进制值（0-7）到卦名的映射
// 计算方式：下爻×4 + 中爻×2 + 上爻×1（阳=1，阴=0）
const calcToGua: Record<number, string> = {
  0: '坤', 1: '艮', 2: '坎', 3: '巽',
  4: '震', 5: '离', 6: '兑', 7: '乾'
};

export function getYaoFullName(yao: { yinYang: 'yin' | 'yang' }, position: number): string {
  const yaoName = yao.yinYang === 'yang' ? '九' : '六';
  const positionName = yaoPositionNames[position - 1];
  return position === 1 || position === 6
    ? `${positionName}${yaoName}`
    : `${yaoName}${positionName}`;
}

export function determineTiYong(
  dongYaoNum: number,
  shangGuaNum: number,
  xiaGuaNum: number,
  shangGuaName: string,
  xiaGuaName: string
): { tiGua: number; yongGua: number; tiGuaName: string; yongGuaName: string } {
  if (dongYaoNum <= 3) {
    // 动爻在下卦（1-3爻），则下卦为用，上卦为体
    return { tiGua: shangGuaNum, yongGua: xiaGuaNum, tiGuaName: shangGuaName, yongGuaName: xiaGuaName };
  } else {
    // 动爻在上卦（4-6爻），则上卦为用，下卦为体
    return { tiGua: xiaGuaNum, yongGua: shangGuaNum, tiGuaName: xiaGuaName, yongGuaName: shangGuaName };
  }
}

export function getWuxingRelationDetail(tiName: string, yongName: string): DivinationResult['wuxingDetail'] {
  const tiWuxing = baGuaWuXing[tiName] || '';
  const yongWuxing = baGuaWuXing[yongName] || '';

  if (!tiWuxing || !yongWuxing) {
    return {
      relation: '关系不明',
      judgment: '无法判断',
      level: 'neutral',
      description: '卦象五行属性不明，需重新起卦'
    };
  }

  // 比和：同类相助
  if (tiWuxing === yongWuxing) {
    return {
      relation: `${tiWuxing}金比和`,
      judgment: '体用比和，大吉',
      level: 'great',
      description: '同类相助，合作顺畅，势均力敌。内外一致，事情顺利，多得助力。'
    };
  }

  // 体生用：我泄气于外
  if (
    (tiWuxing === '金' && yongWuxing === '水') ||
    (tiWuxing === '水' && yongWuxing === '木') ||
    (tiWuxing === '木' && yongWuxing === '火') ||
    (tiWuxing === '火' && yongWuxing === '土') ||
    (tiWuxing === '土' && yongWuxing === '金')
  ) {
    return {
      relation: `体生用（${tiWuxing}生${yongWuxing}）`,
      judgment: '体生用，小凶',
      level: 'bad',
      description: '我泄气于外，损耗、付出多回报少。虽有成就，但费力耗神，需防精力透支。'
    };
  }

  // 用生体：外部助我
  if (
    (yongWuxing === '金' && tiWuxing === '水') ||
    (yongWuxing === '水' && tiWuxing === '木') ||
    (yongWuxing === '木' && tiWuxing === '火') ||
    (yongWuxing === '火' && tiWuxing === '土') ||
    (yongWuxing === '土' && tiWuxing === '金')
  ) {
    return {
      relation: `用生体（${yongWuxing}生${tiWuxing}）`,
      judgment: '用生体，大吉',
      level: 'great',
      description: '外部助我，事半功倍，贵人扶持。所求易成，多得助力，顺势而行。'
    };
  }

  // 体克用：我能掌控
  if (
    (tiWuxing === '金' && yongWuxing === '木') ||
    (tiWuxing === '木' && yongWuxing === '土') ||
    (tiWuxing === '土' && yongWuxing === '水') ||
    (tiWuxing === '水' && yongWuxing === '火') ||
    (tiWuxing === '火' && yongWuxing === '金')
  ) {
    return {
      relation: `体克用（${tiWuxing}克${yongWuxing}）`,
      judgment: '体克用，吉',
      level: 'good',
      description: '我能掌控，可得但需费力。事情可成，但需要主动争取，小吉之象。'
    };
  }

  // 用克体：外部制我
  if (
    (yongWuxing === '金' && tiWuxing === '木') ||
    (yongWuxing === '木' && tiWuxing === '土') ||
    (yongWuxing === '土' && tiWuxing === '水') ||
    (yongWuxing === '水' && tiWuxing === '火') ||
    (yongWuxing === '火' && tiWuxing === '金')
  ) {
    return {
      relation: `用克体（${yongWuxing}克${tiWuxing}）`,
      judgment: '用克体，大凶',
      level: 'terrible',
      description: '外部制我，受阻、受损、受欺压。事情难成，宜退守，防小人，谨慎为上。'
    };
  }

  return {
    relation: '关系复杂',
    judgment: '需细辨',
    level: 'neutral',
    description: '五行关系复杂，需结合卦辞、爻辞综合判断'
  };
}

export function calculateHuGua(gua: Gua): DivinationResult['huGua'] {
  // 获取六爻的阴阳情况（数组索引0-5对应初爻到上爻）
  const yy = gua.yaos.map(yao => yao.yinYang);

  // 下互卦：本卦第2、3、4爻（数组索引1,2,3）
  // 从下往上：二爻(下)=yy[1], 三爻(中)=yy[2], 四爻(上)=yy[3]
  const xiaHuVal =
    (yy[1] === 'yang' ? 4 : 0) +
    (yy[2] === 'yang' ? 2 : 0) +
    (yy[3] === 'yang' ? 1 : 0);

  // 上互卦：本卦第3、4、5爻（数组索引2,3,4）
  // 从下往上：三爻(下)=yy[2], 四爻(中)=yy[3], 五爻(上)=yy[4]
  const shangHuVal =
    (yy[2] === 'yang' ? 4 : 0) +
    (yy[3] === 'yang' ? 2 : 0) +
    (yy[4] === 'yang' ? 1 : 0);

  const xiaHuGuaName = calcToGua[xiaHuVal];
  const shangHuGuaName = calcToGua[shangHuVal];

  const foundHuGua = liuShiSiGua.find(g =>
    g.shangGua === shangHuGuaName && g.xiaGua === xiaHuGuaName
  );

  if (!foundHuGua) return null;

  return {
    shangGuaNum: shangHuVal + 1, // 转换回1-8范围
    xiaGuaNum: xiaHuVal + 1,
    shangGuaName: shangHuGuaName,
    xiaGuaName: xiaHuGuaName,
    guaId: foundHuGua.id
  };
}

export function calculateBianGua(gua: Gua, dongYaoPosition: number): DivinationResult['bianGua'] {
  // 创建新的六爻数组，将动爻的阴阳互换
  const newYaoArray = [...gua.yaos];
  const changedYaoIndex = dongYaoPosition - 1;
  const originalYao = gua.yaos[changedYaoIndex];

  const newYao: Yao = {
    ...originalYao,
    yinYang: originalYao.yinYang === 'yang' ? 'yin' : 'yang'
  };

  newYaoArray[changedYaoIndex] = newYao;

  // 计算下变卦（初、二、三爻）
  // 从下往上：初爻(下)=yy[0], 二爻(中)=yy[1], 三爻(上)=yy[2]
  const xiaBianVal =
    (newYaoArray[0].yinYang === 'yang' ? 4 : 0) +
    (newYaoArray[1].yinYang === 'yang' ? 2 : 0) +
    (newYaoArray[2].yinYang === 'yang' ? 1 : 0);

  // 计算上变卦（四、五、上爻）
  // 从下往上：四爻(下)=yy[3], 五爻(中)=yy[4], 上爻(上)=yy[5]
  const shangBianVal =
    (newYaoArray[3].yinYang === 'yang' ? 4 : 0) +
    (newYaoArray[4].yinYang === 'yang' ? 2 : 0) +
    (newYaoArray[5].yinYang === 'yang' ? 1 : 0);

  const xiaBianGuaName = calcToGua[xiaBianVal];
  const shangBianGuaName = calcToGua[shangBianVal];

  const foundBianGua = liuShiSiGua.find(g =>
    g.shangGua === shangBianGuaName && g.xiaGua === xiaBianGuaName
  );

  if (!foundBianGua) return null;

  return {
    shangGuaNum: shangBianVal + 1,
    xiaGuaNum: xiaBianVal + 1,
    shangGuaName: shangBianGuaName,
    xiaGuaName: xiaBianGuaName,
    guaId: foundBianGua.id
  };
}

export function calculateYingQi(
  wuxingDetail: { level: 'great' | 'good' | 'neutral' | 'bad' | 'terrible' },
  dongYaoPos: number,
  tiNum: number,
  yongNum: number
): DivinationResult['yingQi'] {
  const timeFrames: string[] = [];
  let description = '';

  if (wuxingDetail.level === 'great') {
    description = '应期较快，好事将近。';
    timeFrames.push(`${dongYaoPos}日或${dongYaoPos}月内`);
    timeFrames.push(`逢${baGuaMap[yongNum]}卦旺相之时`);
  } else if (wuxingDetail.level === 'good') {
    description = '需要主动争取，应期中等。';
    timeFrames.push(`${tiNum + dongYaoPos}日或${dongYaoPos * 2}月内`);
    timeFrames.push(`逢${baGuaMap[tiNum]}卦当令之时`);
  } else if (wuxingDetail.level === 'bad') {
    description = '付出较多，应期较慢。';
    timeFrames.push(`${dongYaoPos * 2}日或${dongYaoPos + 3}月内`);
    timeFrames.push(`待${baGuaMap[yongNum]}气消退之时`);
  } else if (wuxingDetail.level === 'terrible') {
    description = '阻碍较大，应期难定，宜守不宜攻。';
    timeFrames.push(`需待${baGuaMap[tiNum]}卦当令制${baGuaMap[yongNum]}之时`);
    timeFrames.push(`或${12 - dongYaoPos}月后转机`);
  } else {
    description = '应期需结合实际情况判断。';
    timeFrames.push(`${dongYaoPos}日、${dongYaoPos * 2}日或${dongYaoPos * 3}日`);
  }

  if (dongYaoPos === 1) {
    timeFrames.push('事情刚开始，需要耐心等待');
  } else if (dongYaoPos === 6) {
    timeFrames.push('事情将到尽头，结果即将显现');
  }

  return { description, timeFrames };
}

export function calculateMeihuaResult(n1: number, n2: number, n3: number): DivinationResult {
  // 第一个数字除8取余得下卦
  const xiaRemainder = n1 % 8;
  const xiaGuaNum = xiaRemainder === 0 ? 8 : xiaRemainder;
  const xiaGuaName = baGuaMap[xiaGuaNum];

  // 第二个数字除8取余得上卦
  const shangRemainder = n2 % 8;
  const shangGuaNum = shangRemainder === 0 ? 8 : shangRemainder;
  const shangGuaName = baGuaMap[shangGuaNum];

  // 第三个数字除6取余得动爻
  const yaoRemainder = n3 % 6;
  const dongYaoNum = yaoRemainder === 0 ? 6 : yaoRemainder;

  // 查找对应的卦
  const gua = liuShiSiGua.find(
    g => g.shangGua === shangGuaName && g.xiaGua === xiaGuaName
  ) || null;

  // 获取动爻信息
  let dongYao = null;
  if (gua) {
    const yao = gua.yaos[dongYaoNum - 1];
    dongYao = {
      position: dongYaoNum,
      name: getYaoFullName(yao, dongYaoNum),
      text: yao.text,
      xiangZhuan: yao.xiangZhuan,
      yinYang: yao.yinYang,
    };
  }

  // 体用关系
  const { tiGua, yongGua, tiGuaName, yongGuaName } = determineTiYong(
    dongYaoNum, shangGuaNum, xiaGuaNum, shangGuaName, xiaGuaName
  );

  // 五行生克关系
  const wuxingDetail = getWuxingRelationDetail(tiGuaName, yongGuaName);

  // 互卦
  const huGua = gua ? calculateHuGua(gua) : null;

  // 变卦
  const bianGua = gua && dongYao ? calculateBianGua(gua, dongYao.position) : null;

  // 应期
  const yingQi = calculateYingQi(wuxingDetail, dongYaoNum, tiGua, yongGua);

  return {
    shangGuaNum,
    xiaGuaNum,
    dongYaoNum,
    shangGuaName,
    xiaGuaName,
    gua,
    dongYao,
    tiGua,
    yongGua,
    tiGuaName,
    yongGuaName,
    wuxingRelation: wuxingDetail.judgment,
    wuxingDetail,
    huGua,
    bianGua,
    yingQi,
  };
}
