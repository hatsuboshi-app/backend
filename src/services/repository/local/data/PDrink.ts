import { DBPDrink, Plan, Rarity } from "@hatsuboshi/types"

const PDrinkDataset: DBPDrink[] = [
    {
        "id": "drink-000001",
        "createdAt": "2025-08-24T09:57:37.345Z",
        "updatedAt": "2025-08-24T09:57:37.345Z",
        "name": {
            "ja": "初星黒酢",
            "ro": "Hatsuboshi Kurozu",
            "en": "Hatsuboshi Vinegar"
        },
        "assetUrl": "",
        "plan": Plan.Sense,
        "rarity": Rarity.SSR,
        "unlockLevel": 61,
        "effect": {
            "refs": [
                {
                    "id": "r001",
                    "refId": "effect-000001",
                    "refType": 1
                },
                {
                    "id": "r002",
                    "refId": "effect-000007",
                    "refType": 1
                },
                {
                    "id": "r003",
                    "refId": "terminology-000010",
                    "refType": 0
                },
                {
                    "id": "r004",
                    "refId": "terminology-000011",
                    "refType": 0
                },
                {
                    "id": "r005",
                    "refId": "terminology-000002",
                    "refType": 0
                },
                {
                    "id": "r006",
                    "refId": "terminology-000012",
                    "refType": 0
                },
                {
                    "id": "r007",
                    "refId": "terminology-000013",
                    "refType": 0
                },
                {
                    "id": "r008",
                    "refId": "terminology-000001",
                    "refType": 0
                }
            ],
            "vars": [
                {
                    "id": "v001",
                    "value": 0
                },
                {
                    "id": "v002",
                    "value": 2
                },
                {
                    "id": "v003",
                    "value": 2
                },
                {
                    "id": "v004",
                    "value": 1
                }
            ],
            "lines": [
                {
                    "position": 0,
                    "body": {
                        "ja": "{r003}か{r004}にある{r005}を選択し、{r006}に移動",
                        "en": "Pick a {r005} from the {r003} or the {r004}, and move it to {r006}"
                    }
                },
                {
                    "position": 1,
                    "body": {
                        "ja": "次に使用した{r005}の{r008}を{v001}にする（{v002}回）",
                        "en": "The next {r005} used will consume {v001} {r008} ({v002} time{plural_s@v002})"
                    }
                },
                {
                    "position": 2,
                    "body": {
                        "ja": "{r001}{v003}",
                        "en": "{v003} {r001}"
                    }
                },
                {
                    "position": 2,
                    "body": {
                        "ja": "{r002}{v004}{r008}",
                        "en": "+{v004} {r008}{plural_s@v004} {v003}"
                    }
                }
            ]
        }
    }
]

export default PDrinkDataset