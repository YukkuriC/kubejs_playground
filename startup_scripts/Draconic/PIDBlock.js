StartupEvents.registry('block', e => {
    e.create('de_reactor_ctrl')
        .blockEntity(be => {
            be.serverTick(20, 0, x => global.tickPID(x))
        })
        .resistance(114514)
        .displayName('DE Reactor Controller')
})

/**@type {Internal.BlockEntityCallback}*/
global.tickPID = be => {
    let nbt = be.data
    nbt.TARGET = nbt.TARGET || 3000.5
    nbt.P = nbt.P || 3000
    nbt.I = nbt.I || 600
    nbt.D = nbt.D || 2000

    // get target pos
    if (!nbt.cachedPos) {
        try {
            let _cached = {}
            let { x, y, z } = be.blockPos
            let entryPos = new BlockPos(x, y + 1, z)
            let entryData = be.level.getBlock(entryPos).entityData
            let coreOffset = entryData.bc_managed_data.core_offset
            _cached.core = [x - coreOffset[0], y + 1 - coreOffset[1], z - coreOffset[2]]
            _cached.valve = [x + Math.sign(coreOffset[0]), y + 1 + Math.sign(coreOffset[1]), z + Math.sign(coreOffset[2])]

            nbt.cachedPos = _cached
        } catch (e) {
            Utils.server.tell(e)
            return
        }
    }

    // get target data
    let pos = nbt.cachedPos.core
    let coreData = be.level.getBlock(pos[0], pos[1], pos[2])?.entityData
    if (coreData?.bc_managed_data?.reactor_state?.value != 3) {
        if (coreData?.bc_managed_data?.reactor_state?.value > 3) {
            // force stop
            be.level.runCommandSilent(`data modify block ${pos[0]} ${pos[1]} ${pos[2]} bc_managed_data.reactor_state.value set value 1`)
        }
        return
    }
    pos = nbt.cachedPos.valve
    let valveData = be.level.getBlock(pos[0], pos[1], pos[2])?.entityData
    if (!coreData || !valveData) {
        delete nbt.cachedPos
        return
    }
    let X = valveData?.bc_managed_data?.min_flow
    let Y = coreData?.bc_managed_data?.temperature
    if (!(X || X === 0) || !(Y || Y === 0)) {
        delete nbt.cachedPos
        return
    }

    // run control
    let error = nbt.TARGET - Y
    let delta_error = error - nbt.old_error || 0
    nbt.cum_error = (nbt.cum_error || 0) + error
    // Utils.server.tell(`P:${nbt.P * error} I:${nbt.I * nbt.cum_error} D:${nbt.D * delta_error}`)
    let delta_X = nbt.P * error + nbt.I * nbt.cum_error + nbt.D * delta_error
    delta_X = Math.max(0, delta_X)

    // write back valve flow
    be.level.runCommandSilent(`data modify block ${pos[0]} ${pos[1]} ${pos[2]} bc_managed_data.min_flow set value ${delta_X}`)

    // update old error
    nbt.old_error = error

    // auto increase target
    if (Y >= nbt.TARGET - 5 && nbt.TARGET < 8000) {
        switch (true) {
            case nbt.TARGET > 7000:
                nbt.TARGET += 20
                break
            case nbt.TARGET > 6000:
                nbt.TARGET += 100
                break
            case nbt.TARGET > 4000:
                nbt.TARGET += 500
                break
            default:
                nbt.TARGET += 1000
                break
        }
    }
}
