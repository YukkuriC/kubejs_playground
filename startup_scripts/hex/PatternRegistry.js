global.PatternOperateMap = {
    floodfill(continuation, stack, ravenmind, ctx) {
        if (stack.length < 1) throw MishapNotEnoughArgs(1, 0)
        let iota = stack.pop()
        if (!iota.getVec3) throw MishapInvalidIota(iota, 0, 'vector')
        let pos = iota.getVec3()
        ctx['assertVecInRange(net.minecraft.world.phys.Vec3)'](pos)

        let startBlock = ctx.world.getBlock(pos)
        let targets = []
        if (startBlock)
            global.FloodFillBlocks(
                ctx.world,
                startBlock.pos,
                b => {
                    if (targets.length >= 511) return false
                    if (b.id != startBlock.id) return false
                    try {
                        ctx['assertVecInRange(net.minecraft.world.phys.Vec3)'](pos)
                    } catch (e) {
                        return false
                    }
                    return true
                },
                b => {
                    targets.push(Vec3Iota(b.pos))
                },
            )
        stack.push(ListIota(targets))
    },
    charge_media(a1, a2, a3, ctx) {
        let stack = ctx.caster.getItemInHand(ctx.castingHand)
        let item = stack.item
        if (item.setMedia && item.getMaxMedia) {
            item.setMedia(stack, item.getMaxMedia(stack))
        }
    },
}

function ActionJS(id, isGreat) {
    this.operate = (c, s, r, ct) => {
        try {
            return global.PatternOperateMap[id](c, s, r, ct) || OperationResult(c, s, r, [])
        } catch (e) {
            if (String(e).indexOf('Mishap') >= 0) {
                return OperationResult(c, s, r, [OperatorSideEffect.DoMishap(e, Mishap.Context(HexPattern(HexDir.WEST, []), null))])
            }
            throw e
        }
    }

    // isGreat
    this.isGreat = isGreat ? () => true : () => false

    // TODO displayName by lang
    let _displayName = Text.of(id.toUpperCase()).gold()
    this.getDisplayName = this.displayName = () => _displayName
}
ActionJS.prototype = {
    alwaysProcessGreatSpell: () => true,
    causesBlindDiversion: () => true,
}

global.loadCustomPatterns = () => {
    let actionLookup = global.getField(PatternRegistry, 'actionLookup', 1)
    function registerPatternWrap(seq, dir, id, isGreat) {
        isGreat = !!isGreat
        if (!id in global.PatternOperateMap) throw new Error('missing operate: ' + id)
        let resourceKey = ResourceLocation('yc', id)
        if (actionLookup.containsKey(resourceKey)) actionLookup.remove(resourceKey)
        PatternRegistry.mapPattern(HexPattern.fromAngles(seq, dir), resourceKey, new ActionJS(id, isGreat), isGreat)
    }

    registerPatternWrap('aaqawawaeadaadadadaadadadaada', HexDir.EAST, 'floodfill', 1)
    registerPatternWrap('wwaqqqqqedwdwwwaw', HexDir.EAST, 'charge_media', 1)
}
StartupEvents.postInit(global.loadCustomPatterns)
