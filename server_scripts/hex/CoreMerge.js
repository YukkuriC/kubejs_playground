const HEX_API = Java.loadClass('at.petrak.hexcasting.xplat.IXplatAbstractions')

ServerEvents.recipes(e => {
    e.shapeless('hexcasting:focus', ['hexcasting:focus']).modifyResult((grid, item) => {
        let { player, width, height } = grid

        function convertDataToList(nbt) {
            if (nbt.data['hexcasting:type'] != 'hexcasting:list') {
                nbt.data['hexcasting:type'] = 'hexcasting:list'
                nbt.data['hexcasting:data'] = nbt.data['hexcasting:data'] ? [nbt.data['hexcasting:data']] : []
            }
        }

        let src_item,
            total = width * height
        for (let i = 0; i < total; i++) {
            src_item = grid.get(i)
            if (src_item.id == 'hexcasting:focus') break
        }

        item.orCreateTag.data = src_item.orCreateTag.data
        if (player) {
            let offItem = player.offHandItem
            if (offItem.nbt?.data && offItem.nbt.data['hexcasting:type']) {
                if (offItem.nbt.data['hexcasting:type'] == 'hexcasting:list') {
                    convertDataToList(item.nbt)
                    for (let obj of offItem.nbt.data['hexcasting:data']) item.nbt.data['hexcasting:data'].push(obj)
                } else {
                    convertDataToList(item.nbt)
                    item.nbt.data['hexcasting:data'].push(offItem.nbt.data['hexcasting:data'])
                }
            } else {
                convertDataToList(item.nbt)
                for (let obj of HEX_API.INSTANCE.getPatterns(player).map(x => x.serializeToNBT()))
                    item.nbt.data['hexcasting:data'].push({
                        'hexcasting:type': 'hexcasting:pattern',
                        'hexcasting:data': obj.Pattern,
                    })
            }
        }

        return item
    })
})
