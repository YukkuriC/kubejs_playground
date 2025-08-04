// requires: storagedrawers
// working on 1.20.1-12.9.14 & 1.20.1-12.11.2
{
    let Integer = Java.loadClass('java.lang.Integer')
    let CFG
    try {
        CFG = Java.tryLoadClass('com.jaquadro.minecraft.storagedrawers.config.ModCommonConfig')
    } catch (e) {
        CFG = { INSTANCE: Java.loadClass('com.jaquadro.minecraft.storagedrawers.config.CommonConfig') }
    }

    StartupEvents.postInit(() => {
        CFG.INSTANCE.GENERAL.controllerRange.set(Integer('114514'))
    })
}
