// requires: computercraft
{
    let MountMedia = Java.loadClass('dan200.computercraft.shared.media.MountMedia')
    let MediaProvider = Java.loadClass('dan200.computercraft.api.media.MediaProvider')
    let ToIntFunction = Java.loadClass('java.util.function.ToIntFunction')
    let Supplier = Java.loadClass('java.util.function.Supplier')
    let Integer = Java.loadClass('java.lang.Integer')
    let DiskItem = Java.loadClass('dan200.computercraft.shared.media.items.DiskItem')
    let Item = Java.loadClass('net.minecraft.world.item.Item')
    // let MediaProviders = Java.loadClass('dan200.computercraft.impl.MediaProviders')
    let MEDIA_MAP = global.getField('dan200.computercraft.impl.MediaProviders', 'itemProviders', 1)

    let TAG_ID = 'DiskId'
    let GetDiskId = new JavaAdapter(ToIntFunction, {
        applyAsInt(stack) {
            let nbt = stack.orCreateTag
            return nbt.getInt(TAG_ID)
        },
    })
    let SetDiskId = new JavaAdapter(MountMedia.IdSetter, {
        set(stack, id) {
            stack.orCreateTag.putInt(TAG_ID, id)
        },
    })
    let GetSize = new JavaAdapter(Supplier, {
        size: new Integer('1919810'),
        get() {
            return this.size
        },
    })

    // register media
    let MEDIA_ENDER_DISK = new MountMedia('ender_disk', GetDiskId, SetDiskId, GetSize)

    // register item
    StartupEvents.registry('item', e => {
        let theDiskItem = new JavaAdapter(DiskItem, {}, new Item.Properties())
        e.createCustom('yc:ender_disk2', () => theDiskItem)

        // link item & media
        MEDIA_MAP.put(
            theDiskItem,
            new JavaAdapter(MediaProvider, {
                getMedia(stack) {
                    return MEDIA_ENDER_DISK
                },
            }),
        )
    })
}
