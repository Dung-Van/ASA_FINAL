const Observable =  require('./Observable')
const Clock =  require('./Clock')


test('Clock => notifyChange(mm)', async () => {

    Clock.startTimer();
    Clock.global.notifyChange('mm').then( mm => {
        expect(mm).toBe(15)
        Clock.stopTimer();
    })

});

test('Clock => notifyChange(hh)', async () => {

    Clock.startTimer();
    Clock.global.notifyChange('hh').then( hh => {
        expect(hh).toBe(1)
        Clock.stopTimer();
    })

});

test('Clock => observe(hh)', async () => {

    Clock.startTimer();
    var ob1 = mm => {
        if(Clock.global.hh==1) {
            expect(mm).toBe(0)
            Clock.global.unobserve('mm', ob1)
            Clock.stopTimer();
        }
    }
    Clock.global.observe('mm', ob1)

});