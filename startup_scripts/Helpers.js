// chain block breaking
const MAX_CHAIN = 4096
const DELTA_DIRS = []
for (let d of [-1, 1]) {
    DELTA_DIRS.push([d, 0, 0], [0, d, 0], [0, 0, d])
    for (let d2 of [-1, 1]) {
        DELTA_DIRS.push([d, d2, 0], [0, d, d2], [d2, 0, d])
    }
}

/**
 * general helper
 * @param { Internal.Level } level
 * @param { BlockPos } blockPos
 * @param { (block:Internal.BlockContainerJS) => boolean } predicate
 * @param { (block:Internal.BlockContainerJS) => void } callback
 */
global.FloodFillBlocks = (level, blockPos, predicate, callback) => {
    let blockQueue = [blockPos]
    let visited = new Set()
    visited.add(blockPos.hashCode())
    for (let _ = 0; _ < MAX_CHAIN && blockQueue.length > 0; ) {
        let pos = blockQueue.shift()
        let { x, y, z } = pos
        let bb = level.getBlock(pos)
        if (!predicate(bb)) continue
        callback(bb)
        _++

        // dfs
        for (let delta of DELTA_DIRS) {
            let [i, j, k] = delta
            let newPos = new BlockPos(x + i, y + j, z + k)
            let newKey = newPos.hashCode()
            if (!visited.has(newKey)) {
                visited.add(newKey)
                blockQueue.push(newPos)
            }
        }
    }
}
/**
 * helper general break block
 * @param { Internal.Level } level
 * @param { Internal.BlockContainerJS } block
 * @param { Player } player
 * @param { boolean } drop
 */
global.BreakBlock = (level, block, player, noDrop) => {
    if (!block) return
    if (!noDrop) {
        for (let item of block.getDrops()) player.give(item)
    }
    global.EVENT_BUS.post(new $BreakEvent(level, block.pos, block.blockState, player))
    level.destroyBlock(block.pos, false, player)
}
/**
 * check crop age
 * @param { Internal.CropBlock } block
 * @param { Internal.BlockState } state
 */
global.CanHarvest = (block, state) => {
    if (block.isMaxAge && block.isMaxAge(state)) return true
    for (const prop of state.getProperties()) {
        if (!prop instanceof $IntegerProperty) continue
        if (prop.getName() != 'age') continue
        /** @type { Internal.IntegerProperty }*/
        let intProp = prop
        let age = state.getValue(intProp)
        let maxAge = intProp.getPossibleValues().size() - 1
        if (age == maxAge) return true
    }
    return false
}

global.dump = obj => {
    let lines = ['{']
    let hasInner = false
    for (let k of Object.keys(obj).sort()) {
        lines.push(`    ${k}: ${obj[k]},`)
        hasInner = true
    }
    lines.push(hasInner ? '}' : lines.pop() + '}')
    return lines.join('\n')
}

global.dumpDeep = (obj, deltaIndent) => {
    let noNewLine = deltaIndent < 0
    if (!noNewLine) deltaIndent = deltaIndent || 2
    let used = new Set()
    let inner = (obj, indent) => {
        try {
            if (used.has(obj)) return '{...}'
            used.add(obj)
            let lines = ['{']
            let hasInner = false
            for (let k of Object.keys(obj).sort()) {
                let v = obj[k]
                let vStr = v && typeof v === 'object' ? inner(v, indent + deltaIndent) : String(v)
                lines.push(' '.repeat(indent + deltaIndent) + `${k}:${vStr},`)
                hasInner = true
            }
            lines.push(hasInner ? ' '.repeat(indent) + '}' : lines.pop() + '}')
            used.delete(obj)
            return lines.join(noNewLine ? '' : '\n')
        } catch (e) {
            return ' '.repeat(indent) + `[Error: ${e}]`
        }
    }
    return inner(obj, noNewLine ? NaN : 0)
}
