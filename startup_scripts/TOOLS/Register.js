StartupEvents.registry('item', e => {
    const items_tools = ['axe', 'pickaxe', 'hoe', 'sword', 'shovel'].map(item =>
        e
            .create(`yc:${item}`, item)
            .tier('yc')
            .rarity('epic')
            .glow(true)
            .texture(`minecraft:item/golden_${item}`)
            .displayName(`YukkuriC's ${item}`),
    )
    const items_armor = ['helmet', 'chestplate', 'leggings', 'boots'].map(item =>
        e
            .create(`yc:${item}`, item)
            .tier('yc')
            .rarity('epic')
            .maxDamage(114514)
            .glow(true)
            .texture(`minecraft:item/golden_${item}`)
            .displayName(`YukkuriC's ${item}`),
    )
    // misc
    e.create(`yc:stick`, 'basic').maxStackSize(1).rarity('epic').glow(true).texture(`minecraft:item/stick`).displayName(`YukkuriC's Stick`)
    e.create(`yc:duper`, 'basic')
        // .texture(`yc:item/duper`)
        .rarity('epic')
        .maxStackSize(1)
        .glow(true)
        .displayName(`YukkuriC's Duper`)
})
