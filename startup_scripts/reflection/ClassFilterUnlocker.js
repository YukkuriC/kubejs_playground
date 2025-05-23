{
    let ClassFilter = Java.loadClass('dev.latvian.mods.kubejs.util.ClassFilter')
    global.unlockClassFilter = (javaWrapper) => {
        let sm = global.getField(javaWrapper, 'manager')
        global.setField(sm, 'classFilter', ClassFilter(), 0, sm.scriptType == 'SERVER' && Platform.getMcVersion() >= '1.20')
    }

    global.unlockClassFilter(Java)
}
