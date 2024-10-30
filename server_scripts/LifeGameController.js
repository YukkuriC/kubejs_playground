let DandelifeonBlockEntity = Java.loadClass('vazkii.botania.common.block.flower.generating.DandelifeonBlockEntity')
// ruleKeep, ruleNew
// GenRule(Integer... data)

function LifeGame(name, create, keep) {
    let caller = () => {
        DandelifeonBlockEntity.ruleNew = DandelifeonBlockEntity.GenRule.apply(null, create)
        DandelifeonBlockEntity.ruleKeep = DandelifeonBlockEntity.GenRule.apply(null, keep)
        return `${name.toUpperCase()}\n生成：${create.join(', ')}\n保留：${keep.join(', ')}`
    }
    Object.defineProperty(LifeGame, name, {
        get: caller,
    })
}

LifeGame('life', [3], [2, 3])
LifeGame('wall', [4, 5, 6, 7, 8], [2, 3, 4, 5])
LifeGame('maze', [3], [1, 2, 3, 4, 5])
LifeGame('seed', [2], [])
LifeGame('yjsp', [1, 1, 4], [5, 1, 4])
