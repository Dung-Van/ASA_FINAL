
async function one () {

    for ( let i = 0; i < 5; i++ ) {
        console.log('one', i)
        // await Promise.resolve()
        await new Promise( res => setTimeout(res, 0))
    }

}


async function two () {

    for ( let i = 0; i < 5; i++ ) {
        console.log('two', i)
        await Promise.resolve()
        // await new Promise( res => setTimeout(res, 0))
    }

}

one()
two()