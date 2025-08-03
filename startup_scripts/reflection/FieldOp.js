// priority:114514

global.getDeclaredField = (obj, name, isStatic, superCount) => {
    superCount = superCount || 0
    let cls = obj
    if (!isStatic) cls = obj.getClass()
    else cls = global.toRawClass(obj)
    for (let i = 0; i < superCount; i++) cls = cls.getSuperclass()
    let field = cls.getDeclaredField(name)
    field.setAccessible(true)
    return field
}
global.getField = (obj, name, isStatic, superCount) => {
    return global.getDeclaredField(obj, name, isStatic, superCount).get(obj)
}
global.setField = (obj, name, value, isStatic, superCount) => {
    return global.getDeclaredField(obj, name, isStatic, superCount).set(obj, value)
}

// UNSAFE
{
    let unsafe = global.getField('sun.misc.Unsafe', 'theUnsafe', 1)
    global.unsafeSetField = (obj, name, value, isStatic, superCount) => {
        let field = global.getDeclaredField(obj, name, isStatic, superCount)
        let base = isStatic ? unsafe.staticFieldBase(field) : obj
        let offset = isStatic ? unsafe.staticFieldOffset(field) : unsafe.objectFieldOffset(field)
        unsafe.putObject(base, offset, value)
    }
}
