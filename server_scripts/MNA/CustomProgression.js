// requires: mna
ServerEvents.recipes(e => {
    if (Platform.isLoaded('hexcasting')) {
        e.custom({
            type: 'mna:progression-condition',
            advancement: 'hexcasting:root',
            tier: 1,
        })
    }
})
