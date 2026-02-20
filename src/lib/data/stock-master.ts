export interface StockMasterEntry {
  symbol: string;
  name: string;
  sector: string;
}

export const stockMaster: StockMasterEntry[] = [
  // 自動車
  { symbol: "7203.T", name: "トヨタ自動車", sector: "自動車" },
  { symbol: "7267.T", name: "本田技研工業", sector: "自動車" },
  { symbol: "7269.T", name: "スズキ", sector: "自動車" },
  { symbol: "6902.T", name: "デンソー", sector: "自動車部品" },

  // 電気機器・半導体
  { symbol: "6758.T", name: "ソニーグループ", sector: "電気機器" },
  { symbol: "6861.T", name: "キーエンス", sector: "電気機器" },
  { symbol: "6501.T", name: "日立製作所", sector: "電気機器" },
  { symbol: "6857.T", name: "アドバンテスト", sector: "半導体" },
  { symbol: "8035.T", name: "東京エレクトロン", sector: "半導体" },
  { symbol: "6723.T", name: "ルネサスエレクトロニクス", sector: "半導体" },
  { symbol: "6594.T", name: "ニデック", sector: "電気機器" },
  { symbol: "6367.T", name: "ダイキン工業", sector: "機械" },

  // 精密機器
  { symbol: "7741.T", name: "HOYA", sector: "精密機器" },

  // 化学
  { symbol: "4063.T", name: "信越化学工業", sector: "化学" },

  // 銀行・保険・金融
  { symbol: "8306.T", name: "三菱UFJフィナンシャル", sector: "銀行" },
  { symbol: "8316.T", name: "三井住友フィナンシャル", sector: "銀行" },
  { symbol: "8411.T", name: "みずほフィナンシャル", sector: "銀行" },
  { symbol: "8766.T", name: "東京海上ホールディングス", sector: "保険" },

  // 商社
  { symbol: "8058.T", name: "三菱商事", sector: "商社" },
  { symbol: "8031.T", name: "三井物産", sector: "商社" },
  { symbol: "8001.T", name: "伊藤忠商事", sector: "商社" },
  { symbol: "8053.T", name: "住友商事", sector: "商社" },
  { symbol: "8002.T", name: "丸紅", sector: "商社" },

  // 情報・通信
  { symbol: "9984.T", name: "ソフトバンクグループ", sector: "情報・通信" },
  { symbol: "9432.T", name: "日本電信電話", sector: "情報・通信" },
  { symbol: "9433.T", name: "KDDI", sector: "情報・通信" },
  { symbol: "9434.T", name: "ソフトバンク", sector: "情報・通信" },

  // 医薬品
  { symbol: "4502.T", name: "武田薬品工業", sector: "医薬品" },
  { symbol: "4503.T", name: "アステラス製薬", sector: "医薬品" },
  { symbol: "4568.T", name: "第一三共", sector: "医薬品" },

  // 小売・消費財
  { symbol: "9983.T", name: "ファーストリテイリング", sector: "小売" },
  { symbol: "7974.T", name: "任天堂", sector: "娯楽" },

  // 不動産
  { symbol: "8802.T", name: "三菱地所", sector: "不動産" },

  // エネルギー
  { symbol: "1605.T", name: "INPEX", sector: "エネルギー" },
  { symbol: "5020.T", name: "ENEOSホールディングス", sector: "エネルギー" },
  { symbol: "9531.T", name: "東京ガス", sector: "エネルギー" },
  { symbol: "9503.T", name: "関西電力", sector: "エネルギー" },
  { symbol: "9501.T", name: "東京電力ホールディングス", sector: "エネルギー" },

  // 建設
  { symbol: "1801.T", name: "大成建設", sector: "建設" },
  { symbol: "1802.T", name: "大林組", sector: "建設" },
  { symbol: "1803.T", name: "清水建設", sector: "建設" },
  { symbol: "1812.T", name: "鹿島建設", sector: "建設" },

  // AI関連
  { symbol: "3993.T", name: "PKSHA Technology", sector: "AI関連" },
  { symbol: "4382.T", name: "HEROZ", sector: "AI関連" },
  { symbol: "4488.T", name: "AI inside", sector: "AI関連" },
  { symbol: "3655.T", name: "ブレインパッド", sector: "AI関連" },
  { symbol: "4180.T", name: "Appier Group", sector: "AI関連" },

  // 鉄鋼・素材
  { symbol: "5401.T", name: "日本製鉄", sector: "鉄鋼" },

  // 運輸
  { symbol: "9020.T", name: "東日本旅客鉄道", sector: "運輸" },
];

export const masterSymbols: string[] = stockMaster.map((s) => s.symbol);
