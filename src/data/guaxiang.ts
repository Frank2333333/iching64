// 易经64卦完整数据结构
export interface Yao {
  position: number;
  yinYang: 'yin' | 'yang';
  text: string;
  xiangZhuan?: string;
}

export interface Gua {
  id: number;
  name: string;
  chineseName: string;
  pronunciation: string;
  guaci: string;
  tuanZhuan: string;
  daXiangZhuan: string;
  yaos: Yao[];
  shangGua: string;
  xiaGua: string;
  duiGua: number;
  zongGua: number;
  huGua: number;
  guaBian: number[];
  shiWei: {
    zhong: boolean;
    description: string;
  };
  symbol: string;
  meaning: string;
  wuxing: string;
}

export const baGua: Record<string, { name: string; symbol: string; nature: string; wuxing: string; position: string }> = {
  '乾': { name: '乾', symbol: '☰', nature: '天', wuxing: '金', position: '南' },
  '坤': { name: '坤', symbol: '☷', nature: '地', wuxing: '土', position: '北' },
  '震': { name: '震', symbol: '☳', nature: '雷', wuxing: '木', position: '东北' },
  '巽': { name: '巽', symbol: '☴', nature: '风', wuxing: '木', position: '东南' },
  '坎': { name: '坎', symbol: '☵', nature: '水', wuxing: '水', position: '西' },
  '离': { name: '离', symbol: '☲', nature: '火', wuxing: '火', position: '东' },
  '艮': { name: '艮', symbol: '☶', nature: '山', wuxing: '土', position: '西北' },
  '兑': { name: '兑', symbol: '☱', nature: '泽', wuxing: '金', position: '东南' },
};

export const liuShiSiGua: Gua[] = [
  {
    id: 1, name: '乾为天', chineseName: '乾', pronunciation: 'qián',
    guaci: '元亨利贞。',
    tuanZhuan: '大哉乾元，万物资始，乃统天。云行雨施，品物流形。大明终始，六位时成，时乘六龙以御天。乾道变化，各正性命，保合太和，乃利贞。首出庶物，万国咸宁。',
    daXiangZhuan: '天行健，君子以自强不息。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '潜龙勿用。', xiangZhuan: '潜龙勿用，阳在下也。' },
      { position: 2, yinYang: 'yang', text: '见龙在田，利见大人。', xiangZhuan: '见龙在田，德施普也。' },
      { position: 3, yinYang: 'yang', text: '君子终日乾乾，夕惕若，厉无咎。', xiangZhuan: '终日乾乾，反复道也。' },
      { position: 4, yinYang: 'yang', text: '或跃在渊，无咎。', xiangZhuan: '或跃在渊，进无咎也。' },
      { position: 5, yinYang: 'yang', text: '飞龙在天，利见大人。', xiangZhuan: '飞龙在天，大人造也。' },
      { position: 6, yinYang: 'yang', text: '亢龙有悔。', xiangZhuan: '亢龙有悔，盈不可久也。' },
    ],
    shangGua: '乾', xiaGua: '乾', duiGua: 2, zongGua: 1, huGua: 1,
    guaBian: [44, 33, 12, 20, 23, 1],
    shiWei: { zhong: true, description: '乾卦六爻皆阳，纯阳之卦。九五得中得正，为君位，最为吉利。' },
    symbol: '☰☰', meaning: '乾为天，象征刚健、创造、主动。天行健，君子以自强不息。', wuxing: '金'
  },
  {
    id: 2, name: '坤为地', chineseName: '坤', pronunciation: 'kūn',
    guaci: '元亨，利牝马之贞。君子有攸往，先迷后得主，利西南得朋，东北丧朋。安贞，吉。',
    tuanZhuan: '至哉坤元，万物资生，乃顺承天。坤厚载物，德合无疆。含弘光大，品物咸亨。牝马地类，行地无疆，柔顺利贞。君子攸行，先迷失道，后顺得常。西南得朋，乃与类行；东北丧朋，乃终有庆。安贞之吉，应地无疆。',
    daXiangZhuan: '地势坤，君子以厚德载物。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '履霜，坚冰至。', xiangZhuan: '履霜坚冰，阴始凝也。' },
      { position: 2, yinYang: 'yin', text: '直方大，不习无不利。', xiangZhuan: '六二之动，直以方也。' },
      { position: 3, yinYang: 'yin', text: '含章可贞。或从王事，无成有终。', xiangZhuan: '含章可贞，以时发也。' },
      { position: 4, yinYang: 'yin', text: '括囊，无咎无誉。', xiangZhuan: '括囊无咎，慎不害也。' },
      { position: 5, yinYang: 'yin', text: '黄裳，元吉。', xiangZhuan: '黄裳元吉，文在中也。' },
      { position: 6, yinYang: 'yin', text: '龙战于野，其血玄黄。', xiangZhuan: '龙战于野，其道穷也。' },
    ],
    shangGua: '坤', xiaGua: '坤', duiGua: 1, zongGua: 2, huGua: 2,
    guaBian: [24, 19, 11, 34, 43, 2],
    shiWei: { zhong: true, description: '坤卦六爻皆阴，纯阴之卦。六二得中得正，为臣位，柔顺守正。' },
    symbol: '☷☷', meaning: '坤为地，象征柔顺、承载、被动。地势坤，君子以厚德载物。', wuxing: '土'
  },
  {
    id: 3, name: '水雷屯', chineseName: '屯', pronunciation: 'zhūn',
    guaci: '元亨利贞，勿用有攸往，利建侯。',
    tuanZhuan: '屯，刚柔始交而难生，动乎险中，大亨贞。雷雨之动满盈，天造草昧，宜建侯而不宁。',
    daXiangZhuan: '云雷屯，君子以经纶。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '磐桓，利居贞，利建侯。', xiangZhuan: '虽磐桓，志行正也。' },
      { position: 2, yinYang: 'yin', text: '屯如邅如，乘马班如。匪寇婚媾，女子贞不字，十年乃字。', xiangZhuan: '六二之难，乘刚也。' },
      { position: 3, yinYang: 'yin', text: '即鹿无虞，惟入于林中。君子几不如舍，往吝。', xiangZhuan: '即鹿无虞，以从禽也。' },
      { position: 4, yinYang: 'yang', text: '乘马班如，求婚媾，往吉，无不利。', xiangZhuan: '求而往，明也。' },
      { position: 5, yinYang: 'yang', text: '屯其膏，小贞吉，大贞凶。', xiangZhuan: '屯其膏，施未光也。' },
      { position: 6, yinYang: 'yin', text: '乘马班如，泣血涟如。', xiangZhuan: '泣血涟如，何可长也。' },
    ],
    shangGua: '坎', xiaGua: '震', duiGua: 50, zongGua: 4, huGua: 63,
    guaBian: [17, 42, 24, 27, 51, 3],
    shiWei: { zhong: false, description: '屯卦初九得正，六二得正，九五得正。卦处始生之难，宜守正待时。' },
    symbol: '☵☳', meaning: '屯象征万物始生之难，如草木初生，艰难萌生。', wuxing: '水'
  },
  {
    id: 4, name: '山水蒙', chineseName: '蒙', pronunciation: 'méng',
    guaci: '亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。利贞。',
    tuanZhuan: '蒙，山下有险，险而止，蒙。蒙亨，以亨行时中也。匪我求童蒙，童蒙求我，志应也。初筮告，以刚中也。再三渎，渎则不告，渎蒙也。蒙以养正，圣功也。',
    daXiangZhuan: '山下出泉，蒙；君子以果行育德。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '发蒙，利用刑人，用说桎梏，以往吝。', xiangZhuan: '利用刑人，以正法也。' },
      { position: 2, yinYang: 'yang', text: '包蒙吉。纳妇吉，子克家。', xiangZhuan: '子克家，刚柔接也。' },
      { position: 3, yinYang: 'yin', text: '勿用取女，见金夫，不有躬，无攸利。', xiangZhuan: '勿用取女，行不顺也。' },
      { position: 4, yinYang: 'yin', text: '困蒙，吝。', xiangZhuan: '困蒙之吝，独远实也。' },
      { position: 5, yinYang: 'yin', text: '童蒙，吉。', xiangZhuan: '童蒙之吉，顺以巽也。' },
      { position: 6, yinYang: 'yang', text: '击蒙，不利为寇，利御寇。', xiangZhuan: '利用御寇，上下顺也。' },
    ],
    shangGua: '艮', xiaGua: '坎', duiGua: 49, zongGua: 3, huGua: 60,
    guaBian: [41, 23, 8, 13, 52, 4],
    shiWei: { zhong: true, description: '蒙卦九二得中得正，为治蒙之主。卦处蒙昧之时，宜启蒙教化。' },
    symbol: '☶☵', meaning: '蒙象征蒙昧无知，如山下有泉，需要启蒙教化。', wuxing: '土'
  },
  {
    id: 5, name: '水天需', chineseName: '需', pronunciation: 'xū',
    guaci: '有孚，光亨，贞吉。利涉大川。',
    tuanZhuan: '需，须也，险在前也。刚健而不陷，其义不困穷矣。需有孚，光亨，贞吉，位乎天位，以正中也。利涉大川，往有功也。',
    daXiangZhuan: '云上于天，需；君子以饮食宴乐。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '需于郊，利用恒，无咎。', xiangZhuan: '需于郊，不犯难行也。' },
      { position: 2, yinYang: 'yang', text: '需于沙，小有言，终吉。', xiangZhuan: '需于沙，衍在中也。' },
      { position: 3, yinYang: 'yang', text: '需于泥，致寇至。', xiangZhuan: '需于泥，灾在外也。' },
      { position: 4, yinYang: 'yin', text: '需于血，出自穴。', xiangZhuan: '需于血，顺以听也。' },
      { position: 5, yinYang: 'yang', text: '需于酒食，贞吉。', xiangZhuan: '酒食贞吉，以中正也。' },
      { position: 6, yinYang: 'yin', text: '入于穴，有不速之客三人来，敬之终吉。', xiangZhuan: '不速之客来，敬之终吉。' },
    ],
    shangGua: '坎', xiaGua: '乾', duiGua: 35, zongGua: 6, huGua: 57,
    guaBian: [48, 28, 60, 63, 5, 5],
    shiWei: { zhong: true, description: '需卦九五得中得正，为需待之主。卦处需待之时，宜守正待时。' },
    symbol: '☵☰', meaning: '需象征等待，云上于天，待时而降。', wuxing: '水'
  },
  {
    id: 6, name: '天水讼', chineseName: '讼', pronunciation: 'sòng',
    guaci: '有孚，窒惕，中吉，终凶。利见大人，不利涉大川。',
    tuanZhuan: '讼，上刚下险，险而健，讼。讼有孚，窒惕，中吉，刚来而得中也。终凶，讼不可成也。利见大人，尚中正也。不利涉大川，入于渊也。',
    daXiangZhuan: '天与水违行，讼；君子以作事谋始。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '不永所事，小有言，终吉。', xiangZhuan: '不永所事，讼不可长也。' },
      { position: 2, yinYang: 'yang', text: '不克讼，归而逋，其邑人三百户，无眚。', xiangZhuan: '不克讼，归逋窜也。' },
      { position: 3, yinYang: 'yin', text: '食旧德，贞厉，终吉。或从王事，无成。', xiangZhuan: '食旧德，从上吉也。' },
      { position: 4, yinYang: 'yang', text: '不克讼，复即命，渝安贞，吉。', xiangZhuan: '复即命，渝安贞，不失也。' },
      { position: 5, yinYang: 'yang', text: '讼元吉。', xiangZhuan: '讼元吉，以中正也。' },
      { position: 6, yinYang: 'yang', text: '或锡之鞶带，终朝三褫之。', xiangZhuan: '以讼受服，亦不足敬也。' },
    ],
    shangGua: '乾', xiaGua: '坎', duiGua: 36, zongGua: 5, huGua: 58,
    guaBian: [44, 33, 12, 20, 6, 6],
    shiWei: { zhong: true, description: '讼卦九二、九五皆得中。卦处争讼之时，宜止讼息争。' },
    symbol: '☰☵', meaning: '讼象征争讼，天与水违行，意见相违。', wuxing: '金'
  },
  {
    id: 7, name: '地水师', chineseName: '师', pronunciation: 'shī',
    guaci: '贞，丈人吉，无咎。',
    tuanZhuan: '师，众也，贞正也，能以众正，可以王矣。刚中而应，行险而顺，以此毒天下，而民从之，吉又何咎矣。',
    daXiangZhuan: '地中有水，师；君子以容民畜众。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '师出以律，否臧凶。', xiangZhuan: '师出以律，失律凶也。' },
      { position: 2, yinYang: 'yang', text: '在师中，吉，无咎，王三锡命。', xiangZhuan: '在师中吉，承天宠也。' },
      { position: 3, yinYang: 'yin', text: '师或舆尸，凶。', xiangZhuan: '师或舆尸，大无功也。' },
      { position: 4, yinYang: 'yin', text: '师左次，无咎。', xiangZhuan: '左次无咎，未失常也。' },
      { position: 5, yinYang: 'yin', text: '田有禽，利执言，无咎。长子帅师，弟子舆尸，贞凶。', xiangZhuan: '长子帅师，以中行也。' },
      { position: 6, yinYang: 'yin', text: '大君有命，开国承家，小人勿用。', xiangZhuan: '大君有命，以正功也。' },
    ],
    shangGua: '坤', xiaGua: '坎', duiGua: 13, zongGua: 8, huGua: 24,
    guaBian: [19, 11, 45, 46, 7, 7],
    shiWei: { zhong: true, description: '师卦九二得中，为统师之主。卦处行师之时，宜用老将。' },
    symbol: '☷☵', meaning: '师象征军队，地中有水，聚众之象。', wuxing: '土'
  },
  {
    id: 8, name: '水地比', chineseName: '比', pronunciation: 'bǐ',
    guaci: '吉。原筮元永贞，无咎。不宁方来，后夫凶。',
    tuanZhuan: '比，吉也，比，辅也，下顺从也。原筮元永贞，无咎，以刚中也。不宁方来，上下应也。后夫凶，其道穷也。',
    daXiangZhuan: '地上有水，比；先王以建万国，亲诸侯。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '有孚比之，无咎。有孚盈缶，终来有它，吉。', xiangZhuan: '比之初六，有它吉也。' },
      { position: 2, yinYang: 'yin', text: '比之自内，贞吉。', xiangZhuan: '比之自内，不自失也。' },
      { position: 3, yinYang: 'yin', text: '比之匪人。', xiangZhuan: '比之匪人，不亦伤乎！' },
      { position: 4, yinYang: 'yin', text: '外比之，贞吉。', xiangZhuan: '外比于贤，以从上也。' },
      { position: 5, yinYang: 'yang', text: '显比，王用三驱，失前禽。邑人不诫，吉。', xiangZhuan: '显比之吉，位正中也。' },
      { position: 6, yinYang: 'yin', text: '比之无首，凶。', xiangZhuan: '比之无首，无所终也。' },
    ],
    shangGua: '坎', xiaGua: '坤', duiGua: 14, zongGua: 7, huGua: 39,
    guaBian: [48, 3, 20, 35, 8, 8],
    shiWei: { zhong: true, description: '比卦九五得中得正，为亲比之主。卦处亲比之时，宜择善而附。' },
    symbol: '☵☷', meaning: '比象征亲比，地上有水，水亲比于地。', wuxing: '水'
  },
  {
    id: 9, name: '风天小畜', chineseName: '小畜', pronunciation: 'xiǎo chù',
    guaci: '亨。密云不雨，自我西郊。',
    tuanZhuan: '小畜，柔得位而上下应之，曰小畜。健而巽，刚中而志行，乃亨。密云不雨，尚往也。自我西郊，施未行也。',
    daXiangZhuan: '风行天上，小畜；君子以懿文德。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '复自道，何其咎，吉。', xiangZhuan: '复自道，其义吉也。' },
      { position: 2, yinYang: 'yang', text: '牵复，吉。', xiangZhuan: '牵复在中，亦不自失也。' },
      { position: 3, yinYang: 'yang', text: '舆说辐，夫妻反目。', xiangZhuan: '夫妻反目，不能正室也。' },
      { position: 4, yinYang: 'yin', text: '有孚，血去惕出，无咎。', xiangZhuan: '有孚惕出，上合志也。' },
      { position: 5, yinYang: 'yang', text: '有孚挛如，富以其邻。', xiangZhuan: '有孚挛如，不独富也。' },
      { position: 6, yinYang: 'yin', text: '既雨既处，尚德载，妇贞厉。月几望，君子征凶。', xiangZhuan: '既雨既处，德积载也。' },
    ],
    shangGua: '巽', xiaGua: '乾', duiGua: 34, zongGua: 10, huGua: 57,
    guaBian: [44, 33, 26, 41, 9, 9],
    shiWei: { zhong: false, description: '小畜卦六四得正，为畜聚之主。卦处小有蓄积之时，宜文德修养。' },
    symbol: '☴☰', meaning: '小畜象征小有蓄积，风行天上，密云不雨。', wuxing: '木'
  },
  {
    id: 10, name: '天泽履', chineseName: '履', pronunciation: 'lǚ',
    guaci: '履虎尾，不咥人，亨。',
    tuanZhuan: '履，柔履刚也。说而应乎乾，是以履虎尾，不咥人，亨。刚中正，履帝位而不疚，光明也。',
    daXiangZhuan: '上天下泽，履；君子以辨上下，定民志。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '素履，往无咎。', xiangZhuan: '素履之往，独行愿也。' },
      { position: 2, yinYang: 'yin', text: '履道坦坦，幽人贞吉。', xiangZhuan: '幽人贞吉，中不自乱也。' },
      { position: 3, yinYang: 'yin', text: '眇能视，跛能履，履虎尾，咥人，凶。武人为于大君。', xiangZhuan: '咥人之凶，位不当也。' },
      { position: 4, yinYang: 'yang', text: '履虎尾，愬愬，终吉。', xiangZhuan: '愬愬终吉，志行也。' },
      { position: 5, yinYang: 'yang', text: '夬履，贞厉。', xiangZhuan: '夬履贞厉，位正当也。' },
      { position: 6, yinYang: 'yang', text: '视履考祥，其旋元吉。', xiangZhuan: '元吉在上，大有庆也。' },
    ],
    shangGua: '乾', xiaGua: '兑', duiGua: 43, zongGua: 9, huGua: 58,
    guaBian: [1, 33, 12, 20, 10, 10],
    shiWei: { zhong: true, description: '履卦九二、九五皆得中。卦处践履之时，宜谨慎行事。' },
    symbol: '☰☱', meaning: '履象征践履，上天下泽，辨上下之分。', wuxing: '金'
  },
  {
    id: 11, name: '地天泰', chineseName: '泰', pronunciation: 'tài',
    guaci: '小往大来，吉亨。',
    tuanZhuan: '泰，小往大来，吉亨，则是天地交而万物通也，上下交而其志同也。内阳而外阴，内健而外顺，内君子而外小人，君子道长，小人道消也。',
    daXiangZhuan: '天地交，泰；后以财成天地之道，辅相天地之宜，以左右民。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '拔茅茹，以其汇，征吉。', xiangZhuan: '拔茅征吉，志在外也。' },
      { position: 2, yinYang: 'yang', text: '包荒，用冯河，不遐遗，朋亡，得尚于中行。', xiangZhuan: '包荒得尚于中行，以光大也。' },
      { position: 3, yinYang: 'yang', text: '无平不陂，无往不复，艰贞无咎。勿恤其孚，于食有福。', xiangZhuan: '无往不复，天地际也。' },
      { position: 4, yinYang: 'yin', text: '翩翩不富，以其邻，不戒以孚。', xiangZhuan: '翩翩不富，皆失实也。' },
      { position: 5, yinYang: 'yin', text: '帝乙归妹，以祉元吉。', xiangZhuan: '以祉元吉，中以行愿也。' },
      { position: 6, yinYang: 'yin', text: '城复于隍，勿用师。自邑告命，贞吝。', xiangZhuan: '城复于隍，其命乱也。' },
    ],
    shangGua: '坤', xiaGua: '乾', duiGua: 12, zongGua: 12, huGua: 55,
    guaBian: [19, 34, 26, 35, 11, 11],
    shiWei: { zhong: true, description: '泰卦九二、九五皆得中。卦处通泰之时，天地交而万物通。' },
    symbol: '☷☰', meaning: '泰象征通泰，天地交合，万物亨通。', wuxing: '土'
  },
  {
    id: 12, name: '天地否', chineseName: '否', pronunciation: 'pǐ',
    guaci: '否之匪人，不利君子贞，大往小来。',
    tuanZhuan: '否之匪人，不利君子贞，大往小来，则是天地不交而万物不通也，上下不交而天下无邦也。内阴而外阳，内柔而外刚，内小人而外君子，小人道长，君子道消也。',
    daXiangZhuan: '天地不交，否；君子以俭德辟难，不可荣以禄。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '拔茅茹，以其汇，贞吉亨。', xiangZhuan: '拔茅贞吉，志在君也。' },
      { position: 2, yinYang: 'yin', text: '包承，小人吉，大人否，亨。', xiangZhuan: '大人否亨，不乱群也。' },
      { position: 3, yinYang: 'yin', text: '包羞。', xiangZhuan: '包羞，位不当也。' },
      { position: 4, yinYang: 'yang', text: '有命无咎，畴离祉。', xiangZhuan: '有命无咎，志行也。' },
      { position: 5, yinYang: 'yang', text: '休否，大人吉。其亡其亡，系于苞桑。', xiangZhuan: '大人之吉，位正当也。' },
      { position: 6, yinYang: 'yang', text: '倾否，先否后喜。', xiangZhuan: '否终则倾，何可长也。' },
    ],
    shangGua: '乾', xiaGua: '坤', duiGua: 11, zongGua: 11, huGua: 44,
    guaBian: [1, 33, 45, 43, 12, 12],
    shiWei: { zhong: true, description: '否卦九四、九五皆得中。卦处否塞之时，天地不交，宜俭德辟难。' },
    symbol: '☰☷', meaning: '否象征否塞，天地不交，万物不通。', wuxing: '金'
  },
  {
    id: 13, name: '天火同人', chineseName: '同人', pronunciation: 'tóng rén',
    guaci: '同人于野，亨。利涉大川，利君子贞。',
    tuanZhuan: '同人，柔得位得中而应乎乾，曰同人。同人曰：同人于野，亨，利涉大川，乾行也。文明以健，中正而应，君子正也。唯君子为能通天下之志。',
    daXiangZhuan: '天与火，同人；君子以类族辨物。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '同人于门，无咎。', xiangZhuan: '出门同人，又谁咎也。' },
      { position: 2, yinYang: 'yin', text: '同人于宗，吝。', xiangZhuan: '同人于宗，吝道也。' },
      { position: 3, yinYang: 'yang', text: '伏戎于莽，升其高陵，三岁不兴。', xiangZhuan: '伏戎于莽，敌刚也。' },
      { position: 4, yinYang: 'yang', text: '乘其墉，弗克攻，吉。', xiangZhuan: '乘其墉，义弗克也。' },
      { position: 5, yinYang: 'yang', text: '同人，先号咷而后笑，大师克相遇。', xiangZhuan: '同人之先，以中直也。' },
      { position: 6, yinYang: 'yang', text: '同人于郊，无悔。', xiangZhuan: '同人于郊，志未得也。' },
    ],
    shangGua: '乾', xiaGua: '离', duiGua: 7, zongGua: 13, huGua: 57,
    guaBian: [1, 49, 30, 14, 13, 13],
    shiWei: { zhong: true, description: '同人卦六二得中得正，为和同之主。卦处和同之时，宜类族辨物。' },
    symbol: '☰☲', meaning: '同人象征和同于人，天与火同明，志同则合。', wuxing: '金'
  },
  {
    id: 14, name: '火天大有', chineseName: '大有', pronunciation: 'dà yǒu',
    guaci: '元亨。',
    tuanZhuan: '大有，柔得尊位，大中而上下应之，曰大有。其德刚健而文明，应乎天而时行，是以元亨。',
    daXiangZhuan: '火在天上，大有；君子以遏恶扬善，顺天休命。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '无交害，匪咎，艰则无咎。', xiangZhuan: '大有初九，无交害也。' },
      { position: 2, yinYang: 'yang', text: '大车以载，有攸往，无咎。', xiangZhuan: '大车以载，积中不败也。' },
      { position: 3, yinYang: 'yang', text: '公用亨于天子，小人弗克。', xiangZhuan: '公用亨于天子，小人害也。' },
      { position: 4, yinYang: 'yang', text: '匪其彭，无咎。', xiangZhuan: '匪其彭，无咎，明辨皙也。' },
      { position: 5, yinYang: 'yin', text: '厥孚交如，威如，吉。', xiangZhuan: '厥孚交如，信以发志也。' },
      { position: 6, yinYang: 'yang', text: '自天佑之，吉无不利。', xiangZhuan: '大有上吉，自天佑也。' },
    ],
    shangGua: '离', xiaGua: '乾', duiGua: 8, zongGua: 14, huGua: 58,
    guaBian: [50, 30, 38, 49, 14, 14],
    shiWei: { zhong: true, description: '大有卦六五得中，为富有之主。卦处大有之时，宜遏恶扬善。' },
    symbol: '☲☰', meaning: '大有象征大有所获，火在天上，光明盛大。', wuxing: '火'
  },
  {
    id: 15, name: '地山谦', chineseName: '谦', pronunciation: 'qiān',
    guaci: '亨，君子有终。',
    tuanZhuan: '谦，亨，天道下济而光明，地道卑而上行。天道亏盈而益谦，地道变盈而流谦，鬼神害盈而福谦，人道恶盈而好谦。谦尊而光，卑而不可逾，君子之终也。',
    daXiangZhuan: '地中有山，谦；君子以裒多益寡，称物平施。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '谦谦君子，用涉大川，吉。', xiangZhuan: '谦谦君子，卑以自牧也。' },
      { position: 2, yinYang: 'yang', text: '鸣谦，贞吉。', xiangZhuan: '鸣谦贞吉，中心得也。' },
      { position: 3, yinYang: 'yang', text: '劳谦，君子有终，吉。', xiangZhuan: '劳谦君子，万民服也。' },
      { position: 4, yinYang: 'yin', text: '无不利，撝谦。', xiangZhuan: '无不利，撝谦，不违则也。' },
      { position: 5, yinYang: 'yin', text: '不富以其邻，利用侵伐，无不利。', xiangZhuan: '利用侵伐，征不服也。' },
      { position: 6, yinYang: 'yin', text: '鸣谦，利用行师，征邑国。', xiangZhuan: '鸣谦，志未得也。' },
    ],
    shangGua: '坤', xiaGua: '艮', duiGua: 16, zongGua: 15, huGua: 39,
    guaBian: [19, 62, 52, 46, 15, 15],
    shiWei: { zhong: true, description: '谦卦九三得正，为谦德之主。卦处谦退之时，六爻皆吉。' },
    symbol: '☷☶', meaning: '谦象征谦虚，地中有山，内高外卑。', wuxing: '土'
  },
  {
    id: 16, name: '雷地豫', chineseName: '豫', pronunciation: 'yù',
    guaci: '利建侯行师。',
    tuanZhuan: '豫，刚应而志行，顺以动，豫。豫顺以动，故天地如之，而况建侯行师乎？天地以顺动，故日月不过而四时不忒。圣人以顺动，则刑罚清而民服。豫之时义大矣哉！',
    daXiangZhuan: '雷出地奋，豫；先王以作乐崇德，殷荐之上帝，以配祖考。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '鸣豫，凶。', xiangZhuan: '初六鸣豫，志穷凶也。' },
      { position: 2, yinYang: 'yin', text: '介于石，不终日，贞吉。', xiangZhuan: '不终日贞吉，以中正也。' },
      { position: 3, yinYang: 'yin', text: '盱豫，悔。迟有悔。', xiangZhuan: '盱豫有悔，位不当也。' },
      { position: 4, yinYang: 'yang', text: '由豫，大有得，勿疑，朋盍簪。', xiangZhuan: '由豫大有得，志大行也。' },
      { position: 5, yinYang: 'yin', text: '贞疾，恒不死。', xiangZhuan: '六五贞疾，乘刚也。' },
      { position: 6, yinYang: 'yin', text: '冥豫，成有渝，无咎。', xiangZhuan: '冥豫在上，何可长也。' },
    ],
    shangGua: '震', xiaGua: '坤', duiGua: 15, zongGua: 16, huGua: 40,
    guaBian: [24, 45, 51, 35, 16, 16],
    shiWei: { zhong: true, description: '豫卦六二得中得正，为和乐之主。卦处和乐之时，宜顺以动。' },
    symbol: '☳☷', meaning: '豫象征喜乐，雷出地奋，万物舒畅。', wuxing: '木'
  },
  {
    id: 17, name: '泽雷随', chineseName: '随', pronunciation: 'suí',
    guaci: '元亨利贞，无咎。',
    tuanZhuan: '随，刚来而下柔，动而说，随。大亨贞，无咎，而天下随时。随时之义大矣哉！',
    daXiangZhuan: '泽中有雷，随；君子以向晦入宴息。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '官有渝，贞吉。出门交有功。', xiangZhuan: '官有渝，从正吉也。' },
      { position: 2, yinYang: 'yin', text: '系小子，失丈夫。', xiangZhuan: '系小子，弗兼与也。' },
      { position: 3, yinYang: 'yin', text: '系丈夫，失小子。随有求得，利居贞。', xiangZhuan: '系丈夫，志舍下也。' },
      { position: 4, yinYang: 'yang', text: '随有获，贞凶。有孚在道，以明，何咎。', xiangZhuan: '随有获，其义凶也。' },
      { position: 5, yinYang: 'yang', text: '孚于嘉，吉。', xiangZhuan: '孚于嘉吉，位正中也。' },
      { position: 6, yinYang: 'yin', text: '拘系之，乃从维之，王用亨于西山。', xiangZhuan: '拘系之，上穷也。' },
    ],
    shangGua: '兑', xiaGua: '震', duiGua: 18, zongGua: 18, huGua: 53,
    guaBian: [58, 45, 3, 51, 17, 17],
    shiWei: { zhong: true, description: '随卦九五得中得正，为随从之主。卦处随从之时，宜随时而动。' },
    symbol: '☱☳', meaning: '随象征随从，泽中有雷，动而喜悦。', wuxing: '金'
  },
  {
    id: 18, name: '山风蛊', chineseName: '蛊', pronunciation: 'gǔ',
    guaci: '元亨，利涉大川。先甲三日，后甲三日。',
    tuanZhuan: '蛊，刚上而柔下，巽而止，蛊。蛊元亨，而天下治也。利涉大川，往有事也。先甲三日，后甲三日，终则有始，天行也。',
    daXiangZhuan: '山下有风，蛊；君子以振民育德。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '干父之蛊，有子考无咎，厉终吉。', xiangZhuan: '干父之蛊，意承考也。' },
      { position: 2, yinYang: 'yang', text: '干母之蛊，不可贞。', xiangZhuan: '干母之蛊，得中道也。' },
      { position: 3, yinYang: 'yang', text: '干父之蛊，小有悔，无大咎。', xiangZhuan: '干父之蛊，终无咎也。' },
      { position: 4, yinYang: 'yin', text: '裕父之蛊，往见吝。', xiangZhuan: '裕父之蛊，往未得也。' },
      { position: 5, yinYang: 'yin', text: '干父之蛊，用誉。', xiangZhuan: '干父用誉，承以德也。' },
      { position: 6, yinYang: 'yang', text: '不事王侯，高尚其事。', xiangZhuan: '不事王侯，志可则也。' },
    ],
    shangGua: '艮', xiaGua: '巽', duiGua: 17, zongGua: 17, huGua: 52,
    guaBian: [26, 41, 57, 18, 18, 18],
    shiWei: { zhong: true, description: '蛊卦九二、上九得中。卦处蛊坏之时，宜振民育德。' },
    symbol: '☶☴', meaning: '蛊象征蛊坏，山下有风，物坏虫生。', wuxing: '土'
  },
  {
    id: 19, name: '地泽临', chineseName: '临', pronunciation: 'lín',
    guaci: '元亨利贞，至于八月有凶。',
    tuanZhuan: '临，刚浸而长，说而顺，刚中而应，大亨以正，天之道也。至于八月有凶，消不久也。',
    daXiangZhuan: '泽上有地，临；君子以教思无穷，容保民无疆。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '咸临，贞吉。', xiangZhuan: '咸临贞吉，志行正也。' },
      { position: 2, yinYang: 'yang', text: '咸临，吉，无不利。', xiangZhuan: '咸临吉无不利，未顺命也。' },
      { position: 3, yinYang: 'yin', text: '甘临，无攸利。既忧之，无咎。', xiangZhuan: '甘临，位不当也。' },
      { position: 4, yinYang: 'yin', text: '至临，无咎。', xiangZhuan: '至临无咎，位当也。' },
      { position: 5, yinYang: 'yin', text: '知临，大君之宜，吉。', xiangZhuan: '大君之宜，行中之谓也。' },
      { position: 6, yinYang: 'yin', text: '敦临，吉，无咎。', xiangZhuan: '敦临之吉，志在内也。' },
    ],
    shangGua: '坤', xiaGua: '兑', duiGua: 20, zongGua: 20, huGua: 24,
    guaBian: [11, 45, 41, 46, 19, 19],
    shiWei: { zhong: true, description: '临卦九二得中，为临莅之主。卦处临莅之时，宜教思无穷。' },
    symbol: '☷☱', meaning: '临象征临莅，泽上有地，居高临下。', wuxing: '土'
  },
  {
    id: 20, name: '风地观', chineseName: '观', pronunciation: 'guān',
    guaci: '盥而不荐，有孚颙若。',
    tuanZhuan: '大观在上，顺而巽，中正以观天下。观，盥而不荐，有孚颙若，下观而化也。观天之神道，而四时不忒。圣人以神道设教，而天下服矣。',
    daXiangZhuan: '风行地上，观；先王以省方观民设教。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '童观，小人无咎，君子吝。', xiangZhuan: '初六童观，小人道也。' },
      { position: 2, yinYang: 'yin', text: '窥观，利女贞。', xiangZhuan: '窥观女贞，亦可丑也。' },
      { position: 3, yinYang: 'yin', text: '观我生，进退。', xiangZhuan: '观我生进退，未失正也。' },
      { position: 4, yinYang: 'yin', text: '观国之光，利用宾于王。', xiangZhuan: '观国之光，尚宾也。' },
      { position: 5, yinYang: 'yang', text: '观我生，君子无咎。', xiangZhuan: '观我生，观民也。' },
      { position: 6, yinYang: 'yang', text: '观其生，君子无咎。', xiangZhuan: '观其生，志未平也。' },
    ],
    shangGua: '巽', xiaGua: '坤', duiGua: 19, zongGua: 19, huGua: 44,
    guaBian: [57, 33, 8, 20, 20, 20],
    shiWei: { zhong: true, description: '观卦九五得中得正，为观瞻之主。卦处观瞻之时，宜省方观民。' },
    symbol: '☴☷', meaning: '观象征观瞻，风行地上，遍观万物。', wuxing: '木'
  },
  {
    id: 21, name: '火雷噬嗑', chineseName: '噬嗑', pronunciation: 'shì kè',
    guaci: '亨，利用狱。',
    tuanZhuan: '颐中有物，曰噬嗑。噬嗑而亨，刚柔分，动而明，雷电合而章。柔得中而上行，虽不当位，利用狱也。',
    daXiangZhuan: '雷电，噬嗑；先王以明罚敕法。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '屦校灭趾，无咎。', xiangZhuan: '屦校灭趾，不行也。' },
      { position: 2, yinYang: 'yin', text: '噬肤灭鼻，无咎。', xiangZhuan: '噬肤灭鼻，乘刚也。' },
      { position: 3, yinYang: 'yin', text: '噬腊肉，遇毒，小吝，无咎。', xiangZhuan: '遇毒，位不当也。' },
      { position: 4, yinYang: 'yang', text: '噬干胏，得金矢，利艰贞，吉。', xiangZhuan: '利艰贞吉，未光也。' },
      { position: 5, yinYang: 'yin', text: '噬干肉，得黄金，贞厉，无咎。', xiangZhuan: '贞厉无咎，得当也。' },
      { position: 6, yinYang: 'yang', text: '何校灭耳，凶。', xiangZhuan: '何校灭耳，聪不明也。' },
    ],
    shangGua: '离', xiaGua: '震', duiGua: 22, zongGua: 22, huGua: 39,
    guaBian: [50, 55, 30, 21, 21, 21],
    shiWei: { zhong: true, description: '噬嗑卦六五得中，为用刑之主。卦处用刑之时，宜明罚敕法。' },
    symbol: '☲☳', meaning: '噬嗑象征咬合，雷电交加，明罚敕法。', wuxing: '火'
  },
  {
    id: 22, name: '山火贲', chineseName: '贲', pronunciation: 'bì',
    guaci: '亨，小利有攸往。',
    tuanZhuan: '贲，亨，柔来而文刚，故亨。分刚上而文柔，故小利有攸往。天文也，文明以止，人文也。观乎天文，以察时变；观乎人文，以化成天下。',
    daXiangZhuan: '山下有火，贲；君子以明庶政，无敢折狱。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '贲其趾，舍车而徒。', xiangZhuan: '舍车而徒，义弗乘也。' },
      { position: 2, yinYang: 'yin', text: '贲其须。', xiangZhuan: '贲其须，与上兴也。' },
      { position: 3, yinYang: 'yang', text: '贲如濡如，永贞吉。', xiangZhuan: '永贞之吉，终莫之陵也。' },
      { position: 4, yinYang: 'yin', text: '贲如皤如，白马翰如，匪寇婚媾。', xiangZhuan: '六四当位疑也。' },
      { position: 5, yinYang: 'yin', text: '贲于丘园，束帛戋戋，吝，终吉。', xiangZhuan: '六五之吉，有喜也。' },
      { position: 6, yinYang: 'yang', text: '白贲，无咎。', xiangZhuan: '白贲无咎，上得志也。' },
    ],
    shangGua: '艮', xiaGua: '离', duiGua: 21, zongGua: 21, huGua: 52,
    guaBian: [26, 30, 56, 22, 22, 22],
    shiWei: { zhong: false, description: '贲卦六五得中，为文饰之主。卦处文饰之时，宜明庶政。' },
    symbol: '☶☲', meaning: '贲象征文饰，山下有火，文明以止。', wuxing: '土'
  },
  {
    id: 23, name: '山地剥', chineseName: '剥', pronunciation: 'bō',
    guaci: '不利有攸往。',
    tuanZhuan: '剥，剥也，柔变刚也。不利有攸往，小人长也。顺而止之，观象也。君子尚消息盈虚，天行也。',
    daXiangZhuan: '山附于地，剥；上以厚下安宅。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '剥床以足，蔑贞凶。', xiangZhuan: '剥床以足，以灭下也。' },
      { position: 2, yinYang: 'yin', text: '剥床以辨，蔑贞凶。', xiangZhuan: '剥床以辨，未有与也。' },
      { position: 3, yinYang: 'yin', text: '剥之，无咎。', xiangZhuan: '剥之无咎，失上下也。' },
      { position: 4, yinYang: 'yin', text: '剥床以肤，凶。', xiangZhuan: '剥床以肤，切近灾也。' },
      { position: 5, yinYang: 'yin', text: '贯鱼，以宫人宠，无不利。', xiangZhuan: '以宫人宠，终无尤也。' },
      { position: 6, yinYang: 'yang', text: '硕果不食，君子得舆，小人剥庐。', xiangZhuan: '君子得舆，民所载也。' },
    ],
    shangGua: '艮', xiaGua: '坤', duiGua: 24, zongGua: 24, huGua: 8,
    guaBian: [52, 15, 39, 23, 23, 23],
    shiWei: { zhong: false, description: '剥卦上九得正，为剥落之极。卦处剥落之时，宜厚下安宅。' },
    symbol: '☶☷', meaning: '剥象征剥落，山附于地，阴长阳消。', wuxing: '土'
  },
  {
    id: 24, name: '地雷复', chineseName: '复', pronunciation: 'fù',
    guaci: '亨，出入无疾，朋来无咎。反复其道，七日来复，利有攸往。',
    tuanZhuan: '复，亨，刚反，动而以顺行，是以出入无疾，朋来无咎。反复其道，七日来复，天行也。利有攸往，刚长也。复其见天地之心乎？',
    daXiangZhuan: '雷在地中，复；先王以至日闭关，商旅不行，后不省方。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '不远复，无祗悔，元吉。', xiangZhuan: '不远之复，以修身也。' },
      { position: 2, yinYang: 'yin', text: '休复，吉。', xiangZhuan: '休复之吉，以下仁也。' },
      { position: 3, yinYang: 'yin', text: '频复，厉无咎。', xiangZhuan: '频复之厉，义无咎也。' },
      { position: 4, yinYang: 'yin', text: '中行独复。', xiangZhuan: '中行独复，以从道也。' },
      { position: 5, yinYang: 'yin', text: '敦复，无悔。', xiangZhuan: '敦复无悔，中以自考也。' },
      { position: 6, yinYang: 'yin', text: '迷复，凶，有灾眚。用行师，终有大败，以其国君，凶，至于十年，不克征。', xiangZhuan: '迷复之凶，反君道也。' },
    ],
    shangGua: '坤', xiaGua: '震', duiGua: 23, zongGua: 23, huGua: 2,
    guaBian: [11, 16, 3, 24, 24, 24],
    shiWei: { zhong: false, description: '复卦初九得正，为回复之始。卦处回复之时，一阳来复，宜修身养性。' },
    symbol: '☷☳', meaning: '复象征回复，雷在地中，一阳来复。', wuxing: '土'
  },
  {
    id: 25, name: '天雷无妄', chineseName: '无妄', pronunciation: 'wú wàng',
    guaci: '元亨利贞。其匪正有眚，不利有攸往。',
    tuanZhuan: '无妄，刚自外来而为主于内。动而健，刚中而应，大亨以正，天之命也。其匪正有眚，不利有攸往，无妄之往，何之矣？天命不佑，行矣哉？',
    daXiangZhuan: '天下雷行，物与无妄；先王以茂对时，育万物。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '无妄，往吉。', xiangZhuan: '无妄之往，得志也。' },
      { position: 2, yinYang: 'yin', text: '不耕获，不菑畬，则利有攸往。', xiangZhuan: '不耕获，未富也。' },
      { position: 3, yinYang: 'yin', text: '无妄之灾，或系之牛，行人之得，邑人之灾。', xiangZhuan: '行人得牛，邑人灾也。' },
      { position: 4, yinYang: 'yang', text: '可贞，无咎。', xiangZhuan: '可贞无咎，固有之也。' },
      { position: 5, yinYang: 'yang', text: '无妄之疾，勿药有喜。', xiangZhuan: '无妄之药，不可试也。' },
      { position: 6, yinYang: 'yin', text: '无妄，行有眚，无攸利。', xiangZhuan: '无妄之行，穷之灾也。' },
    ],
    shangGua: '乾', xiaGua: '震', duiGua: 26, zongGua: 26, huGua: 44,
    guaBian: [1, 17, 21, 25, 25, 25],
    shiWei: { zhong: true, description: '无妄卦九五、六二皆得中。卦处无妄之时，宜守正不妄。' },
    symbol: '☰☳', meaning: '无妄象征不妄为，天下雷行，物与无妄。', wuxing: '金'
  },
  {
    id: 26, name: '山天大畜', chineseName: '大畜', pronunciation: 'dà xù',
    guaci: '利贞，不家食吉，利涉大川。',
    tuanZhuan: '大畜，刚健笃实，辉光日新其德。刚上而尚贤，能止健，大正也。不家食吉，养贤也。利涉大川，应乎天也。',
    daXiangZhuan: '天在山中，大畜；君子以多识前言往行，以畜其德。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '有厉利已。', xiangZhuan: '有厉利已，不犯灾也。' },
      { position: 2, yinYang: 'yang', text: '舆说輹。', xiangZhuan: '舆说輹，中无尤也。' },
      { position: 3, yinYang: 'yang', text: '良马逐，利艰贞。日闲舆卫，利有攸往。', xiangZhuan: '利有攸往，上合志也。' },
      { position: 4, yinYang: 'yin', text: '童牛之牿，元吉。', xiangZhuan: '六四元吉，有喜也。' },
      { position: 5, yinYang: 'yin', text: '豮豕之牙，吉。', xiangZhuan: '六五之吉，有庆也。' },
      { position: 6, yinYang: 'yang', text: '何天之衢，亨。', xiangZhuan: '何天之衢，道大行也。' },
    ],
    shangGua: '艮', xiaGua: '乾', duiGua: 25, zongGua: 25, huGua: 33,
    guaBian: [22, 41, 9, 26, 26, 26],
    shiWei: { zhong: true, description: '大畜卦九二、六五皆得中。卦处大畜之时，宜畜德养贤。' },
    symbol: '☶☰', meaning: '大畜象征大蓄积，天在山中，蓄积深厚。', wuxing: '土'
  },
  {
    id: 27, name: '山雷颐', chineseName: '颐', pronunciation: 'yí',
    guaci: '贞吉，观颐，自求口实。',
    tuanZhuan: '颐，贞吉，养正则吉也。观颐，观其所养也；自求口实，观其自养也。天地养万物，圣人养贤以及万民，颐之时义大矣哉！',
    daXiangZhuan: '山下有雷，颐；君子以慎言语，节饮食。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '舍尔灵龟，观我朵颐，凶。', xiangZhuan: '观我朵颐，亦不足贵也。' },
      { position: 2, yinYang: 'yin', text: '颠颐，拂经于丘颐，征凶。', xiangZhuan: '六二征凶，行失类也。' },
      { position: 3, yinYang: 'yin', text: '拂颐，贞凶，十年勿用，无攸利。', xiangZhuan: '十年勿用，道大悖也。' },
      { position: 4, yinYang: 'yin', text: '颠颐，吉。虎视眈眈，其欲逐逐，无咎。', xiangZhuan: '颠颐之吉，上施光也。' },
      { position: 5, yinYang: 'yin', text: '拂经，居贞吉，不可涉大川。', xiangZhuan: '居贞之吉，顺以从上也。' },
      { position: 6, yinYang: 'yang', text: '由颐，厉吉，利涉大川。', xiangZhuan: '由颐厉吉，大有庆也。' },
    ],
    shangGua: '艮', xiaGua: '震', duiGua: 28, zongGua: 28, huGua: 2,
    guaBian: [52, 3, 27, 27, 27, 27],
    shiWei: { zhong: true, description: '颐卦六五得中，为养正之主。卦处颐养之时，宜慎言语节饮食。' },
    symbol: '☶☳', meaning: '颐象征颐养，山下有雷，动而养正。', wuxing: '土'
  },
  {
    id: 28, name: '泽风大过', chineseName: '大过', pronunciation: 'dà guò',
    guaci: '栋桡，利有攸往，亨。',
    tuanZhuan: '大过，大者过也。栋桡，本末弱也。刚过而中，巽而说行，利有攸往，乃亨。大过之时义大矣哉！',
    daXiangZhuan: '泽灭木，大过；君子以独立不惧，遁世无闷。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '藉用白茅，无咎。', xiangZhuan: '藉用白茅，柔在下也。' },
      { position: 2, yinYang: 'yang', text: '枯杨生稊，老夫得其女妻，无不利。', xiangZhuan: '老夫女妻，过以相与也。' },
      { position: 3, yinYang: 'yang', text: '栋桡，凶。', xiangZhuan: '栋桡之凶，不可以有辅也。' },
      { position: 4, yinYang: 'yang', text: '栋隆，吉，有它吝。', xiangZhuan: '栋隆之吉，不桡乎下也。' },
      { position: 5, yinYang: 'yang', text: '枯杨生华，老妇得其士夫，无咎无誉。', xiangZhuan: '枯杨生华，何可久也。' },
      { position: 6, yinYang: 'yin', text: '过涉灭顶，凶，无咎。', xiangZhuan: '过涉之凶，不可咎也。' },
    ],
    shangGua: '兑', xiaGua: '巽', duiGua: 27, zongGua: 27, huGua: 44,
    guaBian: [58, 9, 28, 28, 28, 28],
    shiWei: { zhong: true, description: '大过卦九二、九五皆得中。卦处大过之时，宜独立不惧。' },
    symbol: '☱☴', meaning: '大过象征大过越，泽灭木，刚过而中。', wuxing: '金'
  },
  {
    id: 29, name: '坎为水', chineseName: '坎', pronunciation: 'kǎn',
    guaci: '习坎，有孚，维心亨，行有尚。',
    tuanZhuan: '习坎，重险也。水流而不盈，行险而不失其信。维心亨，乃以刚中也。行有尚，往有功也。天险不可升也，地险山川丘陵也，王公设险以守其国，险之时用大矣哉！',
    daXiangZhuan: '水洊至，习坎；君子以常德行，习教事。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '习坎，入于坎窞，凶。', xiangZhuan: '习坎入坎，失道凶也。' },
      { position: 2, yinYang: 'yang', text: '坎有险，求小得。', xiangZhuan: '求小得，未出中也。' },
      { position: 3, yinYang: 'yin', text: '来之坎坎，险且枕，入于坎窞，勿用。', xiangZhuan: '来之坎坎，终无功也。' },
      { position: 4, yinYang: 'yang', text: '樽酒簋贰，用缶，纳约自牖，终无咎。', xiangZhuan: '樽酒簋贰，刚柔际也。' },
      { position: 5, yinYang: 'yin', text: '坎不盈，祗既平，无咎。', xiangZhuan: '坎不盈，中未大也。' },
      { position: 6, yinYang: 'yin', text: '系用徽纆，寘于丛棘，三岁不得，凶。', xiangZhuan: '上六失道，凶三岁也。' },
    ],
    shangGua: '坎', xiaGua: '坎', duiGua: 30, zongGua: 29, huGua: 29,
    guaBian: [48, 60, 3, 29, 29, 29],
    shiWei: { zhong: true, description: '坎卦九二、九五皆得中。卦处重险之时，宜常德行习教事。' },
    symbol: '☵☵', meaning: '坎象征险陷，水洊至，重险之象。', wuxing: '水'
  },
  {
    id: 30, name: '离为火', chineseName: '离', pronunciation: 'lí',
    guaci: '利贞，亨，畜牝牛，吉。',
    tuanZhuan: '离，丽也。日月丽乎天，百谷草木丽乎土，重明以丽乎正，乃化成天下。柔丽乎中正，故亨，是以畜牝牛吉也。',
    daXiangZhuan: '明两作，离；大人以继明照于四方。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '履错然，敬之，无咎。', xiangZhuan: '履错之敬，以辟咎也。' },
      { position: 2, yinYang: 'yin', text: '黄离，元吉。', xiangZhuan: '黄离元吉，得中道也。' },
      { position: 3, yinYang: 'yang', text: '日昃之离，不鼓缶而歌，则大耋之嗟，凶。', xiangZhuan: '日昃之离，何可久也。' },
      { position: 4, yinYang: 'yang', text: '突如其来如，焚如，死如，弃如。', xiangZhuan: '突如其来如，无所容也。' },
      { position: 5, yinYang: 'yin', text: '出涕沱若，戚嗟若，吉。', xiangZhuan: '六五之吉，离王公也。' },
      { position: 6, yinYang: 'yang', text: '王用出征，有嘉折首，获匪其丑，无咎。', xiangZhuan: '王用出征，以正邦也。' },
    ],
    shangGua: '离', xiaGua: '离', duiGua: 29, zongGua: 30, huGua: 30,
    guaBian: [50, 49, 21, 30, 30, 30],
    shiWei: { zhong: true, description: '离卦六二得中得正，为附丽之主。卦处重明之时，宜继明照四方。' },
    symbol: '☲☲', meaning: '离象征附丽，明两作，光明相继。', wuxing: '火'
  },
  {
    id: 31, name: '泽山咸', chineseName: '咸', pronunciation: 'xián',
    guaci: '亨，利贞，取女吉。',
    tuanZhuan: '咸，感也。柔上而刚下，二气感应以相与，止而说，男下女，是以亨利贞，取女吉也。天地感而万物化生，圣人感人心而天下和平。观其所感，而天地万物之情可见矣！',
    daXiangZhuan: '山上有泽，咸；君子以虚受人。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '咸其拇。', xiangZhuan: '咸其拇，志在外也。' },
      { position: 2, yinYang: 'yin', text: '咸其腓，凶，居吉。', xiangZhuan: '虽凶居吉，顺不害也。' },
      { position: 3, yinYang: 'yang', text: '咸其股，执其随，往吝。', xiangZhuan: '咸其股，亦不处也。' },
      { position: 4, yinYang: 'yang', text: '贞吉悔亡，憧憧往来，朋从尔思。', xiangZhuan: '贞吉悔亡，未感害也。' },
      { position: 5, yinYang: 'yang', text: '咸其脢，无悔。', xiangZhuan: '咸其脢，志末也。' },
      { position: 6, yinYang: 'yin', text: '咸其辅颊舌。', xiangZhuan: '咸其辅颊舌，滕口说也。' },
    ],
    shangGua: '兑', xiaGua: '艮', duiGua: 32, zongGua: 32, huGua: 44,
    guaBian: [58, 52, 31, 31, 31, 31],
    shiWei: { zhong: true, description: '咸卦九三、上六得中。卦处感应之时，宜虚受人。' },
    symbol: '☱☶', meaning: '咸象征感应，山上有泽，二气感应。', wuxing: '金'
  },
  {
    id: 32, name: '雷风恒', chineseName: '恒', pronunciation: 'héng',
    guaci: '亨，无咎，利贞，利有攸往。',
    tuanZhuan: '恒，久也。刚上而柔下，雷风相与，巽而动，刚柔皆应，恒。恒亨，无咎，利贞，久于其道也。天地之道，恒久而不已也。利有攸往，终则有始也。日月得天而能久照，四时变化而能久成，圣人久于其道而天下化成。观其所恒，而天地万物之情可见矣！',
    daXiangZhuan: '雷风，恒；君子以立不易方。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '浚恒，贞凶，无攸利。', xiangZhuan: '浚恒之凶，始求深也。' },
      { position: 2, yinYang: 'yang', text: '悔亡。', xiangZhuan: '九二悔亡，能久中也。' },
      { position: 3, yinYang: 'yang', text: '不恒其德，或承之羞，贞吝。', xiangZhuan: '不恒其德，无所容也。' },
      { position: 4, yinYang: 'yang', text: '田无禽。', xiangZhuan: '久非其位，安得禽也。' },
      { position: 5, yinYang: 'yin', text: '恒其德，贞，妇人吉，夫子凶。', xiangZhuan: '妇人贞吉，从一而终也。' },
      { position: 6, yinYang: 'yin', text: '振恒，凶。', xiangZhuan: '振恒在上，大无功也。' },
    ],
    shangGua: '震', xiaGua: '巽', duiGua: 31, zongGua: 31, huGua: 40,
    guaBian: [16, 57, 32, 32, 32, 32],
    shiWei: { zhong: true, description: '恒卦九二得中，为恒久之主。卦处恒久之时，宜立不易方。' },
    symbol: '☳☴', meaning: '恒象征恒久，雷风相与，长久不变。', wuxing: '木'
  },
  {
    id: 33, name: '天山遁', chineseName: '遁', pronunciation: 'dùn',
    guaci: '亨，小利贞。',
    tuanZhuan: '遁亨，遁而亨也。刚当位而应，与时行也。小利贞，浸而长也。遁之时义大矣哉！',
    daXiangZhuan: '天下有山，遁；君子以远小人，不恶而严。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '遁尾，厉，勿用有攸往。', xiangZhuan: '遁尾之厉，不往何灾也。' },
      { position: 2, yinYang: 'yin', text: '执之用黄牛之革，莫之胜说。', xiangZhuan: '执用黄牛，固志也。' },
      { position: 3, yinYang: 'yang', text: '系遁，有疾厉，畜臣妾吉。', xiangZhuan: '系遁之厉，有疾惫也。' },
      { position: 4, yinYang: 'yang', text: '好遁，君子吉，小人否。', xiangZhuan: '君子好遁，小人否也。' },
      { position: 5, yinYang: 'yang', text: '嘉遁，贞吉。', xiangZhuan: '嘉遁贞吉，以正志也。' },
      { position: 6, yinYang: 'yang', text: '肥遁，无不利。', xiangZhuan: '肥遁无不利，无所疑也。' },
    ],
    shangGua: '乾', xiaGua: '艮', duiGua: 34, zongGua: 34, huGua: 44,
    guaBian: [13, 12, 44, 44, 44, 44],
    shiWei: { zhong: true, description: '遁卦九五得中得正，为遁避之主。卦处遁避之时，宜远小人。' },
    symbol: '☰☶', meaning: '遁象征退避，天下有山，君子远小人。', wuxing: '金'
  },
  {
    id: 34, name: '雷天大壮', chineseName: '大壮', pronunciation: 'dà zhuàng',
    guaci: '利贞。',
    tuanZhuan: '大壮，大者壮也。刚以动，故壮。大壮利贞，大者正也。正大而天地之情可见矣！',
    daXiangZhuan: '雷在天上，大壮；君子以非礼弗履。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '壮于趾，征凶，有孚。', xiangZhuan: '壮于趾，其孚穷也。' },
      { position: 2, yinYang: 'yang', text: '贞吉。', xiangZhuan: '九二贞吉，以中也。' },
      { position: 3, yinYang: 'yang', text: '小人用壮，君子用罔，贞厉。羝羊触藩，羸其角。', xiangZhuan: '小人用壮，君子罔也。' },
      { position: 4, yinYang: 'yang', text: '贞吉悔亡，藩决不羸，壮于大舆之輹。', xiangZhuan: '藩决不羸，尚往也。' },
      { position: 5, yinYang: 'yin', text: '丧羊于易，无悔。', xiangZhuan: '丧羊于易，位不当也。' },
      { position: 6, yinYang: 'yin', text: '羝羊触藩，不能退，不能遂，无攸利，艰则吉。', xiangZhuan: '不能退，不能遂，不祥也。' },
    ],
    shangGua: '震', xiaGua: '乾', duiGua: 33, zongGua: 33, huGua: 32,
    guaBian: [14, 11, 34, 34, 34, 34],
    shiWei: { zhong: true, description: '大壮卦九二、九四得中。卦处大壮之时，宜守正不妄动。' },
    symbol: '☳☰', meaning: '大壮象征强盛，雷在天上，声势浩大。', wuxing: '木'
  },
  {
    id: 35, name: '火地晋', chineseName: '晋', pronunciation: 'jìn',
    guaci: '康侯用锡马蕃庶，昼日三接。',
    tuanZhuan: '晋，进也。明出地上，顺而丽乎大明，柔进而上行。是以康侯用锡马蕃庶，昼日三接也。',
    daXiangZhuan: '明出地上，晋；君子以自昭明德。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '晋如摧如，贞吉。罔孚，裕无咎。', xiangZhuan: '晋如摧如，独行正也。' },
      { position: 2, yinYang: 'yin', text: '晋如愁如，贞吉。受兹介福，于其王母。', xiangZhuan: '受兹介福，以中正也。' },
      { position: 3, yinYang: 'yin', text: '众允，悔亡。', xiangZhuan: '众允之，志上行也。' },
      { position: 4, yinYang: 'yang', text: '晋如鼫鼠，贞厉。', xiangZhuan: '鼫鼠贞厉，位不当也。' },
      { position: 5, yinYang: 'yin', text: '悔亡，失得勿恤，往吉无不利。', xiangZhuan: '失得勿恤，往有庆也。' },
      { position: 6, yinYang: 'yang', text: '晋其角，维用伐邑，厉吉无咎，贞吝。', xiangZhuan: '维用伐邑，道未光也。' },
    ],
    shangGua: '离', xiaGua: '坤', duiGua: 36, zongGua: 36, huGua: 39,
    guaBian: [56, 21, 35, 35, 35, 35],
    shiWei: { zhong: true, description: '晋卦六二、六五得中，六五得正。卦处晋进之时，宜自昭明德。' },
    symbol: '☲☷', meaning: '晋象征进升，明出地上，光明上进。', wuxing: '火'
  },
  {
    id: 36, name: '地火明夷', chineseName: '明夷', pronunciation: 'míng yí',
    guaci: '利艰贞。',
    tuanZhuan: '明入地中，明夷。内文明而外柔顺，以蒙大难，文王以之。利艰贞，晦其明也，内难而能正其志，箕子以之。',
    daXiangZhuan: '明入地中，明夷；君子以莅众，用晦而明。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '明夷于飞，垂其翼。君子于行，三日不食，有攸往，主人有言。', xiangZhuan: '君子于行，义不食也。' },
      { position: 2, yinYang: 'yin', text: '明夷，夷于左股，用拯马壮，吉。', xiangZhuan: '六二之吉，顺以则也。' },
      { position: 3, yinYang: 'yang', text: '明夷于南狩，得其大首，不可疾贞。', xiangZhuan: '南狩之志，乃大得也。' },
      { position: 4, yinYang: 'yin', text: '入于左腹，获明夷之心，出于门庭。', xiangZhuan: '入于左腹，获心意也。' },
      { position: 5, yinYang: 'yin', text: '箕子之明夷，利贞。', xiangZhuan: '箕子之贞，明不可息也。' },
      { position: 6, yinYang: 'yin', text: '不明晦，初登于天，后入于地。', xiangZhuan: '初登于天，照四国也。' },
    ],
    shangGua: '坤', xiaGua: '离', duiGua: 35, zongGua: 35, huGua: 40,
    guaBian: [55, 22, 36, 36, 36, 36],
    shiWei: { zhong: true, description: '明夷卦六二、六五得中。卦处明伤之时，宜晦其明。' },
    symbol: '☷☲', meaning: '明夷象征光明受伤，明入地中，韬光养晦。', wuxing: '火'
  },
  {
    id: 37, name: '风火家人', chineseName: '家人', pronunciation: 'jiā rén',
    guaci: '利女贞。',
    tuanZhuan: '家人，女正位乎内，男正位乎外，男女正，天地之大义也。家人有严君焉，父母之谓也。父父，子子，兄兄，弟弟，夫夫，妇妇，而家道正，正家而天下定矣。',
    daXiangZhuan: '风自火出，家人；君子以言有物而行有恒。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '闲有家，悔亡。', xiangZhuan: '闲有家，志未变也。' },
      { position: 2, yinYang: 'yin', text: '无攸遂，在中馈，贞吉。', xiangZhuan: '六二之吉，顺以巽也。' },
      { position: 3, yinYang: 'yang', text: '家人嗃嗃，悔厉吉；妇子嘻嘻，终吝。', xiangZhuan: '家人嗃嗃，未失也。' },
      { position: 4, yinYang: 'yin', text: '富家，大吉。', xiangZhuan: '富家大吉，顺在位也。' },
      { position: 5, yinYang: 'yang', text: '王假有家，勿恤吉。', xiangZhuan: '王假有家，交相爱也。' },
      { position: 6, yinYang: 'yin', text: '有孚威如，终吉。', xiangZhuan: '威如之吉，反身之谓也。' },
    ],
    shangGua: '巽', xiaGua: '离', duiGua: 38, zongGua: 38, huGua: 63,
    guaBian: [22, 13, 37, 37, 37, 37],
    shiWei: { zhong: true, description: '家人卦六二、九五得中得正。卦处齐家之时，宜正家道。' },
    symbol: '☴☲', meaning: '家人象征家庭，风自火出，家道正则天下定。', wuxing: '木'
  },
  {
    id: 38, name: '火泽睽', chineseName: '睽', pronunciation: 'kuí',
    guaci: '小事吉。',
    tuanZhuan: '睽，火动而上，泽动而下，二女同居，其志不同行。说而丽乎明，柔进而上行，得中而应乎刚，是以小事吉。天地睽而其事同也，男女睽而其志通也，万物睽而其事类也，睽之时用大矣哉！',
    daXiangZhuan: '上火下泽，睽；君子以同而异。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '悔亡，丧马勿逐，自复。见恶人，无咎。', xiangZhuan: '见恶人，以辟咎也。' },
      { position: 2, yinYang: 'yin', text: '遇主于巷，无咎。', xiangZhuan: '遇主于巷，未失道也。' },
      { position: 3, yinYang: 'yin', text: '见舆曳，其牛掣，其人天且劓，无初有终。', xiangZhuan: '见舆曳，位不当也。' },
      { position: 4, yinYang: 'yang', text: '睽孤，遇元夫，交孚，厉无咎。', xiangZhuan: '交孚无咎，志行也。' },
      { position: 5, yinYang: 'yin', text: '悔亡，厥宗噬肤，往何咎。', xiangZhuan: '厥宗噬肤，往有庆也。' },
      { position: 6, yinYang: 'yang', text: '睽孤，见豕负涂，载鬼一车，先张之弧，后说之弧，匪寇婚媾，往遇雨则吉。', xiangZhuan: '遇雨之吉，群疑亡也。' },
    ],
    shangGua: '离', xiaGua: '兑', duiGua: 37, zongGua: 37, huGua: 64,
    guaBian: [21, 12, 38, 38, 38, 38],
    shiWei: { zhong: true, description: '睽卦六二、六五得中。卦处乖睽之时，宜同而异。' },
    symbol: '☲☱', meaning: '睽象征乖离，上火下泽，二女同居志不同。', wuxing: '火'
  },
  {
    id: 39, name: '水山蹇', chineseName: '蹇', pronunciation: 'jiǎn',
    guaci: '利西南，不利东北；利见大人，贞吉。',
    tuanZhuan: '蹇，难也，险在前也。见险而能止，知矣哉！蹇利西南，往得中也；不利东北，其道穷也。利见大人，往有功也。当位贞吉，以正邦也。蹇之时用大矣哉！',
    daXiangZhuan: '山上有水，蹇；君子以反身修德。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '往蹇，来誉。', xiangZhuan: '往蹇来誉，宜待也。' },
      { position: 2, yinYang: 'yin', text: '王臣蹇蹇，匪躬之故。', xiangZhuan: '王臣蹇蹇，终无尤也。' },
      { position: 3, yinYang: 'yang', text: '往蹇，来反。', xiangZhuan: '往蹇来反，内喜之也。' },
      { position: 4, yinYang: 'yin', text: '往蹇，来连。', xiangZhuan: '往蹇来连，当位实也。' },
      { position: 5, yinYang: 'yang', text: '大蹇，朋来。', xiangZhuan: '大蹇朋来，以中节也。' },
      { position: 6, yinYang: 'yin', text: '往蹇，来硕，吉；利见大人。', xiangZhuan: '往蹇来硕，志在内也。' },
    ],
    shangGua: '坎', xiaGua: '艮', duiGua: 40, zongGua: 40, huGua: 63,
    guaBian: [15, 4, 39, 39, 39, 39],
    shiWei: { zhong: true, description: '蹇卦九五得中得正。卦处蹇难之时，宜反身修德。' },
    symbol: '☵☶', meaning: '蹇象征艰难，山上有水，见险而止。', wuxing: '水'
  },
  {
    id: 40, name: '雷水解', chineseName: '解', pronunciation: 'xiè',
    guaci: '利西南，无所往，其来复吉。有攸往，夙吉。',
    tuanZhuan: '解，险以动，动而免乎险，解。解利西南，往得众也。其来复吉，乃得中也。有攸往夙吉，往有功也。天地解而雷雨作，雷雨作而百果草木皆甲坼，解之时大矣哉！',
    daXiangZhuan: '雷雨作，解；君子以赦过宥罪。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '无咎。', xiangZhuan: '刚柔之际，义无咎也。' },
      { position: 2, yinYang: 'yang', text: '田获三狐，得黄矢，贞吉。', xiangZhuan: '九二贞吉，得中道也。' },
      { position: 3, yinYang: 'yin', text: '负且乘，致寇至，贞吝。', xiangZhuan: '负且乘，亦可丑也。' },
      { position: 4, yinYang: 'yang', text: '解而拇，朋至斯孚。', xiangZhuan: '解而拇，未当位也。' },
      { position: 5, yinYang: 'yang', text: '君子维有解，吉；有孚于小人。', xiangZhuan: '君子有解，小人退也。' },
      { position: 6, yinYang: 'yin', text: '公用射隼，于高墉之上，获之，无不利。', xiangZhuan: '公用射隼，以解悖也。' },
    ],
    shangGua: '震', xiaGua: '坎', duiGua: 39, zongGua: 39, huGua: 64,
    guaBian: [16, 3, 40, 40, 40, 40],
    shiWei: { zhong: true, description: '解卦九二得中，为解难之主。卦处解散之时，宜赦过宥罪。' },
    symbol: '☳☵', meaning: '解象征解脱，雷雨作，险难解散。', wuxing: '木'
  },
  {
    id: 41, name: '山泽损', chineseName: '损', pronunciation: 'sǔn',
    guaci: '有孚，元吉，无咎，可贞，利有攸往。曷之用，二簋可用享。',
    tuanZhuan: '损，损下益上，其道上行。损而有孚，元吉，无咎，可贞，利有攸往。曷之用？二簋可用享。二簋应有时，损刚益柔有时，损益盈虚，与时偕行。',
    daXiangZhuan: '山下有泽，损；君子以惩忿窒欲。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '已事遄往，无咎，酌损之。', xiangZhuan: '已事遄往，尚合志也。' },
      { position: 2, yinYang: 'yang', text: '利贞，征凶，弗损益之。', xiangZhuan: '九二利贞，中以为志也。' },
      { position: 3, yinYang: 'yin', text: '三人行，则损一人；一人行，则得其友。', xiangZhuan: '一人行，三则疑也。' },
      { position: 4, yinYang: 'yin', text: '损其疾，使遄有喜，无咎。', xiangZhuan: '损其疾，亦可喜也。' },
      { position: 5, yinYang: 'yang', text: '或益之，十朋之龟弗克违，元吉。', xiangZhuan: '六五元吉，自上佑也。' },
      { position: 6, yinYang: 'yin', text: '弗损益之，无咎，贞吉，利有攸往，得臣无家。', xiangZhuan: '弗损益之，大得志也。' },
    ],
    shangGua: '艮', xiaGua: '兑', duiGua: 42, zongGua: 42, huGua: 24,
    guaBian: [19, 26, 41, 41, 41, 41],
    shiWei: { zhong: true, description: '损卦六五得中。卦处减损之时，宜惩忿窒欲。' },
    symbol: '☶☱', meaning: '损象征减损，山下有泽，损下益上。', wuxing: '土'
  },
  {
    id: 42, name: '风雷益', chineseName: '益', pronunciation: 'yì',
    guaci: '利有攸往，利涉大川。',
    tuanZhuan: '益，损上益下，民说无疆，自上下下，其道大光。利有攸往，中正有庆。利涉大川，木道乃行。益动而巽，日进无疆。天施地生，其益无方。凡益之道，与时偕行。',
    daXiangZhuan: '风雷，益；君子以见善则迁，有过则改。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '利用为大作，元吉，无咎。', xiangZhuan: '元吉无咎，下不厚事也。' },
      { position: 2, yinYang: 'yin', text: '或益之，十朋之龟弗克违，永贞吉。王用享于帝，吉。', xiangZhuan: '或益之，自外来也。' },
      { position: 3, yinYang: 'yin', text: '益之用凶事，无咎。有孚中行，告公用圭。', xiangZhuan: '益用凶事，固有之也。' },
      { position: 4, yinYang: 'yang', text: '中行，告公从。利用为依迁国。', xiangZhuan: '告公从，以益志也。' },
      { position: 5, yinYang: 'yin', text: '有孚惠心，勿问元吉。有孚惠我德。', xiangZhuan: '有孚惠心，勿问之矣。' },
      { position: 6, yinYang: 'yang', text: '莫益之，或击之，立心勿恒，凶。', xiangZhuan: '莫益之，偏辞也。' },
    ],
    shangGua: '巽', xiaGua: '震', duiGua: 41, zongGua: 41, huGua: 23,
    guaBian: [20, 25, 42, 42, 42, 42],
    shiWei: { zhong: true, description: '益卦六二、九五得中。卦处增益之时，宜见善则迁。' },
    symbol: '☴☳', meaning: '益象征增益，风雷相助，损上益下。', wuxing: '木'
  },
  {
    id: 43, name: '泽天夬', chineseName: '夬', pronunciation: 'guài',
    guaci: '扬于王庭，孚号，有厉，告自邑，不利即戎，利有攸往。',
    tuanZhuan: '夬，决也，刚决柔也。健而说，决而和，扬于王庭，柔乘五刚也。孚号有厉，其危乃光也。告自邑，不利即戎，所尚乃穷也。利有攸往，刚长乃终也。',
    daXiangZhuan: '泽上于天，夬；君子以施禄及下，居德则忌。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '壮于前趾，往不胜为咎。', xiangZhuan: '不胜而往，咎也。' },
      { position: 2, yinYang: 'yang', text: '惕号，莫夜有戎，勿恤。', xiangZhuan: '有戎勿恤，得中道也。' },
      { position: 3, yinYang: 'yang', text: '壮于頄，有凶。君子夬夬，独行遇雨，若濡有愠，无咎。', xiangZhuan: '君子夬夬，终无咎也。' },
      { position: 4, yinYang: 'yang', text: '臀无肤，其行次且。牵羊悔亡，闻言不信。', xiangZhuan: '其行次且，位不当也。' },
      { position: 5, yinYang: 'yang', text: '苋陆夬夬，中行无咎。', xiangZhuan: '中行无咎，中未光也。' },
      { position: 6, yinYang: 'yin', text: '无号，终有凶。', xiangZhuan: '无号之凶，终不可长也。' },
    ],
    shangGua: '兑', xiaGua: '乾', duiGua: 44, zongGua: 44, huGua: 34,
    guaBian: [58, 1, 43, 43, 43, 43],
    shiWei: { zhong: true, description: '夬卦九二、九五得中。卦处决断之时，宜施禄及下。' },
    symbol: '☱☰', meaning: '夬象征决断，泽上于天，刚决柔也。', wuxing: '金'
  },
  {
    id: 44, name: '天风姤', chineseName: '姤', pronunciation: 'gòu',
    guaci: '女壮，勿用取女。',
    tuanZhuan: '姤，遇也，柔遇刚也。勿用取女，不可与长也。天地相遇，品物咸章也。刚遇中正，天下大行也。姤之时义大矣哉！',
    daXiangZhuan: '天下有风，姤；后以施命诰四方。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '系于金柅，贞吉，有攸往，见凶，羸豕孚蹢躅。', xiangZhuan: '系于金柅，柔道牵也。' },
      { position: 2, yinYang: 'yang', text: '包有鱼，无咎，不利宾。', xiangZhuan: '包有鱼，义不及宾也。' },
      { position: 3, yinYang: 'yang', text: '臀无肤，其行次且，厉，无大咎。', xiangZhuan: '其行次且，行未牵也。' },
      { position: 4, yinYang: 'yang', text: '包无鱼，起凶。', xiangZhuan: '无鱼之凶，远民也。' },
      { position: 5, yinYang: 'yang', text: '以杞包瓜，含章，有陨自天。', xiangZhuan: '九五含章，中正也。' },
      { position: 6, yinYang: 'yang', text: '姤其角，吝，无咎。', xiangZhuan: '姤其角，上穷吝也。' },
    ],
    shangGua: '乾', xiaGua: '巽', duiGua: 43, zongGua: 43, huGua: 33,
    guaBian: [57, 1, 44, 44, 44, 44],
    shiWei: { zhong: true, description: '姤卦九五得中得正。卦处相遇之时，宜施命诰四方。' },
    symbol: '☰☴', meaning: '姤象征相遇，天下有风，柔遇刚也。', wuxing: '金'
  },
  {
    id: 45, name: '泽地萃', chineseName: '萃', pronunciation: 'cuì',
    guaci: '亨。王假有庙，利见大人，亨，利贞。用大牲吉，利有攸往。',
    tuanZhuan: '萃，聚也。顺以说，刚中而应，故聚也。王假有庙，致孝享也。利见大人亨，聚以正也。用大牲吉，利有攸往，顺天命也。观其所聚，而天地万物之情可见矣。',
    daXiangZhuan: '泽上于地，萃；君子以除戎器，戒不虞。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '有孚不终，乃乱乃萃，若号，一握为笑，勿恤，往无咎。', xiangZhuan: '乃乱乃萃，其志乱也。' },
      { position: 2, yinYang: 'yin', text: '引吉，无咎，孚乃利用禴。', xiangZhuan: '引吉无咎，中未变也。' },
      { position: 3, yinYang: 'yin', text: '萃如，嗟如，无攸利，往无咎，小吝。', xiangZhuan: '往无咎，上巽也。' },
      { position: 4, yinYang: 'yang', text: '大吉，无咎。', xiangZhuan: '大吉无咎，位不当也。' },
      { position: 5, yinYang: 'yang', text: '萃有位，无咎，匪孚，元永贞，悔亡。', xiangZhuan: '萃有位，志未光也。' },
      { position: 6, yinYang: 'yin', text: '赍咨涕洟，无咎。', xiangZhuan: '赍咨涕洟，未安上也。' },
    ],
    shangGua: '兑', xiaGua: '坤', duiGua: 46, zongGua: 46, huGua: 53,
    guaBian: [58, 2, 45, 45, 45, 45],
    shiWei: { zhong: true, description: '萃卦六二、九五得中。卦处聚集之时，宜除戎器戒不虞。' },
    symbol: '☱☷', meaning: '萃象征聚集，泽上于地，万物汇聚。', wuxing: '金'
  },
  {
    id: 46, name: '地风升', chineseName: '升', pronunciation: 'shēng',
    guaci: '元亨，用见大人，勿恤，南征吉。',
    tuanZhuan: '柔以时升，巽而顺，刚中而应，是以大亨。用见大人，勿恤，有庆也。南征吉，志行也。',
    daXiangZhuan: '地中生木，升；君子以顺德，积小以高大。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '允升，大吉。', xiangZhuan: '允升大吉，上合志也。' },
      { position: 2, yinYang: 'yang', text: '孚乃利用禴，无咎。', xiangZhuan: '九二之孚，有喜也。' },
      { position: 3, yinYang: 'yang', text: '升虚邑。', xiangZhuan: '升虚邑，无所疑也。' },
      { position: 4, yinYang: 'yin', text: '王用亨于岐山，吉无咎。', xiangZhuan: '王用亨于岐山，顺事也。' },
      { position: 5, yinYang: 'yin', text: '贞吉，升阶。', xiangZhuan: '贞吉升阶，大得志也。' },
      { position: 6, yinYang: 'yin', text: '冥升，利于不息之贞。', xiangZhuan: '冥升在上，消不富也。' },
    ],
    shangGua: '坤', xiaGua: '巽', duiGua: 45, zongGua: 45, huGua: 54,
    guaBian: [57, 2, 46, 46, 46, 46],
    shiWei: { zhong: true, description: '升卦九二、六五得中，初九得正。卦处上升之时，宜顺德积小高大。' },
    symbol: '☷☴', meaning: '升象征上升，地中生木，积小高大。', wuxing: '木'
  },
  {
    id: 47, name: '泽水困', chineseName: '困', pronunciation: 'kùn',
    guaci: '亨，贞，大人吉，无咎，有言不信。',
    tuanZhuan: '困，刚掩也。险以说，困而不失其所亨，其唯君子乎？贞大人吉，以刚中也。有言不信，尚口乃穷也。',
    daXiangZhuan: '泽无水，困；君子以致命遂志。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '臀困于株木，入于幽谷，三岁不觌。', xiangZhuan: '入于幽谷，幽不明也。' },
      { position: 2, yinYang: 'yang', text: '困于酒食，朱绂方来，利用享祀，征凶，无咎。', xiangZhuan: '困于酒食，中有庆也。' },
      { position: 3, yinYang: 'yin', text: '困于石，据于蒺藜，入于其宫，不见其妻，凶。', xiangZhuan: '据于蒺藜，乘刚也。' },
      { position: 4, yinYang: 'yang', text: '来徐徐，困于金车，吝，有终。', xiangZhuan: '来徐徐，志在下也。' },
      { position: 5, yinYang: 'yang', text: '劓刖，困于赤绂，乃徐有说，利用祭祀。', xiangZhuan: '劓刖，志未得也。' },
      { position: 6, yinYang: 'yin', text: '困于葛藟，于臲卼，曰动悔。有悔，征吉。', xiangZhuan: '困于葛藟，未当也。' },
    ],
    shangGua: '兑', xiaGua: '坎', duiGua: 48, zongGua: 48, huGua: 28,
    guaBian: [58, 29, 47, 47, 47, 47],
    shiWei: { zhong: true, description: '困卦九二、九五得中。卦处困穷之时，宜致命遂志。' },
    symbol: '☱☵', meaning: '困象征困穷，泽无水，君子致命遂志。', wuxing: '水'
  },
  {
    id: 48, name: '水风井', chineseName: '井', pronunciation: 'jǐng',
    guaci: '改邑不改井，无丧无得，往来井井。汔至亦未繘井，羸其瓶，凶。',
    tuanZhuan: '巽乎水而上水，井。井养而不穷也。改邑不改井，乃以刚中也。汔至亦未繘井，未有功也。羸其瓶，是以凶也。',
    daXiangZhuan: '木上有水，井；君子以劳民劝相。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '井泥不食，旧井无禽。', xiangZhuan: '井泥不食，下也。' },
      { position: 2, yinYang: 'yang', text: '井谷射鲋，瓮敝漏。', xiangZhuan: '井谷射鲋，无与也。' },
      { position: 3, yinYang: 'yang', text: '井渫不食，为我心恻，可用汲，王明，并受其福。', xiangZhuan: '井渫不食，行恻也。' },
      { position: 4, yinYang: 'yin', text: '井甃，无咎。', xiangZhuan: '井甃无咎，修井也。' },
      { position: 5, yinYang: 'yang', text: '井洌，寒泉食。', xiangZhuan: '寒泉之食，中正也。' },
      { position: 6, yinYang: 'yin', text: '井收勿幕，有孚元吉。', xiangZhuan: '元吉在上，大成也。' },
    ],
    shangGua: '坎', xiaGua: '巽', duiGua: 47, zongGua: 47, huGua: 27,
    guaBian: [57, 29, 48, 48, 48, 48],
    shiWei: { zhong: true, description: '井卦九五得中得正。卦处井养之时，宜劳民劝相。' },
    symbol: '☵☴', meaning: '井象征井养，木上有水，养而不穷。', wuxing: '水'
  },
  {
    id: 49, name: '泽火革', chineseName: '革', pronunciation: 'gé',
    guaci: '己日乃孚，元亨利贞，悔亡。',
    tuanZhuan: '革，水火相息，二女同居，其志不相得，曰革。己日乃孚，革而信之。文明以说，大亨以正，革而当，其悔乃亡。天地革而四时成，汤武革命，顺乎天而应乎人，革之时大矣哉！',
    daXiangZhuan: '泽中有火，革；君子以治历明时。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '巩用黄牛之革。', xiangZhuan: '巩用黄牛，不可以有为也。' },
      { position: 2, yinYang: 'yin', text: '己日乃革之，征吉，无咎。', xiangZhuan: '己日革之，行有嘉也。' },
      { position: 3, yinYang: 'yang', text: '征凶，贞厉，革言三就，有孚。', xiangZhuan: '革言三就，又何之矣。' },
      { position: 4, yinYang: 'yang', text: '悔亡，有孚改命，吉。', xiangZhuan: '改命之吉，信志也。' },
      { position: 5, yinYang: 'yang', text: '大人虎变，未占有孚。', xiangZhuan: '大人虎变，其文炳也。' },
      { position: 6, yinYang: 'yin', text: '君子豹变，小人革面，征凶，居贞吉。', xiangZhuan: '君子豹变，其文蔚也。' },
    ],
    shangGua: '兑', xiaGua: '离', duiGua: 50, zongGua: 50, huGua: 43,
    guaBian: [58, 30, 49, 49, 49, 49],
    shiWei: { zhong: true, description: '革卦九五得中得正。卦处变革之时，宜治历明时。' },
    symbol: '☱☲', meaning: '革象征变革，泽中有火，水火相息。', wuxing: '火'
  },
  {
    id: 50, name: '火风鼎', chineseName: '鼎', pronunciation: 'dǐng',
    guaci: '元吉，亨。',
    tuanZhuan: '鼎，象也。以木巽火，亨饪也。圣人亨以享上帝，而大亨以养圣贤。巽而耳目聪明，柔进而上行，得中而应乎刚，是以元亨。',
    daXiangZhuan: '木上有火，鼎；君子以正位凝命。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '鼎颠趾，利出否，得妾以其子，无咎。', xiangZhuan: '鼎颠趾，未悖也。' },
      { position: 2, yinYang: 'yang', text: '鼎有实，我仇有疾，不我能即，吉。', xiangZhuan: '鼎有实，慎所之也。' },
      { position: 3, yinYang: 'yang', text: '鼎耳革，其行塞，雉膏不食，方雨亏悔，终吉。', xiangZhuan: '鼎耳革，失其义也。' },
      { position: 4, yinYang: 'yang', text: '鼎折足，覆公餗，其形渥，凶。', xiangZhuan: '覆公餗，信如何也。' },
      { position: 5, yinYang: 'yin', text: '鼎黄耳，金铉，利贞。', xiangZhuan: '鼎黄耳，中以为实也。' },
      { position: 6, yinYang: 'yang', text: '鼎玉铉，大吉，无不利。', xiangZhuan: '玉铉在上，刚柔节也。' },
    ],
    shangGua: '离', xiaGua: '巽', duiGua: 49, zongGua: 49, huGua: 44,
    guaBian: [57, 30, 50, 50, 50, 50],
    shiWei: { zhong: true, description: '鼎卦六五得中。卦处鼎新之时，宜正位凝命。' },
    symbol: '☲☴', meaning: '鼎象征鼎新，木上有火，亨饪养贤。', wuxing: '火'
  },
  {
    id: 51, name: '震为雷', chineseName: '震', pronunciation: 'zhèn',
    guaci: '亨。震来虩虩，笑言哑哑。震惊百里，不丧匕鬯。',
    tuanZhuan: '震，亨。震来虩虩，恐致福也。笑言哑哑，后有则也。震惊百里，惊远而惧迩也。出可以守宗庙社稷，以为祭主也。',
    daXiangZhuan: '洊雷，震；君子以恐惧修省。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '震来虩虩，后笑言哑哑，吉。', xiangZhuan: '震来虩虩，恐致福也。' },
      { position: 2, yinYang: 'yin', text: '震来厉，亿丧贝，跻于九陵，勿逐，七日得。', xiangZhuan: '震来厉，乘刚也。' },
      { position: 3, yinYang: 'yin', text: '震苏苏，震行无眚。', xiangZhuan: '震苏苏，位不当也。' },
      { position: 4, yinYang: 'yang', text: '震遂泥。', xiangZhuan: '震遂泥，未光也。' },
      { position: 5, yinYang: 'yin', text: '震往来厉，亿无丧，有事。', xiangZhuan: '震往来厉，危行也。' },
      { position: 6, yinYang: 'yin', text: '震索索，视矍矍，征凶。震不于其躬，于其邻，无咎。婚媾有言。', xiangZhuan: '震索索，中未得也。' },
    ],
    shangGua: '震', xiaGua: '震', duiGua: 52, zongGua: 52, huGua: 51,
    guaBian: [16, 16, 51, 51, 51, 51],
    shiWei: { zhong: true, description: '震卦无得中者。卦处震动之时，宜恐惧修省。' },
    symbol: '☳☳', meaning: '震象征震动，洊雷震震，君子修省。', wuxing: '木'
  },
  {
    id: 52, name: '艮为山', chineseName: '艮', pronunciation: 'gèn',
    guaci: '艮其背，不获其身，行其庭，不见其人，无咎。',
    tuanZhuan: '艮，止也。时止则止，时行则行，动静不失其时，其道光明。艮其止，止其所也。上下敌应，不相与也。是以不获其身，行其庭不见其人，无咎也。',
    daXiangZhuan: '兼山，艮；君子以思不出其位。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '艮其趾，无咎，利永贞。', xiangZhuan: '艮其趾，未失正也。' },
      { position: 2, yinYang: 'yin', text: '艮其腓，不拯其随，其心不快。', xiangZhuan: '不拯其随，未退听也。' },
      { position: 3, yinYang: 'yang', text: '艮其限，列其夤，厉薰心。', xiangZhuan: '艮其限，危薰心也。' },
      { position: 4, yinYang: 'yin', text: '艮其身，无咎。', xiangZhuan: '艮其身，止诸躬也。' },
      { position: 5, yinYang: 'yang', text: '艮其辅，言有序，悔亡。', xiangZhuan: '艮其辅，以中正也。' },
      { position: 6, yinYang: 'yang', text: '敦艮，吉。', xiangZhuan: '敦艮之吉，以厚终也。' },
    ],
    shangGua: '艮', xiaGua: '艮', duiGua: 51, zongGua: 51, huGua: 52,
    guaBian: [52, 52, 52, 52, 52, 52],
    shiWei: { zhong: true, description: '艮卦六五得中。卦处静止之时，宜思不出位。' },
    symbol: '☶☶', meaning: '艮象征静止，兼山艮止，止于其所。', wuxing: '土'
  },
  {
    id: 53, name: '风山渐', chineseName: '渐', pronunciation: 'jiàn',
    guaci: '女归吉，利贞。',
    tuanZhuan: '渐之进也，女归吉也。进得位，往有功也。进以正，可以正邦也。其位刚得中也。止而巽，动不穷也。',
    daXiangZhuan: '山上有木，渐；君子以居贤德善俗。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '鸿渐于干，小子厉，有言，无咎。', xiangZhuan: '小子之厉，义无咎也。' },
      { position: 2, yinYang: 'yang', text: '鸿渐于磐，饮食衎衎，吉。', xiangZhuan: '饮食衎衎，不素饱也。' },
      { position: 3, yinYang: 'yang', text: '鸿渐于陆，夫征不复，妇孕不育，凶；利御寇。', xiangZhuan: '夫征不复，离群丑也。' },
      { position: 4, yinYang: 'yin', text: '鸿渐于木，或得其桷，无咎。', xiangZhuan: '或得其桷，顺以巽也。' },
      { position: 5, yinYang: 'yang', text: '鸿渐于陵，妇三岁不孕，终莫之胜，吉。', xiangZhuan: '终莫之胜，吉，得所愿也。' },
      { position: 6, yinYang: 'yang', text: '鸿渐于逵，其羽可用为仪，吉。', xiangZhuan: '其羽可用为仪，吉，不可乱也。' },
    ],
    shangGua: '巽', xiaGua: '艮', duiGua: 54, zongGua: 54, huGua: 57,
    guaBian: [57, 52, 53, 53, 53, 53],
    shiWei: { zhong: true, description: '渐卦六二、九五得中。卦处渐进之时，宜居贤德善俗。' },
    symbol: '☴☶', meaning: '渐象征渐进，山上有木，循序渐进。', wuxing: '木'
  },
  {
    id: 54, name: '雷泽归妹', chineseName: '归妹', pronunciation: 'guī mèi',
    guaci: '征凶，无攸利。',
    tuanZhuan: '归妹，天地之大义也。天地不交而万物不兴，归妹人之终始也。说以动，所归妹也。征凶，位不当也。无攸利，柔乘刚也。',
    daXiangZhuan: '泽上有雷，归妹；君子以永终知敝。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '归妹以娣，跛能履，征吉。', xiangZhuan: '归妹以娣，以恒也。' },
      { position: 2, yinYang: 'yang', text: '眇能视，利幽人之贞。', xiangZhuan: '利幽人之贞，未变常也。' },
      { position: 3, yinYang: 'yin', text: '归妹以须，反归以娣。', xiangZhuan: '归妹以须，未当也。' },
      { position: 4, yinYang: 'yang', text: '归妹愆期，迟归有时。', xiangZhuan: '愆期之志，有待而行也。' },
      { position: 5, yinYang: 'yin', text: '帝乙归妹，其君之袂，不如其娣之袂良，月几望，吉。', xiangZhuan: '帝乙归妹，不如其娣之袂良也。' },
      { position: 6, yinYang: 'yin', text: '女承筐无实，士刲羊无血，无攸利。', xiangZhuan: '上六无实，承虚筐也。' },
    ],
    shangGua: '震', xiaGua: '兑', duiGua: 53, zongGua: 53, huGua: 58,
    guaBian: [58, 16, 54, 54, 54, 54],
    shiWei: { zhong: true, description: '归妹卦六二、六五得中。卦处嫁娶之时，宜永终知敝。' },
    symbol: '☳☱', meaning: '归妹象征嫁娶，泽上有雷，少女从长男。', wuxing: '木'
  },
  {
    id: 55, name: '雷火丰', chineseName: '丰', pronunciation: 'fēng',
    guaci: '亨，王假之，勿忧，宜日中。',
    tuanZhuan: '丰，大也。明以动，故丰。王假之，尚大也。勿忧宜日中，宜照天下也。日中则昃，月盈则食，天地盈虚，与时消息，而况于人乎？况于鬼神乎？',
    daXiangZhuan: '雷电皆至，丰；君子以折狱致刑。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '遇其配主，虽旬无咎，往有尚。', xiangZhuan: '虽旬无咎，过旬灾也。' },
      { position: 2, yinYang: 'yin', text: '丰其蔀，日中见斗，往得疑疾，有孚发若，吉。', xiangZhuan: '有孚发若，信以发志也。' },
      { position: 3, yinYang: 'yang', text: '丰其沛，日中见沬，折其右肱，无咎。', xiangZhuan: '丰其沛，不可大事也。' },
      { position: 4, yinYang: 'yang', text: '丰其蔀，日中见斗，遇其夷主，吉。', xiangZhuan: '丰其蔀，位不当也。' },
      { position: 5, yinYang: 'yin', text: '来章，有庆誉，吉。', xiangZhuan: '六五之吉，有庆也。' },
      { position: 6, yinYang: 'yin', text: '丰其屋，蔀其家，窥其户，阒其无人，三岁不觌，凶。', xiangZhuan: '丰其屋，天际翔也。' },
    ],
    shangGua: '震', xiaGua: '离', duiGua: 56, zongGua: 56, huGua: 48,
    guaBian: [16, 30, 55, 55, 55, 55],
    shiWei: { zhong: true, description: '丰卦六二、六五得中。卦处丰盛之时，宜折狱致刑。' },
    symbol: '☳☲', meaning: '丰象征丰盛，雷电皆至，明以动故丰。', wuxing: '火'
  },
  {
    id: 56, name: '火山旅', chineseName: '旅', pronunciation: 'lǚ',
    guaci: '小亨，旅贞吉。',
    tuanZhuan: '旅，小亨，柔得中乎外而顺乎刚，止而丽乎明，是以小亨，旅贞吉也。旅之时义大矣哉！',
    daXiangZhuan: '山上有火，旅；君子以明慎用刑，而不留狱。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '旅琐琐，斯其所取灾。', xiangZhuan: '旅琐琐，志穷灾也。' },
      { position: 2, yinYang: 'yang', text: '旅即次，怀其资，得童仆贞。', xiangZhuan: '得童仆贞，终无尤也。' },
      { position: 3, yinYang: 'yang', text: '旅焚其次，丧其童仆，贞厉。', xiangZhuan: '旅焚其次，亦以伤矣。' },
      { position: 4, yinYang: 'yang', text: '旅于处，得其资斧，我心不快。', xiangZhuan: '旅于处，未得位也。' },
      { position: 5, yinYang: 'yin', text: '射雉一矢亡，终以誉命。', xiangZhuan: '终以誉命，上逮也。' },
      { position: 6, yinYang: 'yang', text: '鸟焚其巢，旅人先笑后号咷。丧牛于易，凶。', xiangZhuan: '以旅在上，其义焚也。' },
    ],
    shangGua: '离', xiaGua: '艮', duiGua: 55, zongGua: 55, huGua: 47,
    guaBian: [30, 52, 56, 56, 56, 56],
    shiWei: { zhong: true, description: '旅卦六二、六五得中。卦处行旅之时，宜明慎用刑。' },
    symbol: '☲☶', meaning: '旅象征行旅，山上有火，明慎用刑。', wuxing: '火'
  },
  {
    id: 57, name: '巽为风', chineseName: '巽', pronunciation: 'xùn',
    guaci: '小亨，利有攸往，利见大人。',
    tuanZhuan: '重巽以申命，刚巽乎中正而志行。柔皆顺乎刚，是以小亨，利有攸往，利见大人。',
    daXiangZhuan: '随风，巽；君子以申命行事。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '进退，利武人之贞。', xiangZhuan: '进退，志疑也。' },
      { position: 2, yinYang: 'yang', text: '巽在床下，用史巫纷若，吉无咎。', xiangZhuan: '纷若之吉，得中也。' },
      { position: 3, yinYang: 'yang', text: '频巽，吝。', xiangZhuan: '频巽之吝，志穷也。' },
      { position: 4, yinYang: 'yin', text: '悔亡，田获三品。', xiangZhuan: '田获三品，有功也。' },
      { position: 5, yinYang: 'yang', text: '贞吉悔亡，无不利。无初有终，先庚三日，后庚三日，吉。', xiangZhuan: '九五之吉，位正中也。' },
      { position: 6, yinYang: 'yin', text: '巽在床下，丧其资斧，贞凶。', xiangZhuan: '巽在床下，上穷也。' },
    ],
    shangGua: '巽', xiaGua: '巽', duiGua: 58, zongGua: 58, huGua: 57,
    guaBian: [57, 57, 57, 57, 57, 57],
    shiWei: { zhong: true, description: '巽卦九二、九五得中得正。卦处巽顺之时，宜申命行事。' },
    symbol: '☴☴', meaning: '巽象征顺从，随风巽巽，申命行事。', wuxing: '木'
  },
  {
    id: 58, name: '兑为泽', chineseName: '兑', pronunciation: 'duì',
    guaci: '亨，利贞。',
    tuanZhuan: '兑，说也。刚中而柔外，说以利贞，是以顺乎天而应乎人。说以先民，民忘其劳；说以犯难，民忘其死；说之大，民劝矣哉！',
    daXiangZhuan: '丽泽，兑；君子以朋友讲习。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '和兑，吉。', xiangZhuan: '和兑之吉，行未疑也。' },
      { position: 2, yinYang: 'yang', text: '孚兑，吉，悔亡。', xiangZhuan: '孚兑之吉，信志也。' },
      { position: 3, yinYang: 'yin', text: '来兑，凶。', xiangZhuan: '来兑之凶，位不当也。' },
      { position: 4, yinYang: 'yang', text: '商兑，未宁，介疾有喜。', xiangZhuan: '九四之喜，有庆也。' },
      { position: 5, yinYang: 'yin', text: '孚于剥，有厉。', xiangZhuan: '孚于剥，位正当也。' },
      { position: 6, yinYang: 'yin', text: '引兑。', xiangZhuan: '上六引兑，未光也。' },
    ],
    shangGua: '兑', xiaGua: '兑', duiGua: 57, zongGua: 57, huGua: 58,
    guaBian: [58, 58, 58, 58, 58, 58],
    shiWei: { zhong: true, description: '兑卦九二得中。卦处喜悦之时，宜朋友讲习。' },
    symbol: '☱☱', meaning: '兑象征喜悦，丽泽兑悦，朋友讲习。', wuxing: '金'
  },
  {
    id: 59, name: '风水涣', chineseName: '涣', pronunciation: 'huàn',
    guaci: '亨。王假有庙，利涉大川，利贞。',
    tuanZhuan: '涣，亨。刚来而不穷，柔得位乎外而上同。王假有庙，王乃在中也。利涉大川，乘木有功也。',
    daXiangZhuan: '风行水上，涣；先王以享于帝立庙。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '用拯马壮，吉。', xiangZhuan: '初六之吉，顺也。' },
      { position: 2, yinYang: 'yang', text: '涣奔其机，悔亡。', xiangZhuan: '涣奔其机，得愿也。' },
      { position: 3, yinYang: 'yin', text: '涣其躬，无悔。', xiangZhuan: '涣其躬，志在外也。' },
      { position: 4, yinYang: 'yang', text: '涣其群，元吉。涣有丘，匪夷所思。', xiangZhuan: '涣其群，元吉，光大也。' },
      { position: 5, yinYang: 'yang', text: '涣汗其大号，涣王居，无咎。', xiangZhuan: '王居无咎，正位也。' },
      { position: 6, yinYang: 'yin', text: '涣其血，去逖出，无咎。', xiangZhuan: '涣其血，远害也。' },
    ],
    shangGua: '巽', xiaGua: '坎', duiGua: 60, zongGua: 60, huGua: 61,
    guaBian: [57, 29, 59, 59, 59, 59],
    shiWei: { zhong: true, description: '涣卦九二、九五得中。卦处涣散之时，宜享于帝立庙。' },
    symbol: '☴☵', meaning: '涣象征涣散，风行水上，散而不穷。', wuxing: '水'
  },
  {
    id: 60, name: '水泽节', chineseName: '节', pronunciation: 'jié',
    guaci: '亨。苦节不可贞。',
    tuanZhuan: '节，亨，刚柔分而刚得中。苦节不可贞，其道穷也。说以行险，当位以节，中正以通。天地节而四时成，节以制度，不伤财，不害民。',
    daXiangZhuan: '泽上有水，节；君子以制数度，议德行。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '不出户庭，无咎。', xiangZhuan: '不出户庭，知通塞也。' },
      { position: 2, yinYang: 'yang', text: '不出门庭，凶。', xiangZhuan: '不出门庭，失时极也。' },
      { position: 3, yinYang: 'yin', text: '不节若，则嗟若，无咎。', xiangZhuan: '不节之嗟，又谁咎也。' },
      { position: 4, yinYang: 'yang', text: '安节，亨。', xiangZhuan: '安节之亨，承上道也。' },
      { position: 5, yinYang: 'yang', text: '甘节，吉，往有尚。', xiangZhuan: '甘节之吉，居位中也。' },
      { position: 6, yinYang: 'yin', text: '苦节，贞凶，悔亡。', xiangZhuan: '苦节贞凶，其道穷也。' },
    ],
    shangGua: '坎', xiaGua: '兑', duiGua: 59, zongGua: 59, huGua: 62,
    guaBian: [58, 29, 60, 60, 60, 60],
    shiWei: { zhong: true, description: '节卦九二、九五得中。卦处节制之时，宜制数度议德行。' },
    symbol: '☵☱', meaning: '节象征节制，泽上有水，以制度节。', wuxing: '水'
  },
  {
    id: 61, name: '风泽中孚', chineseName: '中孚', pronunciation: 'zhōng fú',
    guaci: '豚鱼吉，利涉大川，利贞。',
    tuanZhuan: '中孚，柔在内而刚得中。说而巽，孚，乃化邦也。豚鱼吉，信及豚鱼也。利涉大川，乘木舟虚也。中孚以利贞，乃应乎天也。',
    daXiangZhuan: '泽上有风，中孚；君子以议狱缓死。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '虞吉，有他不燕。', xiangZhuan: '初九虞吉，志未变也。' },
      { position: 2, yinYang: 'yang', text: '鸣鹤在阴，其子和之，我有好爵，吾与尔靡之。', xiangZhuan: '其子和之，中心愿也。' },
      { position: 3, yinYang: 'yin', text: '得敌，或鼓或罢，或泣或歌。', xiangZhuan: '可鼓或罢，位不当也。' },
      { position: 4, yinYang: 'yang', text: '月几望，马匹亡，无咎。', xiangZhuan: '马匹亡，绝类上也。' },
      { position: 5, yinYang: 'yang', text: '有孚挛如，无咎。', xiangZhuan: '有孚挛如，位正当也。' },
      { position: 6, yinYang: 'yin', text: '翰音登于天，贞凶。', xiangZhuan: '翰音登于天，何可长也。' },
    ],
    shangGua: '巽', xiaGua: '兑', duiGua: 62, zongGua: 62, huGua: 27,
    guaBian: [57, 58, 61, 61, 61, 61],
    shiWei: { zhong: true, description: '中孚卦九二、九五得中。卦处诚信之时，宜议狱缓死。' },
    symbol: '☴☱', meaning: '中孚象征诚信，泽上有风，诚信感物。', wuxing: '金'
  },
  {
    id: 62, name: '雷山小过', chineseName: '小过', pronunciation: 'xiǎo guò',
    guaci: '亨，利贞，可小事，不可大事。飞鸟遗之音，不宜上宜下，大吉。',
    tuanZhuan: '小过，小者过而亨也。过以利贞，与时行也。柔得中，是以小事吉也。刚失位而不中，是以不可大事也。有飞鸟之象焉，飞鸟遗之音，不宜上宜下，大吉，上逆而下顺也。',
    daXiangZhuan: '山上有雷，小过；君子以行过乎恭，丧过乎哀，用过乎俭。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '飞鸟以凶。', xiangZhuan: '飞鸟以凶，不可如何也。' },
      { position: 2, yinYang: 'yin', text: '过其祖，遇其妣；不及其君，遇其臣；无咎。', xiangZhuan: '不及其君，臣不可过也。' },
      { position: 3, yinYang: 'yang', text: '弗过防之，从或戕之，凶。', xiangZhuan: '从或戕之，凶如何也。' },
      { position: 4, yinYang: 'yang', text: '无咎，弗过遇之。往厉必戒，勿用永贞。', xiangZhuan: '弗过遇之，位不当也。' },
      { position: 5, yinYang: 'yin', text: '密云不雨，自我西郊，公弋取彼在穴。', xiangZhuan: '密云不雨，已上也。' },
      { position: 6, yinYang: 'yin', text: '弗遇过之，飞鸟离之，凶，是谓灾眚。', xiangZhuan: '弗遇过之，已亢也。' },
    ],
    shangGua: '震', xiaGua: '艮', duiGua: 61, zongGua: 61, huGua: 28,
    guaBian: [16, 52, 62, 62, 62, 62],
    shiWei: { zhong: true, description: '小过卦六二、六五得中。卦处小过之时，宜行过乎恭。' },
    symbol: '☳☶', meaning: '小过象征小有过越，山上有雷，过乎恭哀俭。', wuxing: '木'
  },
  {
    id: 63, name: '水火既济', chineseName: '既济', pronunciation: 'jì jì',
    guaci: '亨，小利贞，初吉终乱。',
    tuanZhuan: '既济，亨，小者亨也。利贞，刚柔正而位当也。初吉，柔得中也。终止则乱，其道穷也。',
    daXiangZhuan: '水在火上，既济；君子以思患而预防之。',
    yaos: [
      { position: 1, yinYang: 'yang', text: '曳其轮，濡其尾，无咎。', xiangZhuan: '曳其轮，义无咎也。' },
      { position: 2, yinYang: 'yin', text: '妇丧其茀，勿逐，七日得。', xiangZhuan: '七日得，以中道也。' },
      { position: 3, yinYang: 'yang', text: '高宗伐鬼方，三年克之，小人勿用。', xiangZhuan: '三年克之，惫也。' },
      { position: 4, yinYang: 'yin', text: '繻有衣袽，终日戒。', xiangZhuan: '终日戒，有所疑也。' },
      { position: 5, yinYang: 'yang', text: '东邻杀牛，不如西邻之禴祭，实受其福。', xiangZhuan: '东邻杀牛，不如西邻之时也。' },
      { position: 6, yinYang: 'yin', text: '濡其首，厉。', xiangZhuan: '濡其首厉，何可久也。' },
    ],
    shangGua: '坎', xiaGua: '离', duiGua: 64, zongGua: 64, huGua: 48,
    guaBian: [29, 30, 63, 63, 63, 63],
    shiWei: { zhong: true, description: '既济卦六二、九五得中，六爻皆当位。卦处既济之时，宜思患预防。' },
    symbol: '☵☲', meaning: '既济象征已成，水在火上，事成物济。', wuxing: '水'
  },
  {
    id: 64, name: '火水未济', chineseName: '未济', pronunciation: 'wèi jì',
    guaci: '亨，小狐汔济，濡其尾，无攸利。',
    tuanZhuan: '未济，亨，柔得中也。小狐汔济，未出中也。濡其尾，无攸利，不续终也。虽不当位，刚柔应也。',
    daXiangZhuan: '火在水上，未济；君子以慎辨物居方。',
    yaos: [
      { position: 1, yinYang: 'yin', text: '濡其尾，吝。', xiangZhuan: '濡其尾，亦不知极也。' },
      { position: 2, yinYang: 'yang', text: '曳其轮，贞吉。', xiangZhuan: '九二贞吉，中以行正也。' },
      { position: 3, yinYang: 'yin', text: '未济，征凶，利涉大川。', xiangZhuan: '未济征凶，位不当也。' },
      { position: 4, yinYang: 'yang', text: '贞吉，悔亡，震用伐鬼方，三年有赏于大国。', xiangZhuan: '贞吉悔亡，志行也。' },
      { position: 5, yinYang: 'yin', text: '贞吉，无悔，君子之光，有孚，吉。', xiangZhuan: '君子之光，其晖吉也。' },
      { position: 6, yinYang: 'yang', text: '濡其首，厉。', xiangZhuan: '濡其首厉，何可久也。' },
    ],
    shangGua: '离', xiaGua: '坎', duiGua: 63, zongGua: 63, huGua: 47,
    guaBian: [30, 29, 64, 64, 64, 64],
    shiWei: { zhong: true, description: '未济卦六二、六五得中。卦处未济之时，宜慎辨物居方。' },
    symbol: '☲☵', meaning: '未济象征未成，火在水上，事未成而待济。', wuxing: '火'
  },
];

export function getGuaById(id: number): Gua | undefined {
  return liuShiSiGua.find(gua => gua.id === id);
}

export function getGuaByName(name: string): Gua | undefined {
  return liuShiSiGua.find(gua => gua.name === name || gua.chineseName === name);
}

export function getWuxingColor(wuxing: string): string {
  const colors: Record<string, string> = {
    '金': '#FFD700',
    '木': '#228B22',
    '水': '#1E90FF',
    '火': '#FF4500',
    '土': '#8B4513',
  };
  return colors[wuxing] || '#666';
}

export default liuShiSiGua;
