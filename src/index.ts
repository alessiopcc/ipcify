import * as fs from 'fs-extra';
import handlebars from 'handlebars';
import * as path from 'upath';
import Project, {ClassDeclaration, createWrappedNode, MethodDeclaration, Scope, ts} from 'ts-simple-ast';
import {ScriptTarget, SyntaxKind} from 'typescript';

const ipc_module_name = require('../package.json').name;

// TODO: default export and class wih same name management
export interface ClassThread
{
    path: string;
    constructable: boolean,
    constructor: ts.ConstructorDeclaration | null,
    creator: ts.MethodDeclaration | null,
    methods: ts.MethodDeclaration[];
}

export class IPCify
{
    private static _imports: {[name: string]: string} = {};
    private static _classes: {[name: string]: ClassThread} = {};

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
                console.log(ts.isConstructorDeclaration(node))
                this._constructor(node as ts.ConstructorDeclaration);
                break;
            default:
                ts.forEachChild(node, (child) => this.parse(child));
        }
    }

    private static _import_declaration(node: ts.ImportDeclaration): void
    {
        if((node.moduleSpecifier as any).text === ipc_module_name)
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
                case('Executable'):
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

                case('execit'):
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

                case('execnew'):
                    if(node.parent && ts.isMethodDeclaration(node.parent) && node.parent.name && node.parent.parent && ts.isClassDeclaration(node.parent.parent) && node.parent.parent.name)
                    {
                        const class_name = node.parent.parent.name.getText();
                        const executable = this._classes[class_name];
                        if(!executable)
                            throw new Error('@execnew decorator can be used only in @Executable classes');

                        if(node.parent.modifiers)
                        {
                            for(const modifier of node.parent.modifiers)
                            {
                                switch(modifier.kind)
                                {
                                    case SyntaxKind.ProtectedKeyword:
                                    case SyntaxKind.PrivateKeyword:
                                        throw new Error('@execnew can be applied only to public methods');
                                }
                            }
                        }
                        executable.creator = node.parent;
                        console.log('Creator:', node.parent.name.getText(), ' - Class', class_name);
                    }
                    else
                        throw new Error(`Decorator @execnew parse error, ${node}`)
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
        const router_name = 'Router.ts';

        const ipc_template = require(path.resolve(template_path, 'ipc.js'));
        const ipc_source_data = {
            exec_path: `./${router_name}`
        }
        const ipc_source_compiled = handlebars.compile(ipc_template.source.trim())(ipc_source_data);
        const ipc = project.createSourceFile(path.resolve(out, ipc_name), ipc_source_compiled);

        const router_template = require(path.resolve(template_path, 'router.js'));
        const router_source_data = {
            module_name
        }
        const router_source_compiled = handlebars.compile(router_template.source.trim())(router_source_data);
        const router = project.createSourceFile(path.resolve(out, router_name), router_source_compiled);

        let save = false;
        for(const class_name in this._classes)
        {
            if(!this._classes[class_name].methods.length)
                continue;
            save = true;

            const stub_class_name = `${class_name}Stub`;
            const skeleton_class_name = `${class_name}Skeleton`;

            ipc.addImportDeclaration({moduleSpecifier: `./stub/${stub_class_name}`, namedImports: [`${stub_class_name}`]});
            router.addImportDeclaration({moduleSpecifier: `./skeleton/${skeleton_class_name}`, namedImports: [`${skeleton_class_name}`]});

            const skeleton_template = require(path.resolve(template_path, 'skeleton.js'));
            const skeleton_source_data = {
                class_name: skeleton_class_name
            }
            const skeleton_source_compiled = handlebars.compile(skeleton_template.source.trim())(skeleton_source_data);

            const stub = project.createSourceFile(path.resolve(out, 'stub', `${stub_class_name}.ts`));
            const skeleton = project.createSourceFile(path.resolve(out, 'skeleton', `${skeleton_class_name}.ts`), skeleton_source_compiled);

            const skeleton_class_import_path = path.relative(path.resolve(out, 'skeleton'), this._classes[class_name].path).split('.').slice(0, -1).join('.');
            skeleton.addImportDeclaration({moduleSpecifier: skeleton_class_import_path, namedImports: [class_name]});

            const stub_class = stub.addClass({name: stub_class_name, isExported: true});
            const skeleton_class = skeleton.getClass(skeleton_class_name) as ClassDeclaration;

            const skeleton_method_arg_name = 'message';

            let create_instance = false;
            let method_index = 0;
            this._classes[class_name].methods.forEach((method) => 
            {
                const wrapped_method = createWrappedNode(method) as MethodDeclaration;
                const return_type = method.type ? method.type.getText() : undefined;
                if(!wrapped_method.isStatic())
                    create_instance = true;
                
                const stub_method = stub_class.insertMethod(method_index, {
                    name: wrapped_method.getName(),
                    isAsync: true,
                    returnType: return_type,
                    scope: Scope.Public
                });

                const skeleton_method = skeleton_class.insertMethod(method_index, {
                    name: wrapped_method.getName(),
                    isStatic: true,
                    isAsync: true,
                    scope: Scope.Public,
                    parameters: [{name: skeleton_method_arg_name}]
                });

                const skeleton_method_body_data = {
                    object: wrapped_method.isStatic() ? class_name : `this.__${class_name.toLowerCase()}__`,
                    method: wrapped_method.getName(),
                    parameters: [] as any
                };

                method.parameters.forEach((parameter) =>
                {
                    const name = parameter.name.getText();
                    const type = parameter.type ? parameter.type.getText() : undefined;
                    
                    stub_method.addParameter({
                        name, type
                    });
                    skeleton_method_body_data.parameters.push(`${skeleton_method_arg_name}.${name}`);
                });
                skeleton_method_body_data.parameters = skeleton_method_body_data.parameters.join(', ');
                const skeleton_method_body_compiled = handlebars.compile(skeleton_template.method_body.trim())(skeleton_method_body_data);
                skeleton_method.setBodyText(skeleton_method_body_compiled);
                
                method_index++;
            });

            if(create_instance || this._classes[class_name].creator)
            {
                if(this._classes[class_name].creator)
                    console.log('generate creators');
                else if(this._classes[class_name].constructable)
                {
                    console.log('generate constructor');
                }
                else
                    throw new Error(`${class_name} require an instance but is not constructable`);
            }
        }

        if(save)
            project.save();
    }
}

export declare type Template = 'worker';
const module_name = 'TEST';
const template = process.argv.slice(2, 3)[0] as Template;
const out = process.argv.slice(3, 4)[0];
const files = process.argv.slice(4);
files.forEach(file => 
{
    let source = ts.createSourceFile(file, fs.readFileSync(file).toString(), ScriptTarget.ES2015, true);
    IPCify.parse(source);
});

IPCify.save(template);
