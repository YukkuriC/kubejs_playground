const Integer = Java.loadClass('java.lang.Integer')

global.setter.SERVER_SCOPE = this

{
    let setServer = e => {
        global.setter.server = e.server
    }
    ServerEvents.loaded(setServer)
    ServerEvents.command('reload', setServer)
}

ServerEvents.loaded(e => {
    global.Nashorn.invokeFunction('unlockServer', e.server)
})
