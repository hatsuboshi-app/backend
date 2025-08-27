import { DBSkill, Plan, SkillCategory, SkillRarity, SkillSource } from "@hatsuboshi/types"

const SkillDataset: DBSkill[] = [
    {
        "id": "skill-000001",
        "createdAt": "2025-08-25T04:29:40.154Z",
        "updatedAt": "2025-08-25T04:29:40.154Z",
        "name": {
            "ja": "自己肯定感爆上げ↑↑",
            "ro": "Jikokouteikan Bakuage ↑↑",
            "en": "Self-affirmation Explosion ↑↑"
        },
        "assetUrl": "",
        "plan": Plan.Sense,
        "rarity": SkillRarity.SSR,
        "category": SkillCategory.Mental,
        "source": SkillSource.PIdol,
        "unlockLevel": 0,
        "initialStaminaCost": 0,
        "initialFlags": {
            "isInitial": false,
            "isUnique": true,
            "isOnceOnly": true
        },
        "upgradeLevels": [
            {
                "level": 1,
                "mods": [
                    {
                        "type": 0,
                        "var": "v001",
                        "value": -1
                    },
                    {
                        "type": 1,
                        "refs": [],
                        "vars": [
                            {
                                "id": "v101",
                                "value": 1
                            }
                        ],
                        "line": {
                            "position": 0.5,
                            "body": {
                                "ja": "{r003}+{v101}",
                                "en": "+{v101} {r003}"
                            },
                            "effectIcon": "effect-000003"
                        }
                    }
                ]
            }
        ],
        "customizeOptions": [],
        "initialCustomizeLimit": 0,
        "initialEffect": {
            "refs": [
                {
                    "id": "r001",
                    "refId": "effect-000001",
                    "refType": 1
                },
                {
                    "id": "r002",
                    "refId": "terminology-000009",
                    "refType": 0
                },
                {
                    "id": "r003",
                    "refId": "effect-000003",
                    "refType": 1
                }
            ],
            "vars": [
                {
                    "id": "v001",
                    "value": 3
                },
                {
                    "id": "v002",
                    "value": 2
                }
            ],
            "lines": [
                {
                    "position": 0,
                    "body": {
                        "ja": "{r001}{v001}",
                        "en": "{v001} {r001}"
                    },
                    "effectIcon": null
                },
                {
                    "position": 1,
                    "body": {
                        "ja": "以降、{r002}使用時、{r003}+{v002}",
                        "en": "Passive Effect: +{v002} {r003} when using a {r002}"
                    },
                    "effectIcon": "effect-000004"
                }
            ],
            "customizedVars": [],
            "customizedLines": [],
            "energyGainVar": null,
            "scoreGainVar": null,
            "scoreGainMultiplier": null,
            "costRef": "r001",
            "costVar": "v001"
        }
    }
]

export default SkillDataset