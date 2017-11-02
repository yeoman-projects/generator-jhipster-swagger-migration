const chalk = require('chalk');
const generator = require('yeoman-generator');
const packagejs = require('../../package.json');
const swaggerDoc = require('./sample.json');

// Stores JHipster variables
const jhipsterVar = { moduleName: 'fortune' };

// Stores JHipster functions
const jhipsterFunc = {};

module.exports = generator.extend({

    initializing: {
        compose() {
            this.composeWith('jhipster:modules',
                { jhipsterVar, jhipsterFunc },
                this.options.testmode ? { local: require.resolve('generator-jhipster/generators/modules') } : null
            );
        },
        displayLogo() {
            // Have Yeoman greet the user.
            this.log(`Welcome to the ${chalk.bold.yellow('JHipster fortune')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
        }
    },

    prompting() {
        const done = this.async();

        done();
    },

    writing() {
        // function to use directly template
        this.template = function (source, destination) {
            this.fs.copyTpl(
                this.templatePath(source),
                this.destinationPath(destination),
                this
            );
        };

        this.baseName = jhipsterVar.baseName;
        this.packageName = jhipsterVar.packageName;
        this.packageFolder = jhipsterVar.packageFolder;
        this.angularAppName = jhipsterVar.angularAppName;
        this.clientFramework = jhipsterVar.clientFramework;
        this.clientPackageManager = jhipsterVar.clientPackageManager;
        const javaDir = jhipsterVar.javaDir;
        const resourceDir = jhipsterVar.resourceDir;
        const webappDir = jhipsterVar.webappDir;
        const changelogDate = "20170510113832";
        var count = 1;
        this.entities = [];

        for(definition in swaggerDoc.definitions){
           if(definition.substring(0, 10) !== "Collection" && swaggerDoc.definitions[definition].type !== "array"){
                var entity = {
                   "fluentMethods": true,
                   "changelogDate": changelogDate + "-" + count,
                   "dto": "no",
                   "service": "serviceClass",
                   "entityTableName": definition,
                   "pagination": "no"
               };

               entity.fields = [];
               entity.relationships = [];

               for(propertyKey in swaggerDoc.definitions[definition].properties){
                    if(swaggerDoc.definitions[definition].properties[propertyKey].type === 'object'){
                        entity.relationships.push({
                           "relationshipName": propertyKey,
                           "otherEntityName": propertyKey,
                           "relationshipType": "one-to-many",
                           "otherEntityField": propertyKey + "_id",
                           "ownerSide": true,
                           "otherEntityRelationshipName": definition
                        });
                    }else{
                        entity.fields.push({
                           "fieldName": propertyKey,
                           "fieldType": swaggerDoc.definitions[definition].properties[propertyKey].type
                        });
                    }
               }
               this.fs.writeJSON(this.destinationPath('.jhipster/' + definition + '.json'), entity);
               this.entities.push(definition);
                count++;
           }
        }
    },
    install() {
        for(var i=0; i < this.entities.length; i++){
            this.composeWith('jhipster:entity', {
                   regenerate: true,
                   'skip-install': true,
                   'skip-client': false,
                   'skip-server': false,
                   'no-fluent-methods': false,
                   'skip-user-management': false,
                   arguments: [this.entities[i]],
             });
        }
    },
    end() {
        this.log('End of generator');
    }
});
