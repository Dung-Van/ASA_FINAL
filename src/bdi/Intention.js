const Goal = require('./Goal');
const Agent = require('./Agent');
const keypress = require('../utils/keypress')

var nextId = 0

/**
 * @class Intention
 */
class Intention {
    
    constructor (agent, goal) {
        this.id = nextId++
        
        /** @type {Agent} agent */
        this.agent = agent

        /** @type {Goal} goal */
        this.goal = goal
    }

    log (...args) {
        let header = this.agent.name+'>'+this.constructor.name+'#'+this.id
        this.agent.headerLog(header, ...args) //this.goal.constructor.name+'['+this.goal.id+']'+'>'
    }

    error (...args) {
        let header = this.agent.name+'>'+this.constructor.name+'#'+this.id
        this.agent.headerError(header, ...args)
    }



    /**
     * 

     * @param {Goal} goal   goal, whatever it is
     * @returns {boolean}   true if applicable
     */
    static applicable (goal) {
        if (goal instanceof Goal)
            return true;
        else
            return false;
    }



    /**
     * If microtasks continuously add more elements to microTasks queue,
     * macroTasks will stall and won’t complete event loop in shorter time
     * causing event loop delays.
     * 
     * Check this:
     * - https://medium.com/dkatalis/eventloop-in-nodejs-macrotasks-and-microtasks-164417e619b9
     * Similarly it is for javascript on browser-side:
     * - https://medium.com/@idineshgarg/let-us-consider-an-example-a58bb1c11f55
     * 
     * await Promise.resolve(); // microtask, this would still block all timers and IO from being executed!!!
     * await new Promise( res => setTimeout(res, 0)) // macrotask, queues together with other timers and IO

     * @returns {Boolean}   true if success, otherwise false
     */
    async run () {
        // this.log('Intention started');

        var iterator = this.exec(this.goal.parameters)
        var awaitedYield = null
        var done = false

        while (!done) {
            // TODO quit here if intention is no more valid
            // if (this.contextConditions && !this.contextConditions())
            //     return false;
            
            // execute next step passing value from previous step
            var yieldValue, {value: yieldValue, done} = iterator.next(awaitedYield)
            
            // attach immediately a catch callback to avoid getting a
            // PromiseRejectionHandledWarning: Promise rejection was handled asynchronously
            // https://javascript.tutorialink.com/why-do-i-get-an-unhandled-promise-rejection-with-await-promise-all/
            if (yieldValue instanceof Promise)
                yieldValue.catch( err => {} );
            
            // Alternatively, simply put immediately a try/catch block.
            // This will handle also errors already catched by .catch method
            try {
                // await for the eventual promise to resolve
                awaitedYield = await yieldValue

            } catch (err) { // errors catched here are already been catched and printed by .catch previously associated to the yieldValue promise
                // this.error( 'Intention failed:', err.message || err || 'undefined error in yield statement' );
                // this.log('Intention failed')
                throw err//new Error('Intention failed'); // Since we are in an aync function, here we are rejecting the promise. We will need to catch this!
            }

            // Always wait for a timer to avoid stopping the event loop within microtask queue!
            await new Promise( res => setTimeout(res, 0))
            // this.log('press any key to continue')
            // await keypress()
        }

        // this.log('Intention success')
        return true;

    }

}



module.exports = Intention