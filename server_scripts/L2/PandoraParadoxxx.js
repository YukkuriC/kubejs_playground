// requires: pandora

ServerEvents.tags('item', e => {
    e.add('curios:pandora', [
        // curses
        '#curios:hostility_curse',
    ])
    // 创造栏重复添加会崩
    if (Platform.isLoaded('yukkuric_bundle')) {
        e.add('curios:pandora', [
            // nested
            'pandora:pandora_necklace',
            'pandora:pandora_bracelet',
        ])
    }
})
