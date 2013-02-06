/**
 *  Module: Event Bus. It is based on HTML5 window.postMessage
 *
 *  Product: Open Web Device
 *
 *  Copyright(c) 2012 Telefónica I+D S.A.U.
 *
 *  LICENSE: Apache 2.0
 *
 *  @author Telefonica Digital
 *
 *  Event Objects will usually have the following structure
 *
 *  var eventObj = {};
 *  eventObj.type = 'myType';
 *  eventObj.timestamp = <timestamp> (automatically generated)
 *  eventObj.data = {a: 'this is custom data'};
 *
 *  Event objects can be filtered by the bus according to their type
 *
 *
 * @example (Subscription)
 *
 *  utils.events.subscribe('MyBus','*');
 *  utils.events.on('data',function(d) { window.console.log('Data available'); } );
 *
 *  @example (Publication)
 *
 *  var eventObj = {};
 *  eventObj.type = 'newCall';
 *  eventObj.data = { number: '638 883 075' };
 *  utils.events.dispatch('MyBus',eventObj);
 *
 */

'use strict';

var utils = window.utils || {};

if(!utils.events) {
    (function() {
        var Events = utils.events = {};

        // Event buses on the system. Each event bus has a well-known name
        var buses = {};

        // To notify when a browsing context has been subscribed
        var subscribedCB = null;
        // To notify new data
        var dataCB = null;
        // To notify when event data has been dispatched to the bus
        var dispatchedCB = null;

        /*
         *  Event listener for 'message' DOM events over the window object
         *
         *  Depending on the <type> of message received it reacts
         *  @private
         *
         *  @param MessageEvent as per HTML5 cross-document messaging
         *
         */
        function msgCallback(e) {
            // Is this a request from another component?
            if(e.data.type === 'request') {
                if(e.data.method === 'subscribe') {
                    var bus = getBus(e.data.params.name);
                    var response = {type:'response',method: e.data.method};

                    bus.subscribe(e.data.params.filter,e.source.frames);

                    response.result = 'ok';

                    e.source.postMessage(response,'*');
                }
                else if(e.data.method === 'dispatch') {
                    var bus = getBus(e.data.params.name);
                    var response = {type:'response', method: e.data.method};

                    bus.dispatch(e.data.params.eventObj);

                    response.result = 'ok';
                    e.source.postMessage(response,'*');
                }
            }
            // Is this a response from a previous request?
            else if(e.data.type === 'response') {
                if(e.data.method === 'subscribe') {
                    if(typeof subscribedCB === 'function') {
                        subscribedCB();
                    }
                }
                else if(e.data.method === 'dispatch') {
                    if(typeof dispatchedCB === 'function') {
                        dispatchedCB();
                    }
                }
            }
             //  Is this an event circulating on the bus?
            else if(e.data.type === 'eventObj') {
                if(typeof dataCB === 'function') {
                    dataCB(e.data.data);
                }
            }
        }

        // Event listener is registered for 'message' events
        window.addEventListener('message',msgCallback);

        /*
         *  Returns an event bus by name
         *
         *  @private
         *
         *  @param {String} bus name
         *
         */
        function getBus(name) {
            var bus = buses[name];
            if(typeof bus === 'undefined') {
                bus = new EventBus(name);
                buses[name] = bus;
            }

            return bus;
        };

        /*
         *  The caller will be subscribed to the events published on the specified bus
         *  and which type is equals to the filter specified. '*' means all events
         *
         *  If the call succeeds a subscribed event will be raised (on method)
         *
         *  @public
         *
         *  @param busName name of the bus
         *  @param filter type of events to be subscribed to
         *
         *
         */
        Events.subscribe = function(busName,filter) {
            var req = { type: 'request', method: 'subscribe', params: {} };
            req.params.name = busName;
            req.params.filter = filter;

            parent.postMessage(req,'*');
        };

        /*
         * This method allows to register simple event listeners
         *
         * @param eventType oneof ['data','subscribed','dispatched']
         * @param cb callback function
         *
         * @example
         *
         * owd.events.on('subscribed',function(data) {
         *         window.console.log('Subscribed to the bus: ' + data.busName) } );
         *
         *
         */
        Events.on = function(eventType,cb) {
            if(eventType === 'subscribed') {
                subscribedCB = cb;
            }
            else if(eventType === 'data') {
                dataCB = cb;
            }
            else if(eventType === 'dispatched') {
                dispatchedCB = cb;
            }
        };

        /*
         *  Dispatches the specified event object to the bus
         *
         *  @param busName bus to dispatch to
         *  @param eventObj the Event Object
         *
         *
         */
        Events.dispatch = function(busName,eventObj) {
            var req = { type: 'request', method: 'dispatch', params: {} };
            req.params.name = busName;

            eventObj.timestamp = Date.now();

            req.params.eventObj = eventObj;

            parent.postMessage(req,'*');
        }

        /*
         *  Constructor function for an event bus
         *
         *  @param name of the Event Bus
         *
         *  @private (to be used internally by the module)
         *
         *
         */
        var EventBus = function(name) {
            this.name = name;

            // This object stores the subscriber list per type of event
            var subscribers = {};

            /*
             *  Adds a listener for an specific event type to the subscriber list
             *
             *  @param eventType type of event '*' for any event
             *  @param cb Callbacl
             *
             *  @private
             *
             */
            function addListener(eventType,cb) {
                var list = subscribers[eventType];
                if(typeof list === 'undefined') {
                    list = [];
                    subscribers[eventType] = list;
                }

                list.push(cb);
            }

            /*
             *  Distributes an event Object to all the subscribers
             *
             *  @param type of event
             *  @param eventObj the event Object
             *
             *  @private
             *
             */
            function distributeEvent(type,eventObj) {
                var list = subscribers[type];

                if(typeof list !== 'undefined') {
                    var total = list.length;

                    window.console.log('List of subscribers: ' + total);

                    for(var c = 0; c < total; c++) {
                        var target = list[c];

                        var msg = {type:'eventObj',data:eventObj};
                        target.postMessage(msg,'*');
                    }
                }
            }

            /*
             *  Subscribes to a target to an event Type
             *
             *  @param eventType
             *  @param target the target to be subscribed
             *
             *
             */
            this.subscribe = function(eventType,target) {
                addListener(eventType,target);
            }

            /*
             *   Dispatches an event Object to all the subscribers
             *
             *   The subscribers that will be notified will depend on the type
             *   attribute of the event Object
             *
             *   @param event Object to be dispatched
             *
             */
            this.dispatch = function(eventObj) {
                // According to type we distribute the event
                // For those listeners for events of any type

                distributeEvent('*',eventObj);
                distributeEvent(eventObj.type,eventObj);
            }
        };
    })();
}
