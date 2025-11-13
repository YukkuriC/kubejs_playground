// requires: mna
ServerEvents.commandRegistry(e => {
    // imports
    let LocateCommand = Java.loadClass('net.minecraft.server.commands.LocateCommand')
    let WorldMagicProvider = Java.loadClass('com.mna.capabilities.worlddata.WorldMagicProvider')
    let GeneralConfigValues = Java.loadClass('com.mna.api.config.GeneralConfigValues')
    let AffinityArgument = Java.loadClass('com.mna.api.commands.AffinityArgument')

    const { commands: cmd, arguments: arg } = e

    /**
     * @param {Internal.CommandContext<Internal.CommandSourceStack>} ctx
     * @param {(spring:any)=>boolean} predicate
     * @param {number} rangeScale
     * @returns {number}
     */
    let searcher = (ctx, predicate, rangeScale) => {
        rangeScale = rangeScale || 1.5
        let {
            source,
            source: { player, level },
        } = ctx
        if (!player) return 0
        let nearest = null,
            nearestDist = Infinity,
            src = player.blockPosition().atY(0)
        level.getCapability(WorldMagicProvider.MAGIC).ifPresent(wm => {
            let nodes = wm.wellspringRegistry.getNearbyNodes(src, 0, GeneralConfigValues.WellspringDistance * rangeScale).entrySet()
            for (let node of nodes) {
                let { key, value } = node
                if (predicate && !predicate(value)) continue
                let newDist = src.distSqr(node.key)
                if (newDist < nearestDist) {
                    nearestDist = newDist
                    nearest = node
                }
            }
        })
        if (nearest) {
            nearestDist = Math.sqrt(nearestDist)
            let { x, z } = nearest.key
            let spring = nearest.value
            let msg = Text.translate(
                'commands.locate.biome.success',
                // name
                nearest.value.affinity.name(),
                // tp text
                Text.green(`[${x}, ~, ${z}] (strength=${spring.strength})`).hover(Text.translate('chat.coordinates.tooltip')).clickRunCommand(`tp @s ${x} ~ ${z}`),
                // dist
                String(Math.floor(nearestDist)),
            )
            source.sendSuccess(msg, false)
            return nearestDist
        } else {
            source.sendFailure('Nope.')
            return -1
        }
    }

    // locate spring
    e.register(
        cmd.literal('locate').then(
            cmd
                .literal('wellspring')
                .executes(ctx => searcher(ctx))
                .then(
                    cmd.argument('type', AffinityArgument.affinity()).executes(ctx => {
                        let type = AffinityArgument.getAffinity(ctx, 'type')
                        return searcher(ctx, spring => spring.affinity == type, 9)
                    }),
                ),
        ),
    )
})
