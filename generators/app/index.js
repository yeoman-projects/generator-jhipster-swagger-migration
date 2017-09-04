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

        for(definition in swaggerDoc.definitions){
           if(definition.substring(0, 10) !== "Collection" && swaggerDoc.definitions[definition].type !== "array"){
                var entity = {
                   "fluentMethods": true,
                   "changelogDate": "20170510113832",
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
           }
        }
    },

    install() {
        let logMsg =
            `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;

        if (this.clientFramework === 'angular1') {
            logMsg =
                `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install & bower install`)}`;
        }
        const injectDependenciesAndConstants = (err) => {
            if (err) {
                this.warning('Install of dependencies failed!');
                this.log(logMsg);
            } else if (this.clientFramework === 'angular1') {
                this.spawnCommand('gulp', ['install']);
            }
        };
        const installConfig = {
            bower: this.clientFramework === 'angular1',
            npm: this.clientPackageManager !== 'yarn',
            yarn: this.clientPackageManager === 'yarn',
            callback: injectDependenciesAndConstants
        };
        this.installDependencies(installConfig);
    },

    end() {
        this.log('End of fortune generator');
    }
});
