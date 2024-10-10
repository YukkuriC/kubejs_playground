{
    let ClassFilter = Java.loadClass('dev.latvian.mods.kubejs.util.ClassFilter')
    global.unlockClassFilter = (javaWrapper, superCount) => {
        let sm = global.getField(javaWrapper, 'manager')
        global.setField(sm, 'classFilter', ClassFilter(), 0, sm.scriptType == 'SERVER')
    }

    global.unlockClassFilter(Java)
}
