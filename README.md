# Autonode.js
This repository is the final project for Autonomous Software Agent coruse, hosted by University of Trento

# Inference command
node src/myworld/myscenario.js

# Changelog
src/pddl/Blackbox.js -> change path to blackbox linux version, add and remove some log for better log visualization

src/pddl/actions/pddlActionIntention.js -> add 'get parameters' support function for taking action in house env, modify checkPrecondition function for debug

src/bid/Intention.js -> add and remove some log for better log visualization

src/bdi/Beliefset.js -> fix bug in function 'apply(...literals)' when re-apply literals produced from function 'get literals'

src/bdi/Agent.js -> add functions support communication between agents.


### Autonomous Software Agents - Lab

University of Trento - Trento, 2022

Marco Robol - marco.robol@unitn.it

# Changelog

### 1.3.0 (10/05/2022)

- src/blocksworld/ - actions: blocksworldIntention and test: blocksworldScenario1
- src/pddl/ - pddl domain, problem, actions

Fixes:
- src/bdi/Beliefset.js - fixed get literals `not(...)`
- src/utils/Clock.js - fixed 24h *thanks to Riccardo Ratta <riccardoratta@gmail.com>*
- src/utils/Observable.js - fixed get entries(); fixed notifyChange() and unobserve() *thanks to Momofil31 <filippomomesso@gmail.com>*

Minor:
- src/bdi/Agent.js - Beliefset changes console.log message;

### 1.2 (26/04/2022)

- src/houseworld/scenario4.js - Scenario with alarm and light sensing structured into classes; 
- src/houseworld/Alarm.js - Goal and Intention for alarm agent;
- src/houseworld/Light.js, src/houseworld/LightSensor.js - Device and sensor

Minor:
- src/utils/Clock.js - Fixes to print updated clock time before any other event;
- src/utils/Observable.js - Support observeAny(); Fixes to set(key, value) and defineProperty(key);
- src/bdi/Agent.js - Print any agent beliefset update;

### 1.1 (19/04/2022)

### 1.0 (15/04/2022)
