import { DBCharacter, ProduceScenario } from "@hatsuboshi/types"

const CharacterDataset: DBCharacter[] = [
    {
        "id": "character-000001",
        "createdAt": "2025-08-24T08:33:44.184Z",
        "updatedAt": "2025-08-24T08:33:44.184Z",
        "lastName": {
            "ja": "花海",
            "en": "Hanami"
        },
        "firstName": {
            "ja": "咲季",
            "en": "Saki"
        },
        "isPlayable": true,
        "color": {
            "main": "FF4F64",
            "gradient1": "FF5064",
            "gradient2": "FFBBA7",
            "text": "F83148",
            "label": "FFFFFF"
        },
        "assetUrl": "",
        "detail": {
            "height": 152,
            "weight": 45,
            "threeSizes": [
                84,
                55,
                80
            ],
            "age": 16,
            "birthday": {
                "month": 4,
                "day": 2
            },
            "grade": {
                "ja": "1年生",
                "en": "1st Year"
            },
            "bloodType": {
                "ja": "A",
                "en": "A"
            },
            "zodiacSign": {
                "ja": "おひつじ座",
                "en": "Aries"
            },
            "cv": {
                "ja": "長月 あおい",
                "en": "Nagatsuki Aoi"
            },
            "dominantHand": {
                "ja": "左",
                "en": "Left"
            },
            "birthplace": {
                "ja": "愛知県",
                "en": "Aichi Prefecture"
            },
            "specialSkill": {
                "ja": "運動全般、家事全般、マッサージ",
                "en": "All sorts of sports; All sorts of chores; Giving massages"
            },
            "hobby": {
                "ja": "勝負ごと全般",
                "en": "All sorts of picking fights"
            },
            "introduction": {
                "ja": "入学試験主席の新入生。勝ち気で負けず嫌いな元アスリート。\n優れた身体能力は、全校生徒中、上位１０パーセントに入るほど。\n未経験者ながら、きわめて飲み込みがよく、成長が早い。\nすでに完成されつつある能力は、大きな成長が見込めないようにも思えるが……",
                "en": ""
            }
        },
        "trueEndBonuses": [
            {
                "scenario": ProduceScenario.Hajime,
                "parameter": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "growth": {
                    "vo": 3,
                    "da": 3,
                    "vi": 3
                },
                "stamina": 0
            },
            {
                "scenario": ProduceScenario.NextIdolAudition,
                "parameter": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "growth": {
                    "vo": 1.5,
                    "da": 1.5,
                    "vi": 2.5
                },
                "stamina": 0
            }
        ]
    },
    {
        "id": "character-000002",
        "createdAt": "2025-08-24T08:33:44.184Z",
        "updatedAt": "2025-08-24T08:33:44.184Z",
        "lastName": {
            "ja": "藤田",
            "en": "Fujita"
        },
        "firstName": {
            "ja": "ことね",
            "en": "Kotone"
        },
        "isPlayable": true,
        "color": {
            "main": "FFD203",
            "gradient1": "F8D721",
            "gradient2": "FFB5DA",
            "text": "E6A800",
            "label": "333333"
        },
        "assetUrl": "",
        "detail": {
            "height": 156,
            "weight": 40,
            "threeSizes": [
                75,
                55,
                75
            ],
            "age": 15,
            "birthday": {
                "month": 4,
                "day": 29
            },
            "grade": {
                "ja": "1年生",
                "en": "1st Year"
            },
            "bloodType": {
                "ja": "O",
                "en": "O"
            },
            "zodiacSign": {
                "ja": "おうし座",
                "en": "Taurus"
            },
            "cv": {
                "ja": "飯田 ヒカル",
                "en": "Iida Hikaru"
            },
            "dominantHand": {
                "ja": "右",
                "en": "Right"
            },
            "birthplace": {
                "ja": "埼玉県",
                "en": "Saitama Prefecture"
            },
            "specialSkill": {
                "ja": "ダンス、人の顔と名前を覚えること",
                "en": "Dance; Remembering the faces and names of people"
            },
            "hobby": {
                "ja": "お金を稼ぐこと",
                "en": "Making money"
            },
            "introduction": {
                "ja": "「稼げるアイドル」を目指すムードメーカー。\n中等部からの内部進学組。ダンスの才能に富。\n学園評価、自己評価ともに低いが、本調子ではないように見える。\nたくさんのアルバイトを掛け持   ちしているせいで、いつも疲れているようだ。",
                "en": ""
            }
        },
        "trueEndBonuses": [
            {
                "scenario": ProduceScenario.Hajime,
                "parameter": {
                    "vo": 0,
                    "da": 0,
                    "vi": 10
                },
                "growth": {
                    "vo": 0,
                    "da": 6,
                    "vi": 0
                },
                "stamina": 4
            },
            {
                "scenario": ProduceScenario.NextIdolAudition,
                "parameter": {
                    "vo": 0,
                    "da": 10,
                    "vi": 10
                },
                "growth": {
                    "vo": 2,
                    "da": 0.5,
                    "vi": 0.5
                },
                "stamina": 0
            }
        ]
    },
    {
        "id": "character-000003",
        "createdAt": "2025-08-24T08:33:44.184Z",
        "updatedAt": "2025-08-24T08:33:44.184Z",
        "lastName": {
            "ja": "月村",
            "en": "Tsukimura"
        },
        "firstName": {
            "ja": "手毬",
            "en": "Temari"
        },
        "isPlayable": true,
        "color": {
            "main": "27B4EB",
            "gradient1": "26B4EB",
            "gradient2": "87E9E2",
            "text": "009FDD",
            "label": "FFFFFF"
        },
        "assetUrl": "",
        "detail": {
            "height": 162,
            "weight": 51,
            "threeSizes": [
                82,
                58,
                86
            ],
            "age": 15,
            "birthday": {
                "month": 6,
                "day": 3
            },
            "grade": {
                "ja": "1年生",
                "en": "1st Year"
            },
            "bloodType": {
                "ja": "AB",
                "en": "AB"
            },
            "zodiacSign": {
                "ja": "ふたご座",
                "en": "Gemini"
            },
            "cv": {
                "ja": "小鹿 なお",
                "en": "Ojika Nao"
            },
            "dominantHand": {
                "ja": "右",
                "en": "Right"
            },
            "birthplace": {
                "ja": "京都府",
                "en": "Kyoto Prefecture"
            },
            "specialSkill": {
                "ja": "歌",
                "en": "Singing"
            },
            "hobby": {
                "ja": "美味しいものを食べること（封印中）",
                "en": "Eating delicious foods (currently sealed away)"
            },
            "introduction": {
                "ja": "中等部ナンバーワンユニット「SyngUp!」の元メンバー。\n1年生にして、すでに一線級の歌唱力を持つ。\n素行に問題あり。悪い噂多し。トラブルメーカー。",
                "en": ""
            }
        },
        "trueEndBonuses": [
            {
                "scenario": ProduceScenario.Hajime,
                "parameter": {
                    "vo": 10,
                    "da": 0,
                    "vi": 0
                },
                "growth": {
                    "vo": 0,
                    "da": 5,
                    "vi": 0
                },
                "stamina": 2
            },
            {
                "scenario": ProduceScenario.NextIdolAudition,
                "parameter": {
                    "vo": 10,
                    "da": 10,
                    "vi": 0
                },
                "growth": {
                    "vo": 0,
                    "da": 0.5,
                    "vi": 2.5
                },
                "stamina": 0
            }
        ]
    },
]

export default CharacterDataset