// requires: botania
// requires: create
// requires: unsafejs
{
    let AlfheimPortalBlockEntity = Java.loadClass('vazkii.botania.common.block.block_entity.AlfheimPortalBlockEntity')
    Unsafe.setField(
        AlfheimPortalBlockEntity,
        'MULTIBLOCK',
        global.createPatchouliMultiBlockSupplier(
            [
                // up->down, left->right, front->back
                ['_', 'a', 'B', 'a', '_'],
                ['a', ' ', ' ', ' ', 'a'],
                ['B', ' ', ' ', ' ', 'B'],
                ['a', ' ', ' ', ' ', 'a'],
                ['_', 'a', '0', 'a', '_'],
            ],
            'botania:alfheim_portal',
            {
                a: 'create:andesite_casing',
                B: 'create:brass_casing',
            },
        ),
        true,
    )
}
