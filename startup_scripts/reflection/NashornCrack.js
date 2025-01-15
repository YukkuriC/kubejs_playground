const NashornInit = !global.Nashorn

// classfilter breaker
const code1 = `
function getField(cls, name) {
    var field = getCls(cls).class.getDeclaredField(name)
    field.setAccessible(true)
    return field
}
function getCls(cls) {
    return Java.type('dev.latvian.mods.kubejs.' + cls)
}

var F_SM_CF = getField('script.ScriptManager', 'classFilter')
var CF = getCls('plugin.ClassFilter')
var cf = new CF(null)
var KJS = getCls('KubeJS')
var smMap = {}

function unlock(sm, type) {
    smMap[type] = sm
    F_SM_CF.set(sm, cf)
}

function unlockServer(server) {
    unlock(server.getServerResources().managers().kjs$getServerScriptManager(), 'server')
}

unlock(KJS.startupScriptManager, 'startup')
`

// reflection unlocker
const code2 = `
var PluginList = getField('plugin.KubeJSPlugins', 'LIST').get(null)
var KJSPlugin = getCls('plugin.KubeJSPlugin')
var KJSContext = getCls('script.KubeJSContext')
var RhinoContext = Java.type('dev.latvian.mods.rhino.Context')
var KJSFactory = getCls('script.KubeJSContextFactory')
var AccessibleObject = Java.type('java.lang.reflect.AccessibleObject')
var ClassLoader = Java.type('java.lang.ClassLoader')

var F_TW_T = getField('script.TypeWrapperRegistry', 'type')

var fooFactory = null
var HackedPlugin = Java.extend(KJSPlugin, {
    registerTypeWrappers: function (wrapper) {
        var type = F_TW_T.get(wrapper)
        var sm = smMap[type.name]
        if (!sm) return
        if (!fooFactory) fooFactory = sm.contextFactory
        var wrapFactory = new HackedFactory(sm)
        type.console.contextFactory.refersTo(wrapFactory)
        sm.contextFactory = wrapFactory
    },
})
var HackedFactory = Java.extend(KJSFactory, {
    createContext: function () {
        var fooContext = new RhinoContext(fooFactory)
        var wrapContext = new HackedContext(fooFactory, {
            wrapAsJavaObject: function (scope, obj, target) {
                if (obj instanceof AccessibleObject || obj instanceof ClassLoader) {
                    return fooContext.wrapAsJavaObject(scope, obj, target)
                }
                return suu.wrapAsJavaObject(scope, obj, target)
            },
            // internalJsToJavaLast: function (from, target) {
            //     var c = target.asClass()
            //     if (AccessibleObject.class.isAssignableFrom(c) || ClassLoader.class.isAssignableFrom(c)) {
            //         return fooContext.internalJsToJavaLast(from, target)
            //     }
            //     return suu.internalJsToJavaLast(from, target)
            // },
        })
        var suu = Java.super(wrapContext)
        return wrapContext
    },
})
var HackedContext = Java.extend(KJSContext)

PluginList.add(new HackedPlugin())
`

if (NashornInit) {
    global.Nashorn = Java.loadClass('javax.script.ScriptEngineManager')().getEngineByName('nashorn')
    global.Nashorn.eval(code1)
    global.Nashorn.eval(code2)
}
