// requires: create
// requires: unsafejs
{
    let Random = Java.loadClass('java.util.Random')
    let ProcessingOutput = Java.loadClass('com.simibubi.create.content.processing.recipe.ProcessingOutput')

    Unsafe.setField(
        ProcessingOutput,
        'r',
        new JavaAdapter(Random, {
            nextFloat() {
                return 0
            },
        }),
    )
}
