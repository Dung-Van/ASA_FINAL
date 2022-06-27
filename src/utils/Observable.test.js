const Observable =  require('./Observable')



test('Observable => observers are called back as microtask after current pending Promises', async () => {

    var o1 = new Observable( { name:'bob' } )
    Promise.resolve().then( () => expect(o1.name).toBe('final_name') )
    o1.name = 'final_name'

});

test('Observable => field not observable', async () => {

    var o1 = new Observable( { } )
    o1.comment = 'do not do this'
    expect( Object.getOwnPropertyDescriptor(o1, 'comment').get == undefined ).toBe(true)

});

test('Observable => field created with defineProperty', async () => {

    var o1 = new Observable( { } )
    o1.defineProperty('age', 20)
    expect( Object.getOwnPropertyDescriptor(o1, 'age').get != undefined ).toBe(true)

});

test('Observable => field created when observed', async () => {

    var o1 = new Observable( { } )
    o1.observe('title', (v, k)=>{} ) // or this
    expect( Object.getOwnPropertyDescriptor(o1, 'title').get != undefined ).toBe(true)

});

test('Observable => fields updated all together and observers notified at the end', async () => {

    var o1 = new Observable( { name:'bob', in_room: 'kitchen' } )

    o1.observe('in_room', value => {
        expect(o1.name).toBe('together')
    })
    
    o1.in_room = 'garage'
    o1.name = 'together'
    await Promise.resolve()
    o1.name = 'after await promise name'

});

test('Observable => observers notified later but with value of the update', async () => {
    
    let o1 = new Observable( { name: 1 } )
    
    o1.observe('name', value => {
        expect(value==2 || value==3).toBe(true)
    })

    o1.name = 2
    o1.name = 3

});

test('Observable => notifyChange once', async () => {
    
    var o1 = new Observable( { version:'v1'} )
    o1.notifyChange('version').then( v => {
        expect(v).toBe('v2')
    })
    o1.version = 'v2'
    o1.version = 'v3'

});

test('Observable => entries', async () => {
    
    var o1 = new Observable( { item1:true} )
    expect(o1.entries[0]).toEqual(['item1',true])

});