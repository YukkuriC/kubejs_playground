let CommandUtils = {
    /**
     * @param {Internal.ArgumentBuilder<Internal.CommandSourceStack,any>[]} seq
     * @param {((ctx:Internal.CommandContext<Internal.CommandSourceStack>)=>number)|(((ctx:Internal.CommandContext<Internal.CommandSourceStack>)=>number)[])} callback
     * @param {number} callbackToLastN
     */
    chain(seq, callback, callbackToLastN) {
        if (callback) {
            if (callbackToLastN === undefined) callbackToLastN = 1
            for (let i = 0; i < callbackToLastN; i++) {
                let target = seq[seq.length - 1 - i]
                let exec = callback.length && callback.forEach ? callback[callback.length - 1 - i] : callback
                target.executes(exec)
            }
        }
        for (let i = seq.length - 1; i > 0; i--) {
            seq[i - 1] = seq[i - 1].then(seq[i])
        }
        return seq[0]
    },
    tryGetArg(ctx, argType, name) {
        try {
            return argType.getResult(ctx, name)
        } catch (e) {}
    },
    getPlayer(ctx) {
        /**@type {Player}*/
        let player = ctx.source.entity
        if (player && player.isPlayer()) return player
    },
    getPlayerItem(ctx) {
        /**@type {Player}*/
        let player = CommandUtils.getPlayer(ctx)
        if (player) return player.getMainHandItem()
    },
}
