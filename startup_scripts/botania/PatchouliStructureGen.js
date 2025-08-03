// requires: patchouli
// priority: 114514
{
    let Suppliers = Java.loadClass('com.google.common.base.Suppliers')
    let PatchouliAPI = Java.loadClass('vazkii.patchouli.api.PatchouliAPI')

    let Character = Java.loadClass('java.lang.Character')
    global.createPatchouliMultiBlockSupplier = (pattern, center, keyMap) => {
        return Suppliers.memoize(() => {
            let args = [pattern, Character('0'), center]
            for (let [k, v] of Object.entries(keyMap)) args.push(Character(k), v)
            let api = PatchouliAPI.get()
            return api.makeMultiblock.apply(api, args)
        })
    }
}
