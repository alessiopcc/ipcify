import * as fs from 'fs-extra';
import handlebars from 'handlebars';
import * as os from 'os';
import Project, {
    ClassDeclaration,
    ConstructorDeclaration,
    createWrappedNode,
    InterfaceDeclaration,
    MethodDeclaration,
    Scope,
    ts,
} from 'ts-simple-ast';
import {ScriptTarget, SyntaxKind} from 'typescript';
import * as path from 'upath';

const ipc_module_name = require('../package.json').name;

// TODO: parse declaration of __invoke__

// TODO: default export management
// TODO: class wih same name management
// TODO: interface wih same name management
// TODO: duplicate imports management
// TODO: duplicate events management (and name replacements)
// TODO: duplicate invoke with events management
// TODO: events from stub to class
// TODO: remove unused code (events if not used, etc...)
// TODO: general on and once declaration on stub only if needed

interface ClassThread
{
    path: string;
    constructable: boolean,
    constructor: ts.ConstructorDeclaration | null,
    creator: ts.MethodDeclaration | null,
    methods: ts.MethodDeclaration[];
}

class IPCify
{
    private static _file_imports: {[path: string]: string[]} = {};
    private static _imports: {[name: string]: string} = {};
    private static _classes: {[name: string]: ClassThread} = {};
    private static _events: {[name: string]: string[]} = {};
    private static _interfaces: {[name: string]: ts.InterfaceDeclaration} = {};
    private static _invokes: {[name: string]: string[]} = {};

    public static parse(node: ts.Node): void
    {
        switch(node.kind)
        {
            case SyntaxKind.ImportDeclaration:
                this._import_declaration(node as ts.ImportDeclaration);
                break;
            case SyntaxKind.Decorator:
                this._decorator(node as ts.Decorator);
                break;
            case SyntaxKind.Constructor:
                this._constructor(node as ts.ConstructorDeclaration);
                break;
            default:
                ts.forEachChild(node, (child) => this.parse(child));
        }
    }

    private static _import_declaration(node: ts.ImportDeclaration): void
    {
        if((node.moduleSpecifier as any).text.startsWith(ipc_module_name))
        {
            if(!node.importClause || !node.importClause.namedBindings || !ts.isNamedImports(node.importClause.namedBindings))
                return;

            node.importClause.namedBindings.elements.forEach((element) =>
            {
                if(element.propertyName)
                    this._imports[element.name.text] = element.propertyName.text;
                else
                    this._imports[element.name.text] = element.name.text;
            })

            console.log('Import:', this._imports)
        }
        else
        {
            const source_file = node.getSourceFile().fileName
            if(!this._file_imports[source_file])
                this._file_imports[source_file] = [];
            this._file_imports[source_file].push(node.getText());
        }
    }

    private static _constructor(node: ts.ConstructorDeclaration): void
    {
        if(node.parent && ts.isClassDeclaration(node.parent) && node.parent.name)
        {
            const class_name = node.parent.name.getText();
            const executable = this._classes[class_name];
            if(!executable)
                return;

            if(node.modifiers)
            {
                for(const modifier of node.modifiers)
                {
                    switch(modifier.kind)
                    {
                        case SyntaxKind.ProtectedKeyword:
                        case SyntaxKind.PrivateKeyword:
                            executable.constructable = false;
                    }
                }
            }

            executable.constructor = node;
            console.log('Constructor:', class_name);
        }
        else
            throw new Error(`Decorator @Executable parse error, ${node}`)
    }

    private static _decorator(node: ts.Decorator): void
    {
        const token = node.expression.getFirstToken() || node.expression;
        const decorator = this._imports[token.getText()];
        if(decorator)
        {
            switch(decorator)
            {
                case 'Executable':
                    if(node.parent && ts.isClassDeclaration(node.parent) && node.parent.name)
                    {
                        const class_name = node.parent.name.getText();
                        this._classes[class_name] = {
                            path: node.getSourceFile().fileName,
                            constructable: true,
                            constructor: null,
                            creator: null,
                            methods: []
                        };
                        console.log('Class:', class_name);
                    }
                    else
                        throw new Error(`Decorator @Executable parse error, ${node}`)
                    break;

                case 'execit':
                    if(node.parent && ts.isMethodDeclaration(node.parent) && node.parent.name && node.parent.parent && ts.isClassDeclaration(node.parent.parent) && node.parent.parent.name)
                    {
                        const class_name = node.parent.parent.name.getText();
                        const executable = this._classes[class_name];
                        if(!executable)
                            throw new Error('@execit decorator can be used only in @Executable classes');

                        if(node.parent.modifiers)
                        {
                            for(const modifier of node.parent.modifiers)
                            {
                                switch(modifier.kind)
                                {
                                    case SyntaxKind.ProtectedKeyword:
                                    case SyntaxKind.PrivateKeyword:
                                        throw new Error('@execit can be applied only to public methods');
                                }
                            }
                        }
                        executable.methods.push(node.parent);
                        console.log('Method:', node.parent.name.getText(), ' - Class', class_name);
                    }
                    else
                        throw new Error(`Decorator @execit parse error, ${node}`)
                    break;

                case 'execnew':
                    if(node.parent && ts.isMethodDeclaration(node.parent) && node.parent.name && node.parent.parent && ts.isClassDeclaration(node.parent.parent) && node.parent.parent.name)
                    {
                        const class_name = node.parent.parent.name.getText();
                        const executable = this._classes[class_name];
                        if(!executable)
                            throw new Error('@execnew decorator can be used only in @Executable classes');

                        let static_method = false
                        if(node.parent.modifiers)
                        {
                            for(const modifier of node.parent.modifiers)
                            {
                                switch(modifier.kind)
                                {
                                    case SyntaxKind.StaticKeyword:
                                        static_method = true;
                                        break;
                                    case SyntaxKind.ProtectedKeyword:
                                    case SyntaxKind.PrivateKeyword:
                                        throw new Error('@execnew can be applied only to public methods');
                                }
                            }
                        }
                        if(!static_method)
                            throw new Error('@execnew can be applied only to static methods');

                        executable.creator = node.parent;
                        console.log('Creator:', node.parent.name.getText(), ' - Class', class_name);
                    }
                    else
                        throw new Error(`Decorator @execnew parse error, ${node}`)
                    break;

                case 'execemit':
                    if(node.parent && ts.isInterfaceDeclaration(node.parent) && node.parent.name && node.parent.modifiers)
                    {
                        if(ts.isCallExpression(node.expression) && node.expression.arguments.length === 1 && ts.isArrayLiteralExpression(node.expression.arguments[0]))
                        {
                            const class_name = node.parent.name.getText();
                            this._interfaces[class_name] = node.parent;
                            if(!this._events[class_name])
                                this._events[class_name] = [];

                            const array = node.expression.arguments[0] as ts.ArrayLiteralExpression;
                            for(const token of array.elements)
                            {
                                if(ts.isStringLiteral(token))
                                    this._events[class_name].push(token.text);
                                else
                                    throw new Error('@execemit only supports string literal');
                            }

                            console.log('Events:', this._events[class_name], '- Class', class_name);
                        }
                    }
                    else
                        throw new Error(`Decorator @execemit parse error, ${node}`)
                    break;

                case 'execinvoke':
                    if(node.parent && (ts.isInterfaceDeclaration(node.parent) || ts.isClassDeclaration(node.parent)) && node.parent.name && node.parent.modifiers)
                    {
                        if(ts.isCallExpression(node.expression) && node.expression.arguments.length === 1 && ts.isArrayLiteralExpression(node.expression.arguments[0]))
                        {
                            const class_name = node.parent.name.getText();
                            if(!this._invokes[class_name])
                                this._invokes[class_name] = [];

                            const array = node.expression.arguments[0] as ts.ArrayLiteralExpression;
                            for(const token of array.elements)
                            {
                                if(ts.isStringLiteral(token))
                                    this._invokes[class_name].push(token.text);
                                else
                                    throw new Error('@execinvoke only supports string literal');
                            }

                            console.log('Invoke:', this._invokes[class_name], '- Class', class_name);
                        }
                    }
                    else
                        throw new Error(`Decorator @execinvoke parse error, ${node}`)
                    break;
            }
        }
    }

    public static save(template: Template)
    {
        fs.emptyDirSync(path.resolve(out));

        if(!Object.keys(this._classes))
            return;

        const project = new Project();

        const template_path = path.resolve(__dirname, 'template', template);
        const ipc_name = 'IPC.ts';
        const ipc_class_name = 'IPC'
        const router_name = 'Router.ts';

        const ipc_imports = [] as any
        const ipc_stubs = [] as any;
        const ipc_get_accessors = [] as any;

        const router_imports = [] as any[];
        const router_cases_data = [] as any[];

        let save = false;
        for(const class_name in this._classes)
        {
            if(!this._classes[class_name].methods.length)
                continue;
            save = true;

            const stub_class_name = `${class_name}Stub`;
            const skeleton_class_name = `${class_name}Skeleton`;

            ipc_imports.push({moduleSpecifier: `./stub/${stub_class_name}`, namedImports: [`${stub_class_name}`]});

            router_imports.push({moduleSpecifier: `./skeleton/${skeleton_class_name}`, namedImports: [`${skeleton_class_name}`]});

            const ipc_stub_property_name = class_name.toLowerCase()
            ipc_stubs.push(`${class_name}: new ${stub_class_name}(this)`);
            ipc_get_accessors.push({
                name: ipc_stub_property_name,
                bodyText: `return this._stubs['${ipc_stub_property_name}'];`,
                scope: Scope.Public
            })

            const stub_template = require(path.resolve(template_path, 'stub.js'));
            const stub_source_data = {
                class_name: stub_class_name,
                // events: stub_event_signatures.join(os.EOL)
            }
            const stub_source_compiled = handlebars.compile(stub_template.source.trim())(stub_source_data);

            const skeleton_template = require(path.resolve(template_path, 'skeleton.js'));
            const skeleton_source_data = {
                class_name: skeleton_class_name
            }
            const skeleton_source_compiled = handlebars.compile(skeleton_template.source.trim())(skeleton_source_data);

            const stub = project.createSourceFile(path.resolve(out, 'stub', `${stub_class_name}.ts`), stub_source_compiled);
            const skeleton = project.createSourceFile(path.resolve(out, 'skeleton', `${skeleton_class_name}.ts`), skeleton_source_compiled);

            if(this._file_imports[this._classes[class_name].path])
            {
                // TODO: remove unused
                for(const imports of this._file_imports[this._classes[class_name].path])
                    stub.insertText(0, `// @ts-ignore${os.EOL}${imports}${os.EOL}`)
            }
            const skeleton_class_import_path = path.relative(path.resolve(out, 'skeleton'), this._classes[class_name].path).split('.').slice(0, -1).join('.');
            skeleton.addImportDeclaration({moduleSpecifier: skeleton_class_import_path, namedImports: [class_name]});

            skeleton.addStatements(`(${class_name} as any).__router__ = require('../${router_name}').Router`);

            const stub_class = stub.getClass(stub_class_name) as ClassDeclaration;
            const skeleton_class = skeleton.getClass(skeleton_class_name) as ClassDeclaration;

            const skeleton_instance_property_name = `__${class_name.toLowerCase()}__`
            const skeleton_method_arg_name = 'message';

            let create_instance = false;
            let method_index = 0;
            this._classes[class_name].methods.forEach((method) =>
            {
                const wrapped_method = createWrappedNode(method) as MethodDeclaration;
                const method_name = wrapped_method.getName();
                if(!wrapped_method.isStatic())
                    create_instance = true;

                const message_type = `${class_name.toLowerCase()}-${method_name.toLowerCase()}`;

                router_cases_data.push({type: message_type, skeleton: skeleton_class_name, method: method_name})

                let return_type = method.type ? method.type.getText() : undefined;
                // TODO: bluebird (etc...) management
                if(return_type && !return_type.startsWith('Promise'))
                    return_type = `Promise<${return_type}>`;

                const stub_method = stub_class.insertMethod(method_index, {
                    name: method_name,
                    isAsync: true,
                    returnType: return_type,
                    scope: Scope.Public
                });

                const skeleton_method = skeleton_class.insertMethod(method_index, {
                    name: method_name,
                    isStatic: true,
                    isAsync: true,
                    scope: Scope.Public,
                    parameters: [{name: skeleton_method_arg_name, type: 'any'}]
                });

                const stub_method_body_parameters = [] as any;
                const skeleton_method_body_parameters = [] as any;
                method.parameters.forEach((parameter) =>
                {
                    const name = parameter.name.getText();
                    const type = parameter.type ? parameter.type.getText() : undefined;
                    const optional = parameter.questionToken ? true : false;

                    stub_method.addParameter({
                        name,
                        type,
                        hasQuestionToken: optional
                    });
                    stub_method_body_parameters.push(`${name}`);
                    skeleton_method_body_parameters.push(`${skeleton_method_arg_name}.${name}`);
                });

                const stub_method_body_data = {
                    message_type,
                    parameters: stub_method_body_parameters.join(', ')
                };

                const skeleton_method_body_data = {
                    object: wrapped_method.isStatic() ? class_name : `this.${skeleton_instance_property_name}`,
                    method: method_name,
                    parameters: skeleton_method_body_parameters.join(', ')
                };

                const stub_method_body_compiled = handlebars.compile(stub_template.method_body.trim())(stub_method_body_data);
                const skeleton_method_body_compiled = handlebars.compile(skeleton_template.method_body.trim())(skeleton_method_body_data);
                stub_method.setBodyText(stub_method_body_compiled);
                skeleton_method.setBodyText(skeleton_method_body_compiled);

                method_index++;
            });

            if(create_instance || this._classes[class_name].creator)
            {
                if(this._classes[class_name].creator || this._classes[class_name].constructable)
                {
                    let wrapped_creator: ConstructorDeclaration | MethodDeclaration | undefined;
                    let name = '__create__';
                    let create = `new ${class_name}`;

                    if(this._classes[class_name].creator)
                    {
                        wrapped_creator = createWrappedNode(this._classes[class_name].creator as ts.MethodDeclaration) as MethodDeclaration;
                        name = wrapped_creator.getName()
                        create = `${class_name}.${name}`
                    }
                    else if(this._classes[class_name].constructor)
                        wrapped_creator = createWrappedNode(this._classes[class_name].constructor as ts.ConstructorDeclaration) as ConstructorDeclaration;

                    const skeleton_creator = skeleton_class.insertMethod(method_index, {
                        name,
                        isStatic: true,
                        isAsync: true,
                        scope: Scope.Public,
                        parameters: [{name: skeleton_method_arg_name, type: 'any'}]
                    });

                    const skeleton_creator_body_parameters = [] as any;
                    if(wrapped_creator)
                        wrapped_creator.getParameters().forEach((parameter) => skeleton_creator_body_parameters.push(`${skeleton_method_arg_name}.${parameter.getName()}`));

                    const skeleton_creator_events = [] as any;

                    if(this._events[class_name])
                    {
                        const stub_interface = stub.getInterface(stub_class_name) as InterfaceDeclaration;
                        const wrapped_interface = createWrappedNode(this._interfaces[class_name]) as InterfaceDeclaration;

                        for(const event of this._events[class_name])
                        {
                            const event_listener_name = `_on_${event.replace(/[^A-Z0-9]/ig, '_')}`;
                            skeleton_creator_events.push(`// @ts-ignore${os.EOL}this.${skeleton_instance_property_name}.on('${event}', this.${event_listener_name})`);

                            const event_listener_method = skeleton_class.addMethod({
                                name: event_listener_name,
                                scope: Scope.Private,
                                isStatic: true,
                                parameters: [{name: 'data', type: 'any[]', isRestParameter: true}]
                            })
                            const event_listener_body_data = {
                                source: class_name,
                                event
                            }
                            const event_listener_body_compiled = handlebars.compile(skeleton_template.event_listener_body.trim())(event_listener_body_data);
                            event_listener_method.setBodyText(event_listener_body_compiled);

                            const whole_event_regex = new RegExp(`(<=\\s|\\b)${event}(\\b|\\s|$)`);
                            const stub_interface_insert_position = stub_interface.getMembers()[0].getStart();
                            for(const member of wrapped_interface.getMembers())
                            {
                                const signature = member.print();
                                if(signature.match(whole_event_regex))
                                    stub_interface.insertText(stub_interface_insert_position, `${signature}${os.EOL}`);
                            }
                        }
                    }

                    const skeleton_creator_body_data = {
                        object: skeleton_instance_property_name,
                        create,
                        parameters: skeleton_creator_body_parameters.join(', '),
                        events: skeleton_creator_events.join(`; ${os.EOL}`)
                    };
                    const skeleton_method_body_compiled = handlebars.compile(skeleton_template.creator_body.trim())(skeleton_creator_body_data);
                    skeleton_creator.setBodyText(skeleton_method_body_compiled);
                }
                else
                    throw new Error(`${class_name} require an instance but is not constructable`);

                skeleton_class.addProperty({
                    name: skeleton_instance_property_name,
                    type: class_name,
                    isStatic: true,
                    scope: Scope.Private,
                });
            }

            if(this._invokes[class_name])
            {
                for(const invoke of this._invokes[class_name])
                {
                    const listener_name = `listen_${invoke.replace(/[^A-Z0-9]/ig, '_')}`;

                    // TODO: types!

                    const listener_method = stub_class.addMethod({
                        name: listener_name,
                        scope: Scope.Public,
                        parameters: [{name: 'listener', type: '(...data: any[]) => void'}]
                    })
                    const listener_body_data = {
                        method: invoke
                    }
                    const listener_body_compiled = handlebars.compile(stub_template.listener_body.trim())(listener_body_data);
                    listener_method.setBodyText(listener_body_compiled);
                }
            }
        }

        const ipc_template = require(path.resolve(template_path, 'ipc.js'));
        const ipc_source_data = {
            ipc_class_name,
            exec_path: `./${router_name}`,
            stubs: ipc_stubs.join(`, ${os.EOL}`)
        }
        const ipc_source_compiled = handlebars.compile(ipc_template.source.trim())(ipc_source_data);
        const ipc = project.createSourceFile(path.resolve(out, ipc_name), ipc_source_compiled);
        for(const ipc_import of ipc_imports)
            ipc.addImportDeclaration(ipc_import);
        const ipc_class = ipc.getClass(ipc_class_name) as ClassDeclaration;
        for(const ipc_get_accessor of ipc_get_accessors)
            ipc_class.addGetAccessor(ipc_get_accessor);

        const router_template = require(path.resolve(template_path, 'router.js'));
        const router_source_data = {
            module_name,
            cases: [] as any
        }
        for(const router_case_data of router_cases_data)
            router_source_data.cases.push(handlebars.compile(router_template.case.trim())(router_case_data));
        router_source_data.cases = router_source_data.cases.join(os.EOL);
        const router_source_compiled = handlebars.compile(router_template.source.trim())(router_source_data);
        const router = project.createSourceFile(path.resolve(out, router_name), router_source_compiled);
        for(const router_import of router_imports)
            router.addImportDeclaration(router_import);

        if(save)
        {
            for(const file of project.getSourceFiles())
            {
                file.formatText();
                file.insertText(0, `/** This file is autogenerated. Do not edit */${os.EOL}`);
                file.insertText(0, `// @ts-nocheck${os.EOL}`);
                file.insertText(0, `// tslint:disable${os.EOL}`);
            }
            project.saveSync();
        }
    }
}

export declare type Template = 'worker';
const module_name = process.argv.slice(2, 3)[0];
const template = process.argv.slice(3, 4)[0] as Template;
const out = process.argv.slice(4, 5)[0];
const files = process.argv.slice(5);
files.forEach(file =>
{
    let source = ts.createSourceFile(file, fs.readFileSync(file).toString(), ScriptTarget.ES2015, true);
    IPCify.parse(source);
});

IPCify.save(template);
