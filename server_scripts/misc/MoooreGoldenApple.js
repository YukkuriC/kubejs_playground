ItemEvents.foodEaten(e => {
    if (e.item.id === 'minecraft:golden_apple') {
        e.player.give({ count: 2, item: 'minecraft:enchanted_golden_apple' })
    } else if (e.item.id === 'minecraft:enchanted_golden_apple') {
        e.player.give({ count: 2, item: 'minecraft:golden_apple' })
    }
})
