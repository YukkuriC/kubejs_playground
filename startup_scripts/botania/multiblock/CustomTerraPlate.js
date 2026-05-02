// requires: botania
// requires: create
// requires: unsafejs
{
    let TerrestrialAgglomerationPlateBlockEntity = Java.loadClass(
        'vazkii.botania.common.block.block_entity.TerrestrialAgglomerationPlateBlockEntity',
    )
    Unsafe.setField(
        TerrestrialAgglomerationPlateBlockEntity,
        'MULTIBLOCK',
        global.createPatchouliMultiBlockSupplier(
            [
                // up->down, left->right, front->back
                ['___', '_P_', '___'],
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
