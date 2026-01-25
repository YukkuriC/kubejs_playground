// requires: botania
// requires: create
{
    let TerrestrialAgglomerationPlateBlockEntity = Java.loadClass(
        'vazkii.botania.common.block.block_entity.TerrestrialAgglomerationPlateBlockEntity',
    )
    global.unsafeSetField(
        TerrestrialAgglomerationPlateBlockEntity,
        'MULTIBLOCK',
        global.createPatchouliMultiBlockSupplier(
            [
                // up->down, left->right, front->back
                ['   ', ' 0 ', '   '],
                ['BBB', 'BBB', 'BBB'],
            ],
            'botania:terra_plate',
            {
                B: 'create:brass_casing',
            },
        ),
        true,
    )
}
