// requires: storagedrawers
// working on 1.20.1-12.9.14
{
    let Integer = Java.loadClass('java.lang.Integer')
    let CFG = Java.loadClass('com.jaquadro.minecraft.storagedrawers.config.CommonConfig')

    StartupEvents.postInit(() => {
        CFG.GENERAL.controllerRange.set(Integer('114514'))
    })
}
