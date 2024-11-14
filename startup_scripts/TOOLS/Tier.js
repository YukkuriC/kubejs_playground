ItemEvents.toolTierRegistry(event => {
    event.add('yc', tier => {
        tier.uses = 114514
        tier.speed = 10
        tier.attackDamageBonus = 10
        // tier.level = 10
        tier.enchantmentValue = 100
        tier.repairIngredient = '#minecraft:logs'
    })
})
/* ItemEvents.armorTierRegistry(event => {
    event.add('yc', tier => {
        tier.durabilityMultiplier = 114514
        tier.slotProtections = [10, 10, 10, 10]
        tier.enchantmentValue = 100
        tier.equipSound = 'minecraft:item.armor.equip_iron'
        tier.repairIngredient = '#minecraft:logs'
        tier.toughness = 5
        tier.knockbackResistance = 0.3
    })
}) */
