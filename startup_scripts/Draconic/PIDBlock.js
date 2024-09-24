StartupEvents.registry('block', e => {
    e.create('de_reactor_ctrl')
        .blockEntity(be => {
            be.serverTick(20, 0, x => global.tickPID(x))
        })
        .displayName('DE Reactor Controller')
})

/**@type {Internal.BlockEntityCallback}*/
global.tickPID = be => {
    let nbt = be.data
    // TODO
    nbt.test = (nbt.test || 0) + be.tick
    Utils.server.tell(`test: ${nbt.test}`)
}
