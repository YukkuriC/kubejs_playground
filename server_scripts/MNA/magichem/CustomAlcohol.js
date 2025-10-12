ServerEvents.recipes(e => {
    let helper = (id, count) =>
        e.custom({
            type: 'magichem:fluid_distillation_fabrication',
            wisdom: 1,
            categories: 1,
            output_rate: 1.0,
            batch_size: 8,
            fluid: id,
            components: [{ item: 'magichem:admixture_alcohol', count: count }],
        })
    helper('pneumaticcraft:ethanol', 10)
    helper('createaddition:bioethanol', 10)
})
