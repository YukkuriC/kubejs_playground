// priority:10
{
    let toImport = [
        // registry
        'at.petrak.hexcasting.api.PatternRegistry',
        'at.petrak.hexcasting.api.spell.math.HexDir',
        'at.petrak.hexcasting.api.spell.math.HexPattern',

        // spell exec
        'at.petrak.hexcasting.api.spell.Action',
        'at.petrak.hexcasting.api.spell.OperationResult',
        'at.petrak.hexcasting.api.spell.casting.sideeffects.OperatorSideEffect',
    ]
    // error check
    for (let sub of [
        //
        'Mishap',
        'MishapNotEnoughArgs',
        'MishapInvalidIota',
    ])
        toImport.push('at.petrak.hexcasting.api.spell.mishaps.' + sub)
    // iota
    for (let sub of [
        //
        'Iota',
        'Vec3Iota',
        'ListIota',
    ])
        toImport.push('at.petrak.hexcasting.api.spell.iota.' + sub)

    for (let path of toImport) {
        let varName = path.substring(path.lastIndexOf('.') + 1)
        this[varName] = Java.loadClass(path)
    }
}
