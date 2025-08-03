// requires: create
{
    let Random = Java.loadClass('java.util.Random')
    let ProcessingOutput = Java.loadClass('com.simibubi.create.content.processing.recipe.ProcessingOutput')

    global.unsafeSetField(
        ProcessingOutput,
        'r',
        new JavaAdapter(Random, {
            nextFloat() {
                return 0
            },
        }),
        true,
    )
}
