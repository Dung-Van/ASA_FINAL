const Intention = require('../bdi/Intention')
const PddlDomain = require('./PddlDomain')
const PddlProblem = require('./PddlProblem')
const execFile = require('child_process').execFile;
const pddlActionGoal =  require('./actions/pddlActionGoal')
const PlanningGoal =  require('./PlanningGoal')



function setup (intentions = []) {

    var PlanningIntention = class extends Intention {
        
        constructor (agent, goal) {
            super(agent, goal)
            this.plan = []; // [{parallel: true, goal: goalInstance}]
        }

        static actions = {}

        static addAction (intentionClass) {
            this.actions[intentionClass.name.toLowerCase()] = intentionClass
        }

        static getAction (name) {
            return this.actions[name]
        }

        static applicable (goal) {
            return goal instanceof PlanningGoal
        }

        async blackboxExec (domainFile, problemFile) {

            var result = '';
            
            var child = execFile('./blackbox', ['-o', domainFile, '-f', problemFile]);

            child.stdout.on('data', function(data) {
                result += data;
            });

            await new Promise( res => child.on('close', res) );

            var planStruct = []
            var planBeginned = false
            for (let line of result.split('\n')) {
                // this.log(line)
                if (line=='Begin plan'){
                    planBeginned = true
                    this.log(" =========== PLAN =========== ")}
                else if (line=='End plan'){
                    this.log(" =========== END PLAN =========== ")
                    break;}
                else if (planBeginned) {
                    this.log(line)
                    planStruct.push(line.replace('(','').replace(')','').split(' '));
                }
            }

            if (!planBeginned) {
                return Promise.reject(); //new Error('Plan not found'));
            }

            var previousNumber = 0

            for (let line of planStruct) {
                var number = line.shift()
                var action = line.shift()
                var args = line
                var intentionClass = this.constructor.getAction(action)
                var mappedArgs = {}
                for (let index = 0; index < intentionClass.parameters.length; index++) {
                    let k = intentionClass.parameters[index]
                    let v = args[index]
                    mappedArgs[k] = v
                }
                var intentionInstance = new intentionClass(this.agent, new pddlActionGoal(mappedArgs) )
                this.plan.push({parallel: number==previousNumber, intention: intentionInstance});
            }
            
            return;
        }

        *exec () {
            
            var pddlDomain = new PddlDomain(this.agent.name)
            pddlDomain.addAction(...Object.values(this.constructor.actions))
            var domainFile = yield pddlDomain.saveToFile()

            var pddlProblem = new PddlProblem(this.agent.name)
            pddlProblem.addObject(...this.agent.beliefs.objects) //'a', 'b'
            pddlProblem.addInit(...this.agent.beliefs.literals)
            pddlProblem.addGoal(...this.goal.parameters.goal)
            var problemFile = yield pddlProblem.saveToFile()
            yield this.blackboxExec(domainFile, problemFile)



            var previousStepGoals = []

            for (const step of this.plan) {
                if (step.parallel) {
                    this.log('Starting concurrent step with Intention: ' + step.intention.toString())
                }
                else {
                    yield Promise.all(previousStepGoals)
                    previousStepGoals = []
                    this.log('Starting sequential step with Intention: ' + step.intention.toString())
                }
                previousStepGoals.push(
                    step.intention.run().catch( err => {
                        console.log(err)
                        return Promise.reject(new Error('Plan execution aborted'));
                    } )
                )
            }

            // wait for last steps to complete before finish blackbox plan execution intention
            yield Promise.all(previousStepGoals)

        }

    } // end of class Blackbox extends Intention

    for ( let intentionClass of intentions ) {
        PlanningIntention.addAction(intentionClass)
    }

    return PlanningIntention;
}



// var kitchenAgent = new Agent('kitchen')
// kitchenAgent.intentions.push(DimOnLight)
// kitchenAgent.intentions.push(Blackbox)

// var blackbox = new Blackbox(kitchenAgent, new LightOn({l: 'light1'}), './tmp/domain-lights.pddl', './tmp/problem-lights.pddl')
// blackbox.run()



module.exports = setup