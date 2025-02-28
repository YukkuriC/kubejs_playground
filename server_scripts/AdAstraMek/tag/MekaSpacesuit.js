// requires: mekanism
// requires: ad_astra

// mekasuit当然是宇航服辣
ServerEvents.tags('item', e => {
    let suits = ['helmet', 'bodyarmor', 'pants', 'boots'].map(x => `mekanism:mekasuit_${x}`)
    for (let tag of [
        'space_suit_items',
        'heat_resistant_armor',
        'space_resistant_armor',
        'oxygen_supplying_armor',
    ]) {
        e.add(`ad_astra:${tag}`, suits)
    }
})
