// priority: 10
// requires: create
// ignored: true

if (!global.registerCreateTrackPortal) {
    let AllPortalTracks = Java.loadClass('com.simibubi.create.content.trains.track.AllPortalTracks')
    let Registries = Java.loadClass('net.minecraft.core.registries.Registries')
    let ResourceKey = Java.loadClass('net.minecraft.resources.ResourceKey')
    let registerIntegration =
        AllPortalTracks[
            'registerIntegration(net.minecraft.resources.ResourceLocation,com.simibubi.create.content.trains.track.AllPortalTracks$PortalTrackProvider)'
        ] // differ from block variant
    let dimResourceKey = res => ResourceKey.create(Registries.DIMENSION, res)
    let usedKey = {}
    global.registerCreateTrackPortal = (block, dim1, dim2, portalForcer) => {
        if (usedKey[block]) return
        usedKey[block] = 1
        registerIntegration(block, inbound => {
            try {
                return AllPortalTracks.standardPortalProvider(inbound, dimResourceKey(dim1), dimResourceKey(dim2), portalForcer)
            } catch (e) {
                if (Client.player) Client.player.tell(e)
                return null
            }
        })
    }
}

if (Platform.isLoaded('blue_skies')) {
    let SkiesBlocks = Java.loadClass('com.legacy.blue_skies.registries.SkiesBlocks')
    for (let type_tmp of ['bright', 'dawn']) {
        let type = type_tmp
        global.registerCreateTrackPortal(`blue_skies:ever${type}_portal`, 'overworld', `blue_skies:ever${type}`, l =>
            SkiesBlocks[`ever${type}_portal`].getTeleporter(l),
        )
    }
}
if (Platform.isLoaded('undergarden')) {
    let UGTeleporter = Java.loadClass('quek.undergarden.world.UGTeleporter')
    global.registerCreateTrackPortal('undergarden:undergarden_portal', 'overworld', 'undergarden:undergarden', l => UGTeleporter(l))
}
