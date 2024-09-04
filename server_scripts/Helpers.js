// chain block breaking
const MAX_CHAIN = 4096

/**
 * general helper
 * @param { Internal.Level } level
 * @param { {x:number; y:number; z:number} } blockPos
 * @param { (block:Internal.BlockContainerJS) => boolean } predicate
 * @param { (block:Internal.BlockContainerJS) => void } callback
 */
function FloodFillBlocks(level, blockPos, predicate, callback) {
    const blockQueue = [blockPos]
    const visited = new Set()
    visited.add(`${blockPos.x},${blockPos.y},${blockPos.z}`)
    for (let _ = 0; _ < MAX_CHAIN && blockQueue.length > 0; ) {
        let { x, y, z } = blockQueue.pop()
        let bb = level.getBlock(x, y, z)
        if (!predicate(bb)) continue
        callback(bb)
        _++

        // dfs
        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++)
                for (let k = -1; k <= 1; k++) {
                    if (!i && !j && !k) continue
                    let newPos = { x: x + i, y: y + j, z: z + k }
                    let newKey = `${newPos.x},${newPos.y},${newPos.z}`
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
 * @param { Internal.Player } player
 * @param { boolean } drop
 */
function BreakBlock(level, block, player, noDrop) {
    if (!block) return
    let res = null
    if (noDrop) res = block.getDrops()
    global.EVENT_BUS.post(new $BreakEvent(level, block.pos, block.blockState, player))
    level.destroyBlock(block.pos, !noDrop, player)
    return res
}
/**
 * check crop age
 * @param { Internal.CropBlock } block
 * @param { Internal.BlockState } state
 */
function CanHarvest(block, state) {
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
    for (let pair of Object.entries(obj)) {
        lines.push(`    ${pair[0]}: ${pair[1]},`)
    }
    lines.push('}')
    return lines.join('\n')
}

global.dumpDeep = (obj, deltaIndent) => {
    let noNewLine = deltaIndent < 0
    if (!noNewLine) deltaIndent = deltaIndent || 2
    let used = new Set()
    let inner = (obj, indent) => {
        if (used.has(obj)) return '{...}'
        used.add(obj)
        let lines = ['{']
        for (let pair of Object.entries(obj)) {
            let [k, v] = pair
            let vStr = typeof v === 'object' ? inner(v, indent + deltaIndent) : String(v)
            lines.push(' '.repeat(indent + deltaIndent) + `${k}:${vStr},`)
        }
        lines.push(' '.repeat(indent) + '}')
        used.delete(obj)
        return lines.join(noNewLine ? '' : '\n')
    }
    return inner(obj, noNewLine ? NaN : 0)
}
