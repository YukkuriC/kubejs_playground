// requires: draconicevolution
// requires: ae2
ServerEvents.recipes(e => {
    e.shaped('yc:de_reactor_ctrl', [' A ', 'BCB', 'BBB'], {
        A: 'draconicevolution:reactor_injector',
        B: 'minecraft:iron_block',
        C: Platform.isLoaded('ae2') ? 'ae2:calculation_processor' : 'draconicevolution:reactor_injector',
    })
})
