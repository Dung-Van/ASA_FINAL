const pddlActionIntention = require('../pddl/actions/pddlActionIntention')
const Agent = require('../bdi/Agent')
const Goal = require('../bdi/Goal')
const Intention = require('../bdi/Intention')
const PlanningGoal = require('../pddl/PlanningGoal')



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
                await new Promise(res=>setTimeout(res,1000))
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

    world.pickUp = function ({ob, gripper} = args) {
        this.log('pickUp', ob, gripper)
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

    world.unStack = function ({x, y, gripper} = args) {
        this.log('unStack', x, y, gripper)
        return new UnStack(world, {x, y, gripper} ).checkPreconditionAndApplyEffect()
        .catch(err=>{this.error('world.unStack failed:', err.message || err); throw err;})
    }

}




/**
 * Gripper agents
 */
{
    class PickUp extends pddlActionIntention {
        static parameters = ['ob'];
        static precondition = [ ['clear', 'ob'], ['on-table', 'ob'], ['empty'] ];
        static effect = [ ['holding', 'ob'], ['not empty'], ['not clear', 'ob'], ['not on-table', 'ob'] ];
        *exec ({ob}=parameters) {
            yield world.pickUp({ob, gripper: this.agent.name})
        }
    }

    class PutDown extends pddlActionIntention {
        static parameters = ['ob'];
        static precondition = [ ['holding', 'ob'] ];
        static effect = [ ['not holding', 'ob'], ['empty'], ['clear', 'ob'], ['on-table', 'ob'] ];
        *exec ({ob}=parameters) {
            yield world.putDown({ob, gripper: this.agent.name})
        }
    }

    class Stack extends pddlActionIntention {
        static parameters = ['x', 'y'];
        static precondition = [ ['holding', 'x'], ['clear', 'y'] ];
        static effect = [ ['holding', 'x'], ['empty'], ['clear', 'x'], ['not clear', 'y'], ['on', 'x', 'y'] ];
        *exec ({x,y}=parameters) {
            yield world.stack({x: x, y: y, gripper: this.agent.name})
        }
    }

    class UnStack extends pddlActionIntention {
        static parameters = ['x', 'y'];
        static precondition = [ ['on', 'x', 'y'], ['clear', 'x'], ['empty'] ];
        static effect = [ ['holding', 'x'], ['not empty'], ['not clear', 'x'], ['clear', 'y'], ['not on', 'x', 'y'] ];
        *exec ({x,y}=parameters) {
            yield world.unStack({x: x, y: y, gripper: this.agent.name})
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
        let predicate = key.split(' ')[0]
        let arg1 = key.split(' ')[1]
        let arg2 = key.split(' ')[2]
        if (predicate=='holding')
            if (arg2==agent.name)
                key = 'holding '+arg1; //key.split(' ').slice(0,2).join(' ')
            else
                return;
        else if (predicate=='empty')
            if (arg1==agent.name)
                key = 'empty'
            else
                return;
        value?agent.beliefs.declare(key):agent.beliefs.undeclare(key)
    }
    
    {
        let a1 = new Agent('a1')
        // a1.beliefs.declare('on-table a')
        // a1.beliefs.declare('on b a')
        // a1.beliefs.declare('clear b')
        // a1.beliefs.declare('empty')
        world.beliefs.observeAny( sensor(a1) )
        // let {PlanningIntention} = require('../pddl/BlackboxIntentionGenerator')([PickUp, PutDown, Stack, UnStack])
        let {OnlinePlanning} = require('../pddl/OnlinePlanner')([PickUp, PutDown, Stack, UnStack])
        a1.intentions.push(OnlinePlanning)
        a1.intentions.push(RetryFourTimesIntention)
        // console.log('a1 entries', a1.beliefs.entries)
        // console.log('a1 literals', a1.beliefs.literals)
        // a1.postSubGoal( new PlanningGoal( { goal: ['holding a'] } ) ) // by default give up after trying all intention to achieve the goal
        a1.postSubGoal( new RetryGoal( { goal: new PlanningGoal( { goal: ['holding a'] } ) } ) ) // try to achieve the PlanningGoal for 4 times
    }
    {
        let a2 = new Agent('a2')
        // a2.beliefs.declare('on-table a')
        // a2.beliefs.declare('on b a')
        // a2.beliefs.declare('clear b')
        // a2.beliefs.declare('empty')
        world.beliefs.observeAny( sensor(a2) )
        let {OnlinePlanning} = require('../pddl/OnlinePlanner')([PickUp, PutDown, Stack, UnStack])
        a2.intentions.push(OnlinePlanning)
        a2.intentions.push(RetryFourTimesIntention)
        // console.log('a2 entries', a2.beliefs.entries)
        // console.log('a2 literals', a2.beliefs.literals)
        // a2.postSubGoal( new PlanningGoal( { goal: ['holding a'] } ) ) // loop over intentions trying to achieve the goals up to 5 times
        a2.postSubGoal( new RetryGoal( { goal: new PlanningGoal( { goal: ['holding a'] } ) } ) ) // try to achieve the PlanningGoal for 4 times
    }
}


world.beliefs.declare('on-table a')
world.beliefs.declare('on b a')
world.beliefs.declare('clear b')
world.beliefs.declare('empty a1')
world.beliefs.declare('empty a2')