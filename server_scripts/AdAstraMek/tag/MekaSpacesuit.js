// mekasuit当然是宇航服辣
ServerEvents.tags('item', e => {
    let suits = ['helmet', 'bodyarmor', 'pants', 'boots'].map(x => `mekanism:mekasuit_${x}`)
    for (let tag of [
        'space_suit_items',
        // 后两个tag在1.20.1 forge发布版没生效，麻
        'space_resistant_armor',
        'oxygen_supplying_armor',
    ]) {
        e.add(`ad_astra:${tag}`, suits)
    }
})
