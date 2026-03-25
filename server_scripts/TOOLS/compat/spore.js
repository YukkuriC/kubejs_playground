// requires: spore
// priority: -10
{
    let SConfig = Java.loadClass('com.Harbinger.Spore.Core.SConfig')
    let HashSet = Java.loadClass('java.util.HashSet')
    let cleaning_list = SConfig.DATAGEN.block_cleaning.get()
    let clean_map = {}
    let visited = HashSet()
    for (let raw of cleaning_list) {
        raw = raw.split('|')
        clean_map[raw[0]] = raw[1]
    }

    let AddPos = pos => {
        if (visited.contains(pos)) return
        visited.add(pos)
        PURGE_QUEUE.push(pos)
    }
    let CleanSingle = (/**@type {Internal.BlockContainerJS}*/ block) => {
        let { id } = block
        if (id in clean_map) {
            block.set(clean_map[block.id])
            return false
        } else if (!id.startsWith('spore:')) return true
        block.level.destroyBlock(block.pos, true)
        if (!block.blockState.fluidState.empty) block.set('air')
    }

    let PURGE_QUEUE = []
    let PURGE_VERSION = 0
    let PURGE_COUNT = 0
    let Purge = src => {
        let { level } = src
        PURGE_QUEUE.length = 0
        PURGE_VERSION++
        PURGE_COUNT = 0
        visited.clear()
        let myVersion = PURGE_VERSION
        let unit = pos => {
            let block = level.getBlock(pos)
            if (myVersion != PURGE_VERSION || CleanSingle(block)) return true
            PURGE_COUNT++
            for (let x = -2; x <= 2; x++)
                for (let y = -2; y <= 2; y++)
                    for (let z = -2; z <= 2; z++) {
                        if (x || y || z) {
                            AddPos(block.pos.offset(x, y, z))
                        }
                    }
        }
        let epoch = () => {
            if (myVersion != PURGE_VERSION) return true
            for (let i = 0; i < 1000; i++) {
                if (PURGE_QUEUE.length) {
                    if (unit(PURGE_QUEUE.shift())) i -= 0.1
                } else break
            }
            if (PURGE_QUEUE.length) Utils.server.scheduleInTicks(1, epoch)
            else if (PURGE_COUNT > 0) Utils.server.tell(`Purged ${PURGE_COUNT} blocks`)
        }
        for (let x = -2; x <= 2; x++)
            for (let y = -2; y <= 2; y++)
                for (let z = -2; z <= 2; z++) {
                    AddPos(src.pos.offset(x, y, z))
                }
        epoch()
    }

    // add hooks
    YC_StickModes.push('SporeClean')
    ItemEvents.firstRightClicked('yc:stick', e => {
        let { level, item, player } = e
        let mode = GetYCStickState(item)
        try {
            if (mode == 'SporeClean') {
                let block = player.rayTrace(20, false).block
                if (block) Purge(block)
            }
        } catch (e) {
            player.tell(e)
        }
    })
} 