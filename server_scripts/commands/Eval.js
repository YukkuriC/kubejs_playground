let DoEval, GetNamespace

{
    let namespaces = {}
    GetNamespace = function (/**@type {Internal.ServerPlayer}*/ player) {
        let key = player.stringUuid
        if (!namespaces[key]) namespaces[key] = {}
        return namespaces[key]
    }
}
{
    DoEval = function (code, player) {
        server.tell(Text.gold('Code:').append(Text.white(code)).clickCopy(code))
        let ns = GetNamespace(player)
        try {
            let tmp
            with (ns) {
                with (global) {
                    tmp = eval(code)
                    server.tell(Text.green('Result:').append(Text.white(tmp)).clickCopy(tmp))
                }
            }
            ns.res = tmp
        } catch (e) {
            server.tell(Text.red('Error:').append(Text.white(e)).clickCopy(e))
        }
    }
}

PlayerEvents.chat(e => {
    if (e.level.isClientSide()) return
    let code = String(e.message)
    if (!code.startsWith('e@')) return
    code = code.substring(2)
    server.scheduleInTicks(0, () => DoEval(code, e.player))
    e.cancel()
})
