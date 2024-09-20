{
    let Temperature = Java.loadClass('com.momosoftworks.coldsweat.api.util.Temperature')

    PlayerTickEvents.every(20).on(e => {
        let { player } = e
        if (player.name.string !== 'YukkuriC') return // xs
        let oldTmp = Temperature.get(player, Temperature.Trait.CORE)
        Temperature.set(player, Temperature.Trait.CORE, oldTmp / 2)
    })
}
