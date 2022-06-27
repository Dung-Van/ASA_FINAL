const Observable =  require('./Observable')



/**
 * @static {global} is the global time
 * @static {startTimer()} method start the timer loop
 * 
 * Note that mm, hh, and dd are updated one at a time!
 * However, Observable handle observer callbacks in microtask queues, so that,
 * at the time observers are actually called, both mm, hh, and dd should all been up-to-date!
 */
class Clock {

    /** @type {Observable} {dd, hh, mm} */
    static global = new Observable( {dd: 0, hh: 0, mm: 0} )

    static format() {
        var time = Clock.global
        return 'd:hh:mm ' + time.dd + ':' + (time.hh<10?'0':'')+time.hh + ':' + (time.mm==0?'00':time.mm)
    }

    static current(){
        return Clock.global
    }

    // Add calculation for time in minutes
    static current_minute(time_step=30){
        var time = Clock.global
        var minutes = ((time.dd * 24 + time.hh) * 60 + time.mm)/time_step
        return minutes
    }
    static #start = true

    static async stopTimer() {
        Clock.#start = false
    }

    static async startTimer() {
        Clock.#start = true

        while(Clock.#start) {
            await new Promise( res => setTimeout(res, 50))
            
            var {dd, hh, mm} = Clock.global
            
            if(mm<60-15)
                Clock.global.mm += 15
            else {
                if(hh<23) {
                    Clock.global.hh += 1 // increased hh but mm still 45
                    Clock.global.mm = 0 // however, observers are handled as microtask so at the time they are called everything will be sync
                }
                else {
                    Clock.global.mm = 0
                    Clock.global.hh = 0
                    Clock.global.dd += 1
                }
            }
            
            // Here, time is logged immediately before any other observable gets updated!
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write( Clock.format() + '\t');
        }
    }

}



module.exports = Clock
