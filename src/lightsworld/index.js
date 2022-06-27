const Goal = require('../bdi/Goal')
const Intention = require('../bdi/Intention')



class LightOn extends Goal {

    static parameters = ['l']
    static precondition = [ ['switched-off', 'l'] ]
    static effect = [ ['switched-on', 'l'], ['not switched-off', 'l'] ]

}


class DimOnLight extends Intention {
    
    // contextConditions () {
    //     return 'switched-off ' + this.goal.parameters.l
    // }

    static applicable (goal) {
        return goal instanceof LightOn
    }
    
    *exec () {
        let light = this.goal.parameters.l
        for (let i = 0; i < 10; i++) {
            this.log(light, i)
            yield new Promise( res => setTimeout(res, 50))
        }
        yield
    }

}



class DimOffLight extends Intention {
    
    static applicable (goal) {
        return goal instanceof LightOn
    }
    
    *exec () {
        let light = this.goal.parameters.l
        return Promise.reject()
    }

}


// console.log(new LightOn({'l':'light1'}).checkPrecondition())


module.exports = {LightOn, DimOnLight, DimOffLight}