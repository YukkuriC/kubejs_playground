ServerEvents.tags('item', e => {
    // 糖果当然能吃辣
    for (let candy_tag of ['kubejs:food', 'kubejs:warp']) e.add(candy_tag, '#kubejs:candy')
    // 三眼tick事件
    e.add('kubejs:player_tick_only', 'kubejs:the_third_eye')
})
