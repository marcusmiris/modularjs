ModularJS
=========

A JavaScript local module loader (a.k.a without xhr) using AMD format.


How To Use
----------
Example:

    (function(define, require) {

        // e.g. define a module without dependencies
        define('firstName', function() {
            return 'Steve';
        });

        // e.g. define a module with dependencies
        define('fullName', ['firstName'], function(firstName) {
            return firstName + ' Jobs';
        });

        // e.g. register a callback that will be triggered when its dependencies are defined.
        require(['firstName', 'fullName'], function(firstName, fullName) {
            console.log('First Name: ' + firstName);
            console.log('Full Name: ' + fullName);
        });
        
        // you can also avoid injectable arguments on register callbacks, like this:
        require(['fullName'], function() {
            console.log('Full Name Again: ' + require('fullName'));
        });

    })(modularjs.define, modularjs.require)
    
Result in console:

    First Name: Steve
    Full Name: Steve Jobs
    Full Name Again: Steve Jobs 
