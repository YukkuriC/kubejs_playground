// requires: botania_overpowered

let API = Java.loadClass('io.yukkuric.botania_overpowered.api.DandelifeonRules')
API.NEW = API.GenFromNums(1, 3)
API.KEEP = x => x >= 1 && x <= 5
