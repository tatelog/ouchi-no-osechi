const regionalDishes = [
  {
    "name": "ししゃもの甘露煮",
    "pref": "北海道",
    "area": "胆振・日高・釧路・十勝地方",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/shishamonokanroni_hokkaido.html",
    "region": "北海道",
    "category": 1,
    "ratio": 1.533
  },
  {
    "name": "たらの子和え",
    "pref": "青森県",
    "area": "津軽地方",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/taranoko_ae_aomori.html",
    "region": "東北",
    "category": 1,
    "ratio": 1.146
  },
  {
    "name": "氷頭なます",
    "pref": "岩手県",
    "area": "三陸沿岸地域・県央地域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/28_12_iwate.html",
    "region": "東北",
    "category": 1,
    "ratio": 1.143
  },
  {
    "name": "ナメタガレイの煮つけ",
    "pref": "宮城県",
    "area": "仙台市",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/nameta_gareino_nitsuke_miyagi.html",
    "region": "東北",
    "category": 1,
    "ratio": 1.286
  },
  {
    "name": "ハタハタ寿し",
    "pref": "秋田県",
    "area": "全域（沿岸部が中心）",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/29_2_akita.html",
    "region": "東北",
    "category": 1,
    "ratio": 1.169
  },
  {
    "name": "からかい煮",
    "pref": "山形県",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/karakaini_yamagata.html",
    "region": "東北",
    "category": 1,
    "ratio": 1
  },
  {
    "name": "豆数の子",
    "pref": "福島県",
    "area": "郡山市・いわき市・福島市",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/30_13_fukushima.html",
    "region": "東北",
    "category": 3,
    "ratio": 1
  },
  {
    "name": "煮合い",
    "pref": "茨城県",
    "area": "県央地域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/niai_ibaraki.html",
    "region": "関東",
    "category": 3,
    "ratio": 1.103
  },
  {
    "name": "揚げまき湯波の煮物",
    "pref": "栃木県",
    "area": "日光市",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/31_16_tochigi.html",
    "region": "関東",
    "category": 3,
    "ratio": 1.068
  },
  {
    "name": "しめ豆腐",
    "pref": "群馬県",
    "area": "沼田市・利根郡・神流町・長野原町",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/32_6_gunma.html",
    "region": "関東",
    "category": 3,
    "ratio": 1
  },
  {
    "name": "ゆず巻き",
    "pref": "埼玉県",
    "area": "秩父地域・越生町・毛呂山町",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/33_17_saitama.html",
    "region": "関東",
    "category": 3,
    "ratio": 1.112
  },
  {
    "name": "せぐろいわしのごま漬け",
    "pref": "千葉県",
    "area": "九十九里町",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/seguro_iwashi_no_gomazuke_chiba.html",
    "region": "関東",
    "category": 1,
    "ratio": 1.215
  },
  {
    "name": "べったら漬け",
    "pref": "東京都",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/34_8_tokyo.html",
    "region": "関東",
    "category": 3,
    "ratio": 1.186
  },
  {
    "name": "小田原かまぼこ",
    "pref": "神奈川県",
    "area": "小田原市",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/35_19_kanagawa.html",
    "region": "関東",
    "category": 1,
    "ratio": 1.24
  },
  {
    "name": "佐渡の煮しめ",
    "pref": "新潟県",
    "area": "佐渡市",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/sadono_nishime_niigata.html",
    "region": "甲信越",
    "category": 3,
    "ratio": 1.103
  },
  {
    "name": "おすわい／すばい",
    "pref": "富山県",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/37_15_toyama.html",
    "region": "北陸",
    "category": 3,
    "ratio": 1.136
  },
  {
    "name": "大根ずし",
    "pref": "石川県",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/daikonzushi_ishikawa.html",
    "region": "北陸",
    "category": 1,
    "ratio": 1.059
  },
  {
    "name": "長寿なます",
    "pref": "福井県",
    "area": "嶺北地方",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/chouju_namasu_fukui.html",
    "region": "北陸",
    "category": 3,
    "ratio": 1.086
  },
  {
    "name": "あわびの煮貝",
    "pref": "山梨県",
    "area": "甲府市",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/awabino_nigai_yama_nashi.html",
    "region": "甲信越",
    "category": 1,
    "ratio": 1.342
  },
  {
    "name": "いもなます",
    "pref": "長野県",
    "area": "北信地域（飯山市）",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/imo_namasu_nagano.html",
    "region": "甲信越",
    "category": 3,
    "ratio": 1.1
  },
  {
    "name": "ねずし",
    "pref": "岐阜県",
    "area": "飛騨地域（下呂市中心）・中濃地域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/38_12_gifu.html",
    "region": "東海",
    "category": 1,
    "ratio": 1.239
  },
  {
    "name": "落花生なます",
    "pref": "静岡県",
    "area": "東部地域（富士宮市・富士市）",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/36_21_shizuoka.html",
    "region": "東海",
    "category": 3,
    "ratio": 1.099
  },
  {
    "name": "はぜ佃煮",
    "pref": "愛知県",
    "area": "沿岸地域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/hazetsukudani_aichi.html",
    "region": "東海",
    "category": 1,
    "ratio": 1.428
  },
  {
    "name": "あらめ巻き",
    "pref": "三重県",
    "area": "伊勢志摩（鳥羽地域の答志島・神島など）・北勢・東紀州",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/arame_maki_mie.html",
    "region": "東海",
    "category": 1,
    "ratio": 1.102
  },
  {
    "name": "えび豆",
    "pref": "滋賀県",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/ebimame_shiga.html",
    "region": "近畿",
    "category": 3,
    "ratio": 1.198
  },
  {
    "name": "古老柿なます",
    "pref": "京都府",
    "area": "山城地域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/korokakinamasu_kyoto.html",
    "region": "近畿",
    "category": 3,
    "ratio": 1.146
  },
  {
    "name": "ごより豆/じゃこ豆",
    "pref": "大阪府",
    "area": "泉州地域～河内地域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/39_6_osaka.html",
    "region": "近畿",
    "category": 3,
    "ratio": 1.15
  },
  {
    "name": "焼きアナゴ",
    "pref": "兵庫県",
    "area": "播磨地区",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/40_21_hyogo.html",
    "region": "近畿",
    "category": 1,
    "ratio": 1.179
  },
  {
    "name": "柿の葉寿司",
    "pref": "奈良県",
    "area": "五條市・吉野地域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/kakinoha_zushi_nara.html",
    "region": "近畿",
    "category": 1,
    "ratio": 1.046
  },
  {
    "name": "いがみの煮付け",
    "pref": "和歌山県",
    "area": "田辺市周辺",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/igamino_nitsuke_wakayama.html",
    "region": "近畿",
    "category": 1,
    "ratio": 1.228
  },
  {
    "name": "アカガレイの子まぶり",
    "pref": "鳥取県",
    "area": "岩美町網代周辺",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/aka_garei_no_komaburi_tottori.html",
    "region": "中国",
    "category": 1,
    "ratio": 1.104
  },
  {
    "name": "スズキの奉書焼き",
    "pref": "島根県",
    "area": "松江市",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/suzukinohoshoyaki_shimane.html",
    "region": "中国",
    "category": 1,
    "ratio": 1.295
  },
  {
    "name": "ママカリの酢漬け",
    "pref": "岡山県",
    "area": "瀬戸内海沿岸",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/41_3_okayama.html",
    "region": "中国",
    "category": 1,
    "ratio": 1.284
  },
  {
    "name": "八寸",
    "pref": "広島県",
    "area": "熊野町・安芸高田市",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/42_3_hiroshima.html",
    "region": "中国",
    "category": 3,
    "ratio": 1
  },
  {
    "name": "はすのさんばい",
    "pref": "山口県",
    "area": "岩国地域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/43_12_yamaguchi.html",
    "region": "中国",
    "category": 3,
    "ratio": 1.178
  },
  {
    "name": "ならえ",
    "pref": "徳島県",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/44_13_tokushima.html",
    "region": "四国",
    "category": 3,
    "ratio": 1.175
  },
  {
    "name": "しょうゆ豆",
    "pref": "香川県",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/shouyu_mame_kagawa.html",
    "region": "四国",
    "category": 3,
    "ratio": 1.154
  },
  {
    "name": "ふくめん",
    "pref": "愛媛県",
    "area": "宇和島市周辺",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/fukumen_ehime.html",
    "region": "四国",
    "category": 1,
    "ratio": 1.107
  },
  {
    "name": "暮れの煮物",
    "pref": "高知県",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/kurenonimono_kochi.html",
    "region": "四国",
    "category": 3,
    "ratio": 1.146
  },
  {
    "name": "のうさば",
    "pref": "福岡県",
    "area": "鐘崎地域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/nousaba_fukuoka.html",
    "region": "九州",
    "category": 1,
    "ratio": 1
  },
  {
    "name": "ふなんこぐい",
    "pref": "佐賀県",
    "area": "全域（鹿島市など）",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/45_1_saga.html",
    "region": "九州",
    "category": 1,
    "ratio": 1
  },
  {
    "name": "アルマド",
    "pref": "長崎県",
    "area": "平戸地区",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/46_21_nagasaki.html",
    "region": "九州",
    "category": 4,
    "ratio": 1
  },
  {
    "name": "焼鮎の甘露煮",
    "pref": "熊本県",
    "area": "人吉・球磨地域・八代地域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/yakiayu_no_kanroni_kumamoto.html",
    "region": "九州",
    "category": 1,
    "ratio": 1.786
  },
  {
    "name": "くじゃく",
    "pref": "大分県",
    "area": "佐伯市蒲江地区",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/kujaku_oita.html",
    "region": "九州",
    "category": 4,
    "ratio": 1
  },
  {
    "name": "おび天",
    "pref": "宮崎県",
    "area": "飫肥地区",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/obiten_miyazaki.html",
    "region": "九州",
    "category": 1,
    "ratio": 1.201
  },
  {
    "name": "つけあげ",
    "pref": "鹿児島県",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/tsukeage_kagoshima.html",
    "region": "九州",
    "category": 1,
    "ratio": 1.146
  },
  {
    "name": "クーブイリチー",
    "pref": "沖縄県",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/47_2_okinawa.html",
    "region": "沖縄",
    "category": 3,
    "ratio": 1.116
  },
  {
    "name": "松前漬け",
    "pref": "北海道",
    "area": "道南・松前町（発祥地）",
    "url": "https://www.maff.go.jp/hokkaido/suishin/shokuiku/dentoshoku_matumaeduke.html",
    "category": 1,
    "region": "北海道",
    "ratio": 1
  },
  {
    "name": "かぶらずし",
    "pref": "石川県",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/kaburazushi_ishikawa.html",
    "category": 1,
    "region": "北陸",
    "ratio": 1
  },
  {
    "name": "べろべろの白い仕立て",
    "pref": "石川県",
    "area": "加賀地方（小松・加賀地区）",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/ebisu_ishikawa.html",
    "category": 4,
    "region": "北陸",
    "ratio": 1
  },
  {
    "name": "卵寒天",
    "pref": "秋田県",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/29_11_akita.html",
    "category": 4,
    "region": "東北",
    "ratio": 1
  },
  {
    "name": "こはだの粟づけ",
    "pref": "東京都",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/34_21_tokyo.html",
    "category": 1,
    "region": "関東",
    "ratio": 1
  },
  {
    "name": "こも豆腐",
    "pref": "岐阜県",
    "area": "飛騨地域（飛騨市・高山市を中心）",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/38_29_gifu.html",
    "category": 3,
    "region": "東海",
    "ratio": 1
  },
  {
    "name": "ちゃつ",
    "pref": "三重県",
    "area": "北勢・中南勢食文化圏",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/chatsu_mie.html",
    "category": 3,
    "region": "東海",
    "ratio": 1
  },
  {
    "name": "柿なます",
    "pref": "奈良県",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/kaki_namasu_nara.html",
    "category": 3,
    "region": "近畿",
    "ratio": 1
  },
  {
    "name": "がめ煮",
    "pref": "福岡県",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/gameni_gukuoka.html",
    "category": 2,
    "region": "九州",
    "ratio": 1
  },
  {
    "name": "ターンムディンガク",
    "pref": "沖縄県",
    "area": "全域",
    "url": "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/47_7_okinawa.html",
    "category": 3,
    "region": "沖縄",
    "ratio": 1
  }
];
