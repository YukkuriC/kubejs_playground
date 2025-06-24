ServerEvents.tags('item', e => {
    let targets = ['botania:mana_mirror', 'botania:mana_tablet']
    for (let tag of ['curios:hands', 'curios:ring', 'curios:charm']) e.add(tag, targets)
})
