const chalk = require('chalk');
const packagejs = require('../../package.json');
const semver = require('semver');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
        this.argument('swaggerFile', { type: String, required: true });
        this.swaggerFile = this.options.swaggerFile;
    }
    get initializing() {
        return {
            readConfig() {
                this.jhipsterAppConfig = this.getJhipsterAppConfig();
                if (!this.jhipsterAppConfig) {
                    this.error('Can\'t read .yo-rc.json');
                }
            },
            displayLogo() {
                // it's here to show that you can use functions from generator-jhipster
                // this function is in: generator-jhipster/generators/generator-base.js
                this.printJHipsterLogo();

                // Have Yeoman greet the user.
                this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster swagger-migration')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
            },
            checkJhipster() {
                const currentJhipsterVersion = this.jhipsterAppConfig.jhipsterVersion;
                const minimumJhipsterVersion = packagejs.dependencies['generator-jhipster'];
                if (!semver.satisfies(currentJhipsterVersion, minimumJhipsterVersion)) {
                    this.warning(`\nYour generated project used an old JHipster version (${currentJhipsterVersion})... you need at least (${minimumJhipsterVersion})\n`);
                }
            }
        };
    }

    prompting() {

    }

    writing() {
        // function to use directly template
        this.template = function (source, destination) {
            this.fs.copyTpl(
                this.templatePath(source),
                this.destinationPath(destination),
                this
            );
        };

        // read config from .yo-rc.json
        this.baseName = this.jhipsterAppConfig.baseName;
        this.packageName = this.jhipsterAppConfig.packageName;
        this.packageFolder = this.jhipsterAppConfig.packageFolder;
        this.clientFramework = this.jhipsterAppConfig.clientFramework;
        this.clientPackageManager = this.jhipsterAppConfig.clientPackageManager;
        this.buildTool = this.jhipsterAppConfig.buildTool;
        this.entities = [];
        this.swaggerDefinition = this.fs.readJSON(this.swaggerFile);

        for(var definition in this.swaggerDefinition.definitions){
           if(definition.substring(0, 10) !== "Collection" && this.swaggerDefinition.definitions[definition].type !== "array"){
                var entity = {
                   "fluentMethods": true,
                   "changelogDate": jhipsterConstants.dateFormatForLiquibase,
                   "dto": "no",
                   "service": "serviceClass",
                   "entityTableName": definition,
                   "pagination": "no",
                   "jpaMetamodelFiltering": "no"
               };

               entity.fields = [];
               entity.relationships = [];

               for(var propertyKey in this.swaggerDefinition.definitions[definition].properties){
                    if(this.swaggerDefinition.definitions[definition].properties[propertyKey].type === 'object'){
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
                           "fieldType": this.swaggerDefinition.definitions[definition].properties[propertyKey].type
                        });
                    }
               }
               this.fs.writeJSON(this.destinationPath('.jhipster/' + definition + '.json'), entity);
               this.entities.push(definition);
           }
        }
    }

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
    }

    end() {
        this.log('End of swagger-migration generator');
    }
};
