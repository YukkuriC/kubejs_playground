// priority:-10

{
    let File = Java.loadClass('java.io.File')
    let Plat = Java.loadClass('dev.architectury.platform.Platform')

    let mine = Plat.getGameFolder().normalize()
    let ROOT = mine.parent
    let allPacks = String(mine).endsWith('.minecraft')
        ? []
        : File(ROOT)
              .listFiles()
              .filter(file => file.isDirectory() && file.path != String(mine))
    if (allPacks.length > 0) {
        Client.player.tell(`你居然背着我装了${allPacks.length}个其它的包`)
        Client.player.tell(allPacks.join('\n'))
        Client.player.tell('你不爱我了吗')
    } else {
        Client.player.tell('我也爱你')
    }
}
