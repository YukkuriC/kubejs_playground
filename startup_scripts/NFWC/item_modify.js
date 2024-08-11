ItemEvents.modification(e => {
    // 糖果当然能吃辣
    for (let id of ['kubejs:candy_heart', 'kubejs:candy_stomach', 'kubejs:candy_pancreas']) {
        e.modify(id, item => {
            item.foodProperties = food => {
                food.hunger(16)
                food.saturation(2.5)
                food.effect('minecraft:regeneration', 20 * 45, 0, 1)
                food.effect('minecraft:resistance', 20 * 45, 0, 1)
            }
            item.getItemBuilder().tag('kubejs:food').tag('kubejs:warp')
        })
    }
    e.modify('kubejs:the_third_eye', item => {
        item.getItemBuilder().tag('kubejs:player_tick_only')
    })
})
