ItemEvents.toolTierRegistry(event => {
    event.add('yc', tier => {
        tier.uses = 114514
        tier.speed = 10
        tier.attackDamageBonus = 10
        tier.level = 10
        tier.enchantmentValue = 100
        tier.repairIngredient = '#minecraft:logs'
    })
})
ItemEvents.armorTierRegistry(event => {
    event.add('yc', tier => {
        tier.durabilityMultiplier = 114514
        tier.slotProtections = [10, 10, 10, 10]
        tier.enchantmentValue = 100
        tier.equipSound = 'minecraft:item.armor.equip_iron'
        tier.repairIngredient = '#minecraft:logs'
        tier.toughness = 5
        tier.knockbackResistance = 0.3
    })
})

StartupEvents.registry('item', e => {
    const items_tools = ['axe', 'pickaxe', 'hoe', 'sword', 'shovel'].map(item =>
        e
            .create(`yc:${item}`, item)
            .tier('yc')
            .rarity('epic')
            .glow(true)
            .texture(`minecraft:item/golden_${item}`)
            .displayName(`YC's ${item}`),
    )
    const items_armor = ['helmet', 'chestplate', 'leggings', 'boots'].map(item =>
        e
            .create(`yc:${item}`, item)
            .tier('yc')
            .rarity('epic')
            .maxDamage(114514)
            .glow(true)
            .texture(`minecraft:item/golden_${item}`)
            .modelJson({
                parent: `minecraft:item/golden_${item}`,
            })
            .displayName(`YC's ${item}`),
    )
})
