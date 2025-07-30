{
    let WeakHashMap = Java.loadClass('java.util.WeakHashMap')
    let DamageTracker = new WeakHashMap()
    let DEBUG = true
    let TOLERANCE = 0.5

    let getDmgTracker = e => {
        return DamageTracker.computeIfAbsent(e, () => {
            return {
                amount: 0,
            }
        })
    }

    ForgeEvents.onEvent(Java.loadClass('net.minecraftforge.event.entity.living.LivingAttackEvent'), e => {
        if (e.entity.level.clientSide || !e.source?.player || e.amount <= 1) return
        let tracker = getDmgTracker(e.entity)
        tracker.amount = e.amount
    })
    ForgeEvents.onEvent(Java.loadClass('net.minecraftforge.event.entity.living.LivingHurtEvent'), e => {
        if (e.entity.level.clientSide || !e.source?.player) return
        let tracker = getDmgTracker(e.entity)
        if (tracker.amount <= 0) return
        if (e.amount < tracker.amount * TOLERANCE) {
            if (DEBUG)
                e.source.player.tell(
                    `Damage diff for ${e.entity.displayName.string}: ${Math.floor(e.amount * 100) / 100} should be ${
                        Math.floor(tracker.amount * 100) / 100
                    }`,
                )
            e.amount = tracker.amount
        }
        tracker.amount = 0
    })
}
