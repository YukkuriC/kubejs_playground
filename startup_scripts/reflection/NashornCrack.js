global.Nashorn = global.Nashorn || Java.loadClass('javax.script.ScriptEngineManager')().getEngineByName('nashorn')

// classfilter breaker
global.Nashorn.eval(`
var F_SM_CF = Java.type('dev.latvian.mods.kubejs.script.ScriptManager').class.getDeclaredField('classFilter')
F_SM_CF.setAccessible(true)
var CF = Java.type('dev.latvian.mods.kubejs.plugin.ClassFilter')
var cf = new CF(null)
var KJS = Java.type('dev.latvian.mods.kubejs.KubeJS')
var smMap = {}

function unlock(sm, type) {
    smMap[type] = sm
    F_SM_CF.set(sm, cf)
}

function unlockServer(server) {
    unlock(server.getServerResources().managers().kjs$getServerScriptManager(), 'server')
}

unlock(KJS.startupScriptManager, 'startup')
`)
