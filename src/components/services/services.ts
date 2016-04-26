
import {PathResolver} from "./pathresolver/jsonforms-pathresolver";
import {IUISchemaElement} from '../../jsonforms';
// TODO: replace
let tv4 = require("tv4");

// TODO: remove
class HashTable {

    private hashes;

    constructor() {
        this.hashes = {}
    }

    put(key, value) {
        this.hashes[JSON.stringify(key)] = value;
    }

    get(key) {
        return this.hashes[JSON.stringify(key)];
    }
}

export class Services {

    private services: any = {};

    add(service: IService): void {
        this.services[service.getId()] = service;
    }

    get<T extends IService>(serviceId: ServiceId): T {
        return this.services[serviceId];
    }

}
export class ScopeProvider implements IScopeProvider {
    constructor(private scope: ng.IScope) { }

    getId(): ServiceId {
        return ServiceId.ScopeProvider;
    }

    getScope(): ng.IScope {
        return this.scope;
    }
}
export class PathResolverService implements IPathResolverService {

    constructor(private resolver: PathResolver) { }

    getId(): ServiceId {
        return ServiceId.PathResolver;
    }

    getResolver() {
        return this.resolver;
    }
}
export class SchemaProvider implements ISchemaProvider {
    constructor(private schema: SchemaElement) {

    }

    getId(): ServiceId {
        return ServiceId.SchemaProvider;
    }

    getSchema():SchemaElement {
        return this.schema;
    }
}
export class ValidationService implements IValidationService {

    private validationResults = new HashTable();

    getId(): ServiceId {
        return ServiceId.Validation;
    }

    getResult(instance: any, dataPath: string): any {
        if (this.validationResults.get(instance) == undefined) {
            return undefined;
        } else {
            return this.validationResults.get(instance)[dataPath];
        }
    }

    private convertAllDates(instance): void {
        for(var prop in instance) {
            if(instance.hasOwnProperty(prop)){
                if (instance[prop] instanceof Date) {
                    instance[prop] = instance[prop].toString();
                } else if (instance[prop] instanceof Object){
                    this.convertAllDates(instance[prop]);
                }
            }
        }
    }

    validate(instance: any, schema: SchemaElement): void {

        if (tv4 == undefined) {
            return;
        }

        this.clear(instance);
        this.convertAllDates(instance);
        // TODO
        let results = tv4.validateMultiple(instance, schema);

        results['errors'].forEach((error) => {
            if (error['schemaPath'].indexOf("required") != -1) {
                var propName = error['dataPath'] + "/" + error['params']['key'];
                this.validationResults.get(instance)[propName] = "Required";
            } else {
                this.validationResults.get(instance)[error['dataPath']] = error['message'];
            }
        });
    }

    private clear(instance: any) { this.validationResults.put(instance, {}); }
}

export enum ServiceId {
    Validation,
    DataProvider,
    SchemaProvider,
    ScopeProvider,
    RuleService,
    PathResolver
}

export interface IService {
    getId(): ServiceId
}
export interface IPathResolverService extends IService{
    getResolver(): PathResolver
}
export interface IScopeProvider extends IService {
    getScope(): ng.IScope
}
export interface IUiSchemaProvider extends IService {
    getUiSchema(): IUISchemaElement
}
export interface ISchemaProvider extends IService {
    getSchema(): SchemaElement
}
export interface IValidationService extends IService {
    getResult(instance: any, dataPath: string): any
    validate(instance: any, schema: SchemaElement): void
}
