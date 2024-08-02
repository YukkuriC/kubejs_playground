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
