if (Platform.isLoaded('botania')) {
    EntityEvents.spawned('tnt', e => {
        let { entity } = e
        e.server.scheduleInTicks(10, () => {
            entity.mergeNbt({ ForgeCaps: { 'botania:tnt_ethical': { 'botania:unethical': 0 } } })
        })
    })
}
