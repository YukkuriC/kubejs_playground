ItemEvents.modification(e => {
    for (let target of [
        'hexcasting:focus',
        'hexcasting:cypher',
        'hexcasting:trinket',
        'hexcasting:artifact',
        //
        'hexgloop:gloopifact',
    ]) {
        if (Platform.isLoaded(target.split(':')[0]))
            e.modify(target, i => {
                i.maxStackSize = 64
            })
    }
})
