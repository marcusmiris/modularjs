var modularjs, require, define;
(function() {

    //Do not overwrite an existing modularjs instance.
    if (typeof modularjs == 'function') return;


    modularjs = (function() {

        var modules = {};       // os módulos são os definidos através do método 'define'.
        var callbacks = [];     // os callbacks são os callbacks dos requires (e.g. "require([], callback)").

        
        // Determina se um módulo está definido.
        var isDefined = function(moduleName) {
          return !!modules[moduleName];
        }

        // Determina se todos os módulos informados estão carregados.
        var areAllTheseModulesLoaded = function(moduleNames) {
            for(var i = 0; i < moduleNames.length; i++) {
                var moduleName = moduleNames[i];
                if (!isDefined(moduleName)) return false;
                if (!modules[moduleName].loaded) return false; 
            }
            return true;
        };
        
        // Executa uma função, injetando as dependencias.
        var runFuncInjectingDeps = function(func, deps) {
          var injection = [];

          deps.forEach(function(moduleName) {
            injection.push(require(moduleName));
          });

          return func.apply(this, injection);
        }

        // carrega um módulo
        var loadModule = function(moduleName) { 
          var module = modules[moduleName];
          module.exports = runFuncInjectingDeps(module.factory, module.deps);
          module.loaded = true;
        };

        // Tenta carregar os módulos definidos.
        var tryLoadModules = function() {
            do {
                var loadedModules = 0;

                for(id in modules) {
                    var module = modules[id];

                    if (!module.loaded && areAllTheseModulesLoaded(module.deps)) {
                        loadModule(id); 
                        loadedModules++;
                    }
                };
            } 
            while(loadedModules != 0);
        };

        // Tenta executar um callback (caso suas dependências estejam carregadas).
        var tryRunCallback = function(callback) {
            if (callback.ran) return;

            if (areAllTheseModulesLoaded(callback.deps)) {
                // necessário marcar o callback com executado antes de executá-lo, para 
                // mitigar a possibilidade desse callback estar registrando um segundo callback,
                // e o registro do segundo callback executar novamente o primeiro no callstack.
                callback.ran = true;
                runFuncInjectingDeps(callback.func, callback.deps);
            };
        };

        var define = function(moduleName, deps, factory) {
            
            if (isDefined(moduleName)) 
                throw "Módulo já definido: '" + moduleName + "'";

            var overloadSemInjecaoDeDependencia = typeof deps == 'function';
            if (overloadSemInjecaoDeDependencia) {
                factory = deps;
                deps = [];
            };

            modules[moduleName] = {
                deps: deps,
                factory: factory,
                exports: null,
            };

            tryLoadModules();
            callbacks.forEach(tryRunCallback);
        };

        var require = function(dependency, callback) {

            if (!dependency) throw 'Dependência não informada';

            // resolve sync require (e.g. "var x = require('id');")
            if (!callback) {
                if (typeof dependency != 'string') throw 'nome do módulo deve ser uma string';
                var moduleName = dependency;
                var module = modules[moduleName];

                if (!module) throw 'Não foi possível recuperar o módulo pois o mesmo não foi definido.';
                if (!module.loaded) throw 'Não foi possível recuperar o módulo pois o mesmo não foi carregado.';
                return module.exports;
                //return module ? module.exports : null; 
            };

            // resolve callback register.
            if (!Array.isArray(dependency)) dependency = [dependency];
            var callback = {
                deps: dependency,
                func: callback,
                ran: false,
            };
          
            tryRunCallback(callback);
            if (!callback.ran) callbacks.push(callback);
        };

        return {
            isDefined: isDefined,
            define: define,
            require: require,
            
        };

    })();

    
    //if (!require) require = modularjs.require;  // Export require as a global, but only if it does not already exist.
    //if (!define) define = modularjs.define;     // Export define as a global, but only if it does not already exist.

})(this);