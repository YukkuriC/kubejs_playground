{
    let namespaces = {}
    let GetNamespace = function (/**@type {Internal.ServerPlayer}*/ player) {
        let key = player.stringUuid
        if (!namespaces[key]) namespaces[key] = {}
        return namespaces[key]
    }
    let DoEval = function (code, player) {
        Utils.server.tell(Text.gold('Code:').append(Text.white(code)).clickCopy(code).hover(Text.translate('chat.copy.click')))
        let ns = GetNamespace(player)
        try {
            let tmp
            with (ns) {
                with (global) {
                    tmp = eval(code)
                    Utils.server.tell(Text.green('Result:').append(Text.white(tmp)).clickCopy(tmp).hover(Text.translate('chat.copy.click')))
                }
            }
            ns.res = tmp
        } catch (e) {
            Utils.server.tell(Text.red('Error:').append(Text.white(e)).clickCopy(e).hover(Text.translate('chat.copy.click')))
        }
    }

    /* 
    PlayerEvents.chat(e => {
        if (e.level.isClientSide()) return
        let code = String(e.message)
        if (!code.startsWith('e@')) return
        code = code.substring(2)
        Utils.server.scheduleInTicks(0, () => DoEval(code, e.player))
        e.cancel()
    })
    */

    ServerEvents.commandRegistry(e => {
        const { commands: cmd, arguments: arg } = e

        let eval = cmd
            .literal('eval')
            .requires(s => s.hasPermission(2))
            .then(
                cmd.argument('code', arg.GREEDY_STRING.create(e)).executes(ctx => {
                    let {
                        source: { player },
                    } = ctx
                    let code = String(arg.GREEDY_STRING.getResult(ctx, 'code'))
                    Utils.server.scheduleInTicks(0, () => DoEval(code, player))
                    return 1
                }),
            )

        e.register(eval)
    })
}
