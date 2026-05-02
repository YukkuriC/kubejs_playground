const Integer = Java.loadClass('java.lang.Integer')

global.setter.SERVER_SCOPE = this

ServerEvents.loaded(e => {
    global.setter.server = e.server
})
