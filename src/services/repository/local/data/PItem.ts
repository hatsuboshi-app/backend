import { DBPItem, PItemSource, Plan, Rarity } from "@hatsuboshi/types"

const PItemDataset: DBPItem[] = [
    {
        "id": "item-000001",
        "createdAt": "2025-08-25T04:27:13.282Z",
        "updatedAt": "2025-08-25T04:27:13.282Z",
        "name": {
            "ja": "しゅきしゅきはーと",
            "ro": "Shuki-shuki Haato",
            "en": "Shuki-shuki Heart"
        },
        "assetUrl": "",
        "plan": Plan.Sense,
        "rarity": Rarity.SSR,
        "source": PItemSource.PIdol,
        "unlockLevel": 0,
        "initialEffect": {
            "refs": [
                {
                    "id": "r001",
                    "refId": "terminology-000009",
                    "refType": 0
                },
                {
                    "id": "r002",
                    "refId": "effect-000003",
                    "refType": 1
                },
                {
                    "id": "r003",
                    "refId": "effect-000005",
                    "refType": 1
                },
                {
                    "id": "r004",
                    "refId": "terminology-000001",
                    "refType": 0
                },
                {
                    "id": "r005",
                    "refId": "terminology-000002",
                    "refType": 0
                },
                {
                    "id": "r006",
                    "refId": "effect-000006",
                    "refType": 1
                },
                {
                    "id": "r007",
                    "refId": "terminology-000003",
                    "refType": 0
                }
            ],
            "vars": [
                {
                    "id": "v001",
                    "value": 13
                },
                {
                    "id": "v002",
                    "value": 2
                },
                {
                    "id": "v004",
                    "value": 1
                },
                {
                    "id": "v005",
                    "value": 1
                },
                {
                    "id": "v006",
                    "value": 1
                },
                {
                    "id": "v007",
                    "value": 1
                }
            ],
            "lines": [
                {
                    "position": 0,
                    "body": {
                        "ja": "{r001}使用後、{r002}が{v001}以上の場合、{r003}+{v002}",
                        "en": "If {r002} is at or above {v001} after using a {r001}, +{v002} {r003}"
                    }
                },
                {
                    "position": 1,
                    "body": {
                        "ja": "次に使用する{r001}の効果をもう1回発動（{v004}回・{v005}{r004}）",
                        "en": "The next {r001} used will have its effects invoked twice ({v004} time{plural_s@v004}, within {v005} {r004}{plural_s@v005})"
                    }
                },
                {
                    "position": 2,
                    "body": {
                        "ja": "{r005}を引く",
                        "en": "Draw a {r005}"
                    }
                },
                {
                    "position": 3,
                    "body": {
                        "ja": "{r006}+{v006}",
                        "en": "+{v006} {r006}"
                    }
                },
                {
                    "position": 4,
                    "body": {
                        "ja": "（{r007}内{v007}回）",
                        "en": "({v007} time{plural_s@v007} per {r007})"
                    }
                }
            ]
        },
        "upgradeLevels": [
            {
                "level": 1,
                "mods": [
                    {
                        "type": 0,
                        "var": "v002",
                        "value": 8
                    },
                    {
                        "type": 2,
                        "refs": [],
                        "vars": [
                            {
                                "id": "v101",
                                "value": 2
                            }
                        ],
                        "line": {
                            "position": 2,
                            "body": {
                                "ja": "{r005}を{v101}枚引く",
                                "en": "Draw {v101} {r005}{plural_s@v101}"
                            }
                        }
                    }
                ]
            }
        ]
    }
]

export default PItemDataset