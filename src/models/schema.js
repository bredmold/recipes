export const schema = {
    "models": {
        "Recipe": {
            "name": "Recipe",
            "fields": {
                "id": {
                    "name": "id",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "title": {
                    "name": "title",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "description": {
                    "name": "description",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "steps": {
                    "name": "steps",
                    "isArray": true,
                    "type": {
                        "nonModel": "RecipeStep"
                    },
                    "isRequired": true,
                    "attributes": [],
                    "isArrayNullable": false
                },
                "ingredients": {
                    "name": "ingredients",
                    "isArray": true,
                    "type": {
                        "nonModel": "RecipeIngredient"
                    },
                    "isRequired": true,
                    "attributes": [],
                    "isArrayNullable": false
                },
                "createdAt": {
                    "name": "createdAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                },
                "updatedAt": {
                    "name": "updatedAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                }
            },
            "syncable": true,
            "pluralName": "Recipes",
            "attributes": [
                {
                    "type": "model",
                    "properties": {}
                },
                {
                    "type": "auth",
                    "properties": {
                        "rules": [
                            {
                                "allow": "public",
                                "operations": [
                                    "create",
                                    "update",
                                    "delete",
                                    "read"
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    },
    "enums": {
        "UsVolumeUnits": {
            "name": "UsVolumeUnits",
            "values": [
                "TEASPOON",
                "TABLESPOON",
                "OUNCE",
                "CUP",
                "PINT",
                "QUART"
            ]
        }
    },
    "nonModels": {
        "VolumeAmount": {
            "name": "VolumeAmount",
            "fields": {
                "quantity": {
                    "name": "quantity",
                    "isArray": false,
                    "type": "Float",
                    "isRequired": true,
                    "attributes": []
                },
                "units": {
                    "name": "units",
                    "isArray": false,
                    "type": {
                        "enum": "UsVolumeUnits"
                    },
                    "isRequired": true,
                    "attributes": []
                }
            }
        },
        "RecipeIngredient": {
            "name": "RecipeIngredient",
            "fields": {
                "id": {
                    "name": "id",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "name": {
                    "name": "name",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "description": {
                    "name": "description",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "volumeAmount": {
                    "name": "volumeAmount",
                    "isArray": false,
                    "type": {
                        "nonModel": "VolumeAmount"
                    },
                    "isRequired": true,
                    "attributes": []
                }
            }
        },
        "RecipeStep": {
            "name": "RecipeStep",
            "fields": {
                "id": {
                    "name": "id",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "description": {
                    "name": "description",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "ingredients": {
                    "name": "ingredients",
                    "isArray": true,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": [],
                    "isArrayNullable": false
                }
            }
        }
    },
    "version": "204eb2642226b1dc64ebc1ff4b51a6db"
};