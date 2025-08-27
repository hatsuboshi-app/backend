import { AbilityIconColor, DBPIdol, PIdolPlan, PIdolSubplan, Rarity } from "@hatsuboshi/types"

const PIdolDataset: DBPIdol[] = [
    {
        "id": "idol-000001",
        "createdAt": "2025-08-25T04:20:59.842Z",
        "updatedAt": "2025-08-25T04:20:59.842Z",
        "name": {
            "ja": "自己肯定感爆上げ↑↑しゅきしゅきソング",
            "ro": "Jikokouteikan Bakuage ↑↑ Shuki-shuki Song",
            "en": "Self-affirmation Explosion ↑↑ Shuki-shuki Song"
        },
        "visual": {
            "default": {
                "regular": {
                    "fullAssetUrl": "",
                    "thumbnailAssetUrl": ""
                },
                "idolized": {
                    "fullAssetUrl": "",
                    "thumbnailAssetUrl": ""
                }
            },
            "another": []
        },
        "rarity": Rarity.SSR,
        "plan": PIdolPlan.Sense,
        "subplan": PIdolSubplan.Focus,
        "isWelfare": false,
        "initialStamina": 31,
        "initialParameter": {
            "vo": 65,
            "da": 65,
            "vi": 95
        },
        "initialGrowth": {
            "vo": 8,
            "da": 24.5,
            "vi": 22.5
        },
        "character": "character-000001",
        "signatureSkill": "skill-000001",
        "signaturePItem": "item-000001",
        "initialAbilities": [],
        "trainingLevels": [
            {
                "level": 1,
                "parameter": {
                    "vo": 10,
                    "da": 10,
                    "vi": 10
                },
                "growth": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "stamina": 0,
                "triggers": {},
                "abilityUpgradePositions": [],
                "abilities": []
            },
            {
                "level": 2,
                "parameter": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "growth": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "stamina": 0,
                "triggers": {},
                "abilityUpgradePositions": [],
                "abilities": [
                    {
                        "icon": {
                            "color": AbilityIconColor.Blue,
                            "iconAssetId": "",
                            "iconScale": 1
                        },
                        "position": 0,
                        "initialEffect": {
                            "refs": [
                                {
                                    "id": "r001",
                                    "refId": "terminology-000004",
                                    "refType": 0
                                },
                                {
                                    "id": "r002",
                                    "refId": "terminology-000005",
                                    "refType": 0
                                },
                                {
                                    "id": "r003",
                                    "refId": "terminology-000006",
                                    "refType": 0
                                },
                                {
                                    "id": "r004",
                                    "refId": "terminology-000007",
                                    "refType": 0
                                }
                            ],
                            "vars": [
                                {
                                    "id": "v001",
                                    "value": 5
                                }
                            ],
                            "lines": [
                                {
                                    "position": 0,
                                    "body": {
                                        "ja": "{r001}、{r002}、{r003}すべての{r004}発生率+{v001}%",
                                        "en": "Occurrence chance of {r001}, {r002} and {r003} {r004}s +{v001}%"
                                    }
                                }
                            ]
                        },
                        "levels": [
                            {
                                "level": 1,
                                "mods": [
                                    {
                                        "type": 0,
                                        "var": "v001",
                                        "value": 5
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "level": 3,
                "parameter": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "growth": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "stamina": 0,
                "triggers": {
                    "visualUpgrade": true,
                    "skillUpgrade": true
                },
                "abilityUpgradePositions": [],
                "abilities": []
            },
            {
                "level": 4,
                "parameter": {
                    "vo": 15,
                    "da": 15,
                    "vi": 15
                },
                "growth": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "stamina": 0,
                "triggers": {},
                "abilityUpgradePositions": [],
                "abilities": []
            },
            {
                "level": 5,
                "parameter": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "growth": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "stamina": 3,
                "triggers": {},
                "abilityUpgradePositions": [],
                "abilities": []
            },
            {
                "level": 6,
                "parameter": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "growth": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "stamina": 0,
                "triggers": {},
                "abilityUpgradePositions": [
                    0
                ],
                "abilities": []
            }
        ],
        "potentialLevels": [
            {
                "level": 1,
                "parameter": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "growth": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "stamina": 0,
                "triggers": {},
                "abilityUpgradePositions": [],
                "abilities": [
                    {
                        "icon": {
                            "color": AbilityIconColor.Blue,
                            "iconAssetId": "",
                            "iconScale": 1
                        },
                        "position": 1,
                        "initialEffect": {
                            "refs": [
                                {
                                    "id": "r001",
                                    "refId": "terminology-000002",
                                    "refType": 0
                                },
                                {
                                    "id": "r002",
                                    "refId": "terminology-000008",
                                    "refType": 0
                                }
                            ],
                            "vars": [
                                {
                                    "id": "v001",
                                    "value": 1
                                }
                            ],
                            "lines": [
                                {
                                    "position": 0,
                                    "body": {
                                        "ja": "獲得{r001}{r002}回数+{v001}",
                                        "en": "{r001} {r002} Opportunity +{v001}"
                                    }
                                }
                            ]
                        },
                        "levels": [
                            {
                                "level": 1,
                                "mods": [
                                    {
                                        "type": 0,
                                        "var": "v001",
                                        "value": 1
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "level": 2,
                "parameter": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "growth": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "stamina": 0,
                "triggers": {
                    "pItemUpgrade": true
                },
                "abilityUpgradePositions": [],
                "abilities": []
            },
            {
                "level": 3,
                "parameter": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "growth": {
                    "vo": 0,
                    "da": 5,
                    "vi": 3
                },
                "stamina": 0,
                "triggers": {},
                "abilityUpgradePositions": [],
                "abilities": []
            },
            {
                "level": 4,
                "parameter": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "growth": {
                    "vo": 0,
                    "da": 0,
                    "vi": 0
                },
                "stamina": 3,
                "triggers": {
                    "altOutfitUnlock": true
                },
                "abilityUpgradePositions": [
                    1
                ],
                "abilities": []
            }
        ]
    }
]

export default PIdolDataset