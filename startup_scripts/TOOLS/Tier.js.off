ItemEvents.toolTierRegistry(event => {
    event.add('yc', tier => {
        tier.uses = 114514
        tier.speed = 10
        tier.attackDamageBonus = 10
        tier.enchantmentValue = 100
        tier.repairIngredient = '#minecraft:logs'
    })
})
StartupEvents.registry('armor_material', event => {
    let repairMat = Ingredient.of('#minecraft:logs')
    event
        .create('yc:armor')
        .defense({ boots: 10, leggings: 10, chestplate: 10, helmet: 10, body: 10 })
        .enchantmentValue(100)
        .equipSound('item.armor.equip_iron')
        .repairIngredient(() => repairMat)
        .toughness(5)
        .knockbackResistance(0.3)
})
