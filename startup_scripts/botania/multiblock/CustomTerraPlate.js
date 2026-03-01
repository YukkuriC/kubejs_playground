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
                ['   ', ' P ', '   '],
                ['BBB', 'B0B', 'BBB'],
            ],
            'create:brass_casing',
            {
                B: 'create:brass_casing',
                P: 'botania:terra_plate',
            },
        ),
        true,
    )
}
