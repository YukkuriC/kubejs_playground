{
    let AttributeModifier = Java.loadClass('net.minecraft.world.entity.ai.attributes.AttributeModifier')
    let Attributes = Java.loadClass('net.minecraft.world.entity.ai.attributes.Attributes')
    let TieredItem = Java.loadClass('net.minecraft.world.item.TieredItem')

    //attribute cache
    let Attrs = {
        cache: {},
        itemId: 'foo',
        slot: 'bar',
        event: null,
        OP_ADD: AttributeModifier.Operation.ADDITION,
        /**
         * @param {Internal.ItemAttributeModifierEvent & Internal.CurioAttributeModifierEvent} e
         * @param {boolean} multiCurios
         */
        init(e, multiCurios) {
            this.event = e
            this.itemId = e.itemStack.id
            this.slot = e.slotType
            if (!this.slot) {
                if (multiCurios && e.slotContext) {
                    this.slot = `${e.slotContext.identifier()}_${e.slotContext.index()}`
                } else {
                    this.slot = 'CURIOS'
                }
            }
            return this
        },
        /**
         * @param {Internal.Attribute} attr
         * @param {number} value
         * @param {Internal.AttributeModifier$Operation_} op
         * @returns
         */
        add(attr, value, op) {
            let key = `${this.itemId};${this.slot};${attr.descriptionId || attr}`
            if (!(key in this.cache)) this.cache[key] = new AttributeModifier('PoT', value, op || this.OP_ADD)
            this.event.addModifier(attr, this.cache[key])
            return this
        },
    }

    ForgeEvents.onEvent('net.minecraftforge.event.ItemAttributeModifierEvent', e => {
        let {
            itemStack: { id, item },
            slotType: slot,
        } = e
        if (slot == 'mainhand' && id == 'minecraft:bedrock') {
            Attrs.init(e).add(Attributes.ARMOR, 114514)
        }
    })
}
