// requires: storagedrawers
// working on 1.20.1-12.9.14 & 1.20.1-12.11.2 & 1.20.1-12.14.0
{
    let Integer = Java.loadClass('java.lang.Integer')
    let CFG
    try {
        CFG = Java.loadClass('com.jaquadro.minecraft.storagedrawers.config.ModCommonConfig')
    } catch (e) {
        CFG = { INSTANCE: Java.loadClass('com.jaquadro.minecraft.storagedrawers.config.CommonConfig') }
    }

    StartupEvents.postInit(() => {
        let cfg = CFG.INSTANCE.GENERAL.controllerRange || CFG.INSTANCE.CONTROLLER.controllerRange
        if (cfg) cfg.set(Integer('114514'))
        else throw 'SuperFarDrawers.js needs update again'
    })
}
