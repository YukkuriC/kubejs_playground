// requires: stardew_fishing

{
    let FishingScreen = Java.loadClass('com.bonker.stardewfishing.client.FishingScreen')
    let FishingMinigame = Java.loadClass('com.bonker.stardewfishing.client.FishingMinigame')

    let gf = (cls, name) => {
        let field = cls.__javaObject__.getDeclaredField(name)
        field.setAccessible(true)
        return field
    }

    let f_minigame = gf(FishingScreen, 'minigame')
    let f_bobberPos = gf(FishingMinigame, 'bobberPos')
    let f_bobberVelocity = gf(FishingMinigame, 'bobberVelocity')
    let f_fishPos = gf(FishingMinigame, 'fishPos')

    ClientEvents.tick(e => {
        let { screen } = Client
        if (!(screen instanceof FishingScreen)) return
        let minigame = f_minigame.get(screen)
        f_bobberPos.set(minigame, f_fishPos.get(minigame))
        f_bobberVelocity.set(minigame, 0)
    })
}
