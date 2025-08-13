// requires: magichem
{
    let EldrinOrreryLimiterSD = Java.loadClass('com.aranaira.magichem.foundation.saveddata.EldrinOrreryLimiterSD')
    let Function = Java.loadClass('java.util.function.Function')

    let wrapInterface = func =>
        new JavaAdapter(Function, {
            apply(obj) {
                return func(obj)
            },
        })

    BlockEvents.placed('magichem:eldrin_orrery', e => {
        let { player, server } = e
        if (!player) return

        try {
            let ds = server.overworld().dataStorage
            let limiter = ds.get(wrapInterface(EldrinOrreryLimiterSD.load), 'eldrinOrreryData')
            limiter['removeOrrery(net.minecraft.world.entity.player.Player)'](player)
        } catch (e) {
            player.tell(e)
        }
    })
}
