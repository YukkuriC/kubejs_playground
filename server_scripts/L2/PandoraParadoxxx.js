// requires: pandora

ServerEvents.tags('item', e => {
    e.add('curios:pandora', [
        // curses
        '#curios:hostility_curse',
    ])
    // 创造栏重复添加会崩
    if (Platform.isLoaded('yukkuric_bundle')) {
        let nestedTargets = [
            // nested
            'pandora:pandora_necklace',
            'pandora:pandora_bracelet',
        ]
        e.add('curios:pandora', nestedTargets)
        e.add('pandora:allow_duplicates', nestedTargets)
    }
})
