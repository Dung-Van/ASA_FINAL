;; domain file: domain-houseagent.pddl
(define (domain houseagent)
    (:requirements :strips)
    (:predicates
        (on ?light)
        (empty ?room)
        (in ?light ?room)
        (is_light ?light)
        (is_room ?room)
        (off ?light)
        (is_agent ?agent)
        (is_human ?dad)
        (is_heater ?heater)              
    )
    
        (:action LightOff
            :parameters (?light ?room)
            :precondition (and
                (on ?light)
                (empty ?room)
                (in ?light ?room)
                (is_light ?light)
                (is_room ?room)
            )
            :effect (and
                (off ?light)
            )
        )
        
        (:action ObserveRoomEmpty
            :parameters (?agent ?room ?dad ?mom ?child)
            :precondition (and
                (in ?agent ?room)
                (not (in ?dad ?room))
                (not (in ?mom ?room))
                (not (in ?child ?room))
                (is_room ?room)
                (is_agent ?agent)
                (is_human ?dad)
                (is_human ?mom)
                (is_human ?child)
            )
            :effect (and
                (empty ?room)
            )
        )
        
        (:action ObserveRoomNotEmpty
            :parameters (?agent ?room ?human)
            :precondition (and
                (in ?agent ?room)
                (in ?human ?room)
                (is_room ?room)
                (is_agent ?agent)
                (is_human ?human)
            )
            :effect (and
                (not (empty ?room))
            )
        )
        
        (:action MoveAgent
            :parameters (?agent ?room_prev ?room_curr)
            :precondition (and
                (not (in ?agent ?room_curr))
                (in ?agent ?room_prev)
                (is_room ?room_prev)
                (is_room ?room_curr)
                (is_agent ?agent)
            )
            :effect (and
                (in ?agent ?room_curr)
                (not (in ?agent ?room_prev))
            )
        )
        
        (:action HeaterSave
            :parameters (?heater ?room)
            :precondition (and
                (on ?heater)
                (empty ?room)
                (is_heater ?heater)
                (is_room ?room)
            )
            :effect (and
                (off ?heater)
            )
        )
        
        (:action CheckLocation
            :parameters (?agent ?room ?human)
            :precondition (and
                (in ?agent ?room)
                (in ?human ?room)
                (is_room ?room)
                (is_agent ?agent)
                (is_human ?human)
            )
            :effect (and
                (not (in ?human ?room))
            )
        )
)