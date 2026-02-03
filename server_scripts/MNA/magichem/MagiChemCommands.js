// requires: magichem
ServerEvents.commandRegistry(e => {
    let { commands: cmd, arguments: arg } = e

    let pickMateria = name => {
        if (name in pickMateria.cache) return pickMateria.cache[name]
        for (let target of ['essentia', 'admixture']) {
            let key = `magichem:${target}_${name}`
            if (Item.of(key).empty) continue
            return (pickMateria.cache[name] = key)
        }
        stopWith(ctx, 'invalid materia: ' + name)
    }
    pickMateria.cache = {}
    let stopWith = (ctx, msg) => {
        ctx.source.sendFailure(msg)
        throw msg
    }

    // 0. general processing

    /**
     *
     * @param {Internal.CommandContext<Internal.CommandSourceStack} ctx
     * @param {Internal.ItemStack} item
     */
    let dumper = (ctx, item) => {
        let [
            // no collapse
            categories,
            rawEff,
            wisdom,
            rawMats,
        ] = arg.GREEDY_STRING.getResult(ctx, raw_arg_descrip).split(' ')
        let [invRate, batch] = rawEff.split('/')
        if (!batch) batch = 1

        let recipe_body = {
            type: 'magichem:distillation_fabrication',
            wisdom: Number(wisdom),
            categories: Number(categories),
            output_rate: 1 / Number(invRate),
            batch_size: Number(batch),
            object: { item: item.id },
            components: [],
        }
        // per materia
        for (let raw of rawMats.split(',')) {
            let [name, count] = raw.split('/')
            if (!count) count = 1
            recipe_body.components.push({ item: pickMateria(name), count: Number(count) })
        }

        let modid = item.idLocation.namespace
        let wrapped = {
            type: 'forge:conditional',
            recipes: [
                {
                    conditions: [
                        {
                            type: 'forge:mod_loaded',
                            modid: modid,
                        },
                    ],
                    recipe: recipe_body,
                },
            ],
        }

        let folder = `kubejs/data/magichem/recipes/distillation_fabrication/${modid}`
        let filename = `${item.idLocation.path}.json`
        ctx.source.sendSuccess(Text.literal(`recipe for ${item.id} generated`), true)
        ctx.source.sendSuccess(
            Text.literal(`output folder: ${folder}; filename: ${filename}`).clickCopy(folder).hover('click to copy folder path'),
            true,
        )
        JsonIO.write(`${folder}/${filename}`, wrapped)

        return 0
    }

    // 1. distillation recipe gen
    let raw_arg_descrip = 'CATEGORIES INV_RATE[/BATCH=1] WISDOM MatName[/Count=1],...'
    let root = CommandUtils.chain(
        [
            cmd.literal('magichem'), //root command
            cmd.literal('distill'),
            cmd.argument(raw_arg_descrip, arg.GREEDY_STRING.create(e)),
        ],
        ctx => {
            let handItem = CommandUtils.getPlayerItem(ctx)
            if (!handItem || handItem.empty) stopWith(ctx, 'no item in player main hand')
            return dumper(ctx, handItem)
        },
    )
    CommandUtils.chain(
        [
            root, //root command
            cmd.literal('distill_id'),
            cmd.argument('item', arg.ITEM_STACK.create(e)),
            cmd.argument(raw_arg_descrip, arg.GREEDY_STRING.create(e)),
        ],
        ctx => {
            let item = Item.of(arg.ITEM_STACK.getResult(ctx, 'item').item)
            if (item.empty) stopWith(ctx, 'no valid item id provided')
            return dumper(ctx, item)
        },
    )

    e.register(root)
})
