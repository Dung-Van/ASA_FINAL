const pddlActionIntention = require('../pddl/actions/pddlActionIntention')
const Agent = require('../bdi/Agent')
const Goal = require('../bdi/Goal')
const Intention = require('../bdi/Intention')
const PlanningGoal = require('../pddl/PlanningGoal')
const Observable = require('../utils/Observable')



/**
 * World agent
 */
const world = new Agent('world');
{

    class FakeAction {

        constructor (agent, parameters) {
            this.agent = agent
            this.parameters = parameters
        }

        get precondition () {
            return pddlActionIntention.ground(this.constructor.precondition, this.parameters)
        }
        
        checkPrecondition () {
            return this.agent.beliefs.check(...this.precondition);
        }

        get effect () {
            return pddlActionIntention.ground(this.constructor.effect, this.parameters)
        }

        applyEffect () {
            for ( let b of this.effect )
                this.agent.beliefs.apply(b)
        }

        async checkPreconditionAndApplyEffect () {
            if ( this.checkPrecondition() ) {
                this.applyEffect()
                await new Promise(res=>setTimeout(res,5000))
            }
            else
                throw new Error('pddl precondition not valid'); //Promise is rejected!
        }

    }

    class PickUp extends FakeAction {
        static parameters = ['ob', 'gripper']
        static precondition = [ ['clear', 'ob'], ['on-table', 'ob'], ['empty', 'gripper'] ]
        static effect = [ ['holding', 'ob', 'gripper'], ['not empty', 'gripper'], ['not clear', 'ob'], ['not on-table', 'ob'] ]
    }

    class PutDown extends FakeAction {
        static parameters = ['ob', 'gripper']
        static precondition = [ ['holding', 'ob', 'gripper'] ]
        static effect = [ ['not holding', 'ob', 'gripper'], ['empty', 'gripper'], ['clear', 'ob'], ['on-table', 'ob'] ]
    }

    class Stack extends FakeAction {
        static parameters = ['x', 'y', 'gripper']
        static precondition = [ ['holding', 'x', 'gripper'], ['clear', 'y'] ]
        static effect = [ ['holding', 'x', 'gripper'], ['empty', 'gripper'], ['clear', 'x'], ['not clear', 'y'], ['on', 'x', 'y'] ]
    }

    class UnStack extends FakeAction {
        static parameters = ['x', 'y', 'gripper']
        static precondition = [ ['on', 'x', 'y'], ['clear', 'x'], ['empty', 'gripper'] ]
        static effect = [ ['holding', 'x', 'gripper'], ['not empty', 'gripper'], ['not clear', 'x'], ['clear', 'y'], ['not on', 'x', 'y'] ]
    }

    world.pickUp = async function ({ob, gripper} = args) {
        this.log('pickUp', ob, gripper)
        // await new Promise( res => setTimeout(res, 5000) )
        return new PickUp(world, {ob, gripper} ).checkPreconditionAndApplyEffect()
        .catch(err=>{this.error('world.pickUp failed:', err.message || err); throw err;})
    }

    world.putDown = function ({ob, gripper} = args) {
        this.log('putDown', ob, gripper)
        return new PutDown(world, {ob, gripper} ).checkPreconditionAndApplyEffect()
        .catch(err=>{this.error('world.putDown failed:', err.message || err); throw err;})
    }

    world.stack = function ({x, y, gripper} = args) {
        this.log('stack', x, y, gripper)
        return new Stack(world, {x, y, gripper} ).checkPreconditionAndApplyEffect()
        .catch(err=>{this.error('world.stack failed:', err.message || err); throw err;})
    }

    world.unStack = async function ({x, y, gripper} = args) {
        this.log('unStack', x, y, gripper)
        new UnStack(world, {x, y, gripper} ).checkPrecondition()
        // await new Promise( res => setTimeout(res, 5000) )
        return new UnStack(world, {x, y, gripper} ).checkPreconditionAndApplyEffect()
        .catch(err=>{this.error('world.unStack failed:', err.message || err); throw err;})
    }

}



class MessageDispatcher extends Observable {
    
    static #dispatchers = {}
    static authenticate (senderAgent) {
        if (!(senderAgent.name in this.#dispatchers))
            this.#dispatchers[senderAgent.name] = new MessageDispatcher(senderAgent.name)
        return this.#dispatchers[senderAgent.name]
    }

    constructor (name) {
        super({newMessageReceived: false})
        this.name = name
        this.received = []
    }
    
    pushMessage (goal) {
        this.newMessageReceived = true
        this.received.push(goal)
    }
    
    readMessage () {
        this.newMessageReceived = false
        return this.received.pop()
    }
    
    async sendTo (to, goal) {
        if (!to in this.constructor.#dispatchers)
            this.constructor.#dispatchers[to] = new MessageDispatcher(to)
        this.constructor.#dispatchers[to].pushMessage(goal)
        return goal.notifyChange('achieved')
    }

}

class Postman extends Goal {
}

class PostmanAcceptAllRequest extends Intention {
    static applicable (goal) {
        return goal instanceof Postman
    }
    *exec (parameters) {
        var myMessageDispatcher = MessageDispatcher.authenticate(this.agent)
        while (true) {
            yield myMessageDispatcher.notifyChange('newMessageReceived')
            let newMessage = myMessageDispatcher.readMessage()
            if (newMessage && newMessage instanceof Goal) {
                this.log('Reading received message', newMessage.toString())
                // console.log(newMessage)
                yield this.agent.postSubGoal(newMessage)
            }
        }
    }
}



/**
 * Gripper agents
 */
{
    class PickUpGoal extends Goal {}
    class PickUp extends pddlActionIntention {
        static parameters = ['ob', 'gripper'];
        static precondition = [ ['clear', 'ob'], ['on-table', 'ob'], ['empty', 'gripper'] ];
        static effect = [ ['holding', 'ob', 'gripper'], ['not empty', 'gripper'], ['not clear', 'ob'], ['not on-table', 'ob'] ];
        static applicable (goal) {
            return goal instanceof PickUpGoal
        }
        *exec ({ob, gripper}=parameters) {
            if (gripper==this.agent.name)
                yield world.pickUp({ob, gripper})
            else
                yield MessageDispatcher.authenticate(this.agent).sendTo( gripper, new PickUpGoal({ob, gripper}) )
        }
    }

    class PutDownGoal extends Goal {}
    class PutDown extends pddlActionIntention {
        static parameters = ['ob', 'gripper'];
        static precondition = [ ['holding', 'ob', 'gripper'] ];
        static effect = [ ['not holding', 'ob', 'gripper'], ['empty', 'gripper'], ['clear', 'ob'], ['on-table', 'ob'] ];
        static applicable (goal) {
            return goal instanceof PutDownGoal
        }
        *exec ({ob,gripper}=parameters) {
            if (gripper==this.agent.name)
                yield world.putDown({ob, gripper})
            else
                yield MessageDispatcher.authenticate(this.agent).sendTo( gripper, new PutDownGoal({ob, gripper}) )
        }
    }

    class StackGoal extends Goal {}
    class Stack extends pddlActionIntention {
        static parameters = ['x', 'y', 'gripper'];
        static precondition = [ ['holding', 'x', 'gripper'], ['clear', 'y'] ];
        static effect = [ ['holding', 'x', 'gripper'], ['empty', 'gripper'], ['clear', 'x'], ['not clear', 'y'], ['on', 'x', 'y'] ];
        static applicable (goal) {
            return goal instanceof StackGoal
        }
        *exec ({x,y,gripper}=parameters) {
            if (gripper==this.agent.name)
                yield world.stack({x,y,gripper})
            else
                yield MessageDispatcher.authenticate(this.agent).sendTo( gripper, new StackGoal({x,y,gripper}) )
        }
    }

    class UnStackGoal extends Goal {}
    class UnStack extends pddlActionIntention {
        static parameters = ['x', 'y', 'gripper'];
        static precondition = [ ['on', 'x', 'y'], ['clear', 'x'], ['empty', 'gripper'] ];
        static effect = [ ['holding', 'x', 'gripper'], ['not empty', 'gripper'], ['not clear', 'x'], ['clear', 'y'], ['not on', 'x', 'y'] ];
        static applicable (goal) {
            return goal instanceof UnStackGoal
        }
        *exec ({x,y,gripper}=parameters) {
            if (gripper==this.agent.name)
                yield world.unStack({x,y,gripper})
            else {
                let request = yield new UnStackGoal({x,y,gripper})
                yield MessageDispatcher.authenticate(this.agent).sendTo( gripper, request )
            }
        }
    }

    class RetryGoal extends Goal {}
    class RetryFourTimesIntention extends Intention {
        static applicable (goal) {
            return goal instanceof RetryGoal
        }
        *exec ({goal}=parameters) {
            for(let i=0; i<4; i++) {
                let goalAchieved = yield this.agent.postSubGoal( goal )
                if (goalAchieved)
                    return;
                this.log('wait for something to change on beliefset before retrying for the ' + (i+2) + 'th time goal', goal.toString())
                yield this.agent.beliefs.notifyAnyChange()
            }
        }
    }

    var sensor = (agent) => (value,key,observable) => {
        value?agent.beliefs.declare(key):agent.beliefs.undeclare(key)
    }

    let {OnlinePlanning} = require('../pddl/OnlinePlanner')([PickUp, PutDown, Stack, UnStack])
    
    {
        let a1 = new Agent('a1')
        world.beliefs.observeAny( sensor(a1) )
        a1.intentions.push(PickUp, PutDown, Stack, UnStack)
        a1.intentions.push(OnlinePlanning)
        a1.intentions.push(RetryFourTimesIntention)
        a1.intentions.push(PostmanAcceptAllRequest)

        // console.log('a1 entries', a1.beliefs.entries)
        // console.log('a1 literals', a1.beliefs.literals)

        // a1.postSubGoal( new PlanningGoal( { goal: ['holding a'] } ) ) // by default give up after trying all intention to achieve the goal
        a1.postSubGoal( new RetryGoal( { goal: new PlanningGoal( { goal: ['holding a a1'] } ) } ) ) // try to achieve the PlanningGoal for 4 times
        a1.postSubGoal( new Postman() )
    }
    {
        let a2 = new Agent('a2')
        world.beliefs.observeAny( sensor(a2) )
        a2.intentions.push(PickUp, PutDown, Stack, UnStack)
        a2.intentions.push(OnlinePlanning)
        a2.intentions.push(RetryFourTimesIntention)
        a2.intentions.push(PostmanAcceptAllRequest)

        // console.log('a2 entries', a2.beliefs.entries)
        // console.log('a2 literals', a2.beliefs.literals)

        // a2.postSubGoal( new PlanningGoal( { goal: ['holding a'] } ) ) // loop over intentions trying to achieve the goals up to 5 times
        // a2.postSubGoal( new RetryGoal( { goal: new PlanningGoal( { goal: ['holding a a2'] } ) } ) ) // try to achieve the PlanningGoal for 4 times
        a2.postSubGoal( new Postman() )
    }
}


world.beliefs.declare('on-table a')
world.beliefs.declare('on b a')
world.beliefs.declare('clear b')
world.beliefs.declare('empty a1')
world.beliefs.declare('empty a2')