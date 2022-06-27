const Observable =  require('../utils/Observable')



class Beliefset extends Observable { // Implementation based on Observable



    #objectsMap;
    
    constructor () {
        super ({})
        this.#objectsMap = {}
    }



    addObject (obj) {
        if (!(typeof obj === 'string'))
            throw('String expected, got ' + typeof obj + ': ' + obj)
        this.#objectsMap[obj] = obj
    }

    removeObject (obj) {
        if (!(typeof obj === 'string'))
            throw('String expected, got ' + typeof obj + ': ' + obj)
        delete this.#objectsMap[obj];
    }

    get objects () {
        return Object.values(this.#objectsMap);
    }



    /**
     * call the declare method with false value
     * @param {String} fact A fact is composed by a predicate and arguments e.g. 'person_in_room bob kitchen'
     * @returns changed
     */
    undeclare (fact) {
        return this.declare(fact, false)
    }

    /**
     * 
     * @param {String} fact A fact is composed by a predicate and arguments e.g. 'person_in_room bob kitchen'
     * @param {boolean} value Fact status, true or false. Default value is true
     * @returns {boolean} true if changed otherwise false
     */
    declare (fact, value = true) {
        if (!(typeof fact === 'string'))
            throw('String expected, got ' + typeof fact + ': ' + fact)
        if (fact.split(' ')[0] == 'not')
            {
            throw('Fact expected, got a negative literal: ' + fact)}

        var changed = this.set(fact, value)
        
        if ( changed )
            for (let obj of fact.split(' ').splice(1))
                this.addObject(obj)
        
        return changed
    }



    /**
     * @return {Array<String>}    Return an Array of String literals (possibly negated facts) e.g. 'light_on kitchen_light' or 'not light_on kitchen_light'
     */
    get literals () {
        return this.entries.map( ([fact, value]) => (value?fact:'not ('+fact+')') )
    }

    /**
     * 
     * @param {String} literal Possibly negated fact, e.g. 'not light_on'
     */
    apply (...literals) {
        for ( let literal of literals ) {
            var not = literal.split(' ')[0] == 'not'
            var fact = (not?literal.split(' ').splice(1).join(' '):literal)
            if (not) fact = fact.replace('(','').replace(')','')
            this.declare(fact, !not)
        }
    }

    /**
     * Closed World assumption; if i don't know about something then it is false!
     * 
     * @param  {...String} literals Iterable of literals; intended as a conjunction of literals
     * @returns {boolean} true if verified, otherwise false
     */
    check (debug, ...literals) {
        for ( let literal of literals ) {
            let not = literal.split(' ')[0] == 'not'
            let fact = (not?literal.split(' ').splice(1).join(' '):literal)
            // if (debug) console.log("check:", literal)

            
            if ( this[fact] )
                if ( not ){
                    if (debug) console.log("precondition not satisfied:", literal)
                    // return (false, literal);
                    return false;
                }
                else
                    continue;
            else // Closed World assumption; if i don't know about something then it is false
                if ( not )
                    continue;
                else{
                    if (debug) console.log("precondition not satisfied:", literal)
                    // return (false, literal);
                    return false;
                }
        }

        // return (null);
        return true;
    }

}



module.exports = Beliefset