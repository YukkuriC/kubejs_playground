// priority:114514

global.toRawClass = cls => {
    let clsName = String(cls).match(/[\w\.]+(?=\]?$)/)[0]
    return global.loadRawClass(clsName)
}
global.loadRawClass = clsName => Java.class.class.forName(clsName)
