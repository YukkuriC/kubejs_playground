// requires: create
{
    ServerEvents.recipes(e => {
        let helper = (src, output) => {
            if (!Platform.isLoaded(src.split(':')[0])) return
            e.custom({
                type: 'create:item_application',
                ingredients: [
                    {
                        item: src,
                    },
                    {
                        item: 'minecraft:amethyst_shard',
                    },
                ],
                results: [
                    {
                        item: output,
                    },
                ],
            })
        }
        helper('minecraft:chest', 'create:creative_crate')
        helper('create:flywheel', 'create:creative_motor')
        helper('create:fluid_tank', 'create:creative_fluid_tank')
        helper('createaddition:alternator', 'createaddition:creative_energy')
        helper('ae2:fluid_cell_housing', 'ae2:creative_fluid_cell')
        helper('ae2:item_cell_housing', 'ae2:creative_item_cell')
        helper('functionalstorage:void_upgrade', 'functionalstorage:creative_vending_upgrade')
    })
}
