import * as fs from 'fs-extra';
import * as path from 'path';
import Project, {createWrappedNode, MethodDeclaration, ts} from 'ts-simple-ast';
import {ScriptTarget, SyntaxKind} from 'typescript';
import handlebars from 'handlebars';

const module_name = require('../package.json').name;

export interface ClassThread
{
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
            default:
                ts.forEachChild(node, (child) => this.parse(child));
        }
    }

    private static _import_declaration(node: ts.ImportDeclaration): void
    {
        if((node.moduleSpecifier as any).text === module_name)
        {
            if(!node.importClause || !node.importClause.namedBindings ||!ts.isNamedImports(node.importClause.namedBindings))
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

    private static _decorator(node: ts.Decorator): void
    {
        const token = node.expression.getFirstToken() || node.expression;
        const decorator = this._imports[token.getText()];
        if(decorator)
        {
            switch(decorator)
            {
                case('Threadable'):
                    if(node.parent && ts.isClassDeclaration(node.parent) && node.parent.name)
                    {
                        const class_name = node.parent.name.getText();
                        this._classes[class_name] = {
                            methods: []
                        };
                        console.log('Class:', class_name);
                    }
                    else
                        throw new Error(`Decorator @Threadable parse error, ${node}`)
                    break;

                case('threadit'):
                    if(node.parent && ts.isMethodDeclaration(node.parent) && node.parent.name && node.parent.parent && ts.isClassDeclaration(node.parent.parent) && node.parent.parent.name)
                    {
                        const class_name = node.parent.parent.name.getText();
                        const threadable = this._classes[class_name];
                        if(!threadable)
                            throw new Error('@threadit decorator can be used only in @Threadable classes');

                        if(node.parent.modifiers)
                        {
                            for(const modifier of node.parent.modifiers)
                            {
                                switch(modifier.kind)
                                {
                                    case SyntaxKind.ProtectedKeyword:
                                    case SyntaxKind.PrivateKeyword:
                                        throw new Error('@thradit can be applied only to public methods');
                                }
                            }
                        }
                        threadable.methods.push(node.parent);
                        console.log('Method:', node.parent.name.getText(), ' - Class', class_name);
                    }
                    else
                        throw new Error(`Decorator @threadit parse error, ${node}`)
            }
        }
    }

    public static save(template: Template)
    {
        fs.emptyDirSync(path.resolve(out));
        const project = new Project();

        const template_path = path.resolve(__dirname, 'template', template);
        const ipc_name = 'IPC.ts';
        const router_name = 'Router.ts';

        const ipc_data = {
            exec_path: `./${router_name}`,
            events: ''
        }
        const ipc = handlebars.compile(require(path.resolve(template_path, 'ipc.js')).trim())(ipc_data);
        project.createSourceFile(path.resolve(out, ipc_name), ipc);

        const router_data = {
        }
        const router = handlebars.compile(require(path.resolve(template_path, 'router.js')).trim())(router_data);
        project.createSourceFile(path.resolve(out, router_name), router);

        for(const class_name in this._classes)
        {
            const stub = project.createSourceFile(path.resolve(out, 'stub', `${class_name}Stub.ts`));
            const skeleton = project.createSourceFile(path.resolve(out, 'skeleton', `${class_name}SKeleton.ts`));
            const stub_class = stub.addClass({name: `${class_name}Stub`, isExported: true});
            const skeleton_class = skeleton.addClass({name: `${class_name}Skeleton`, isExported: true});
            
            this._classes[class_name].methods.forEach((method) => 
            {
                const wrapped_method = createWrappedNode(method) as MethodDeclaration;
                const return_type = method.type ? method.type.getText() : undefined;
                wrapped_method.getModifiers()

                // let returns = false;
                // const body = wrapped_method.getBody() as Block;
                // body.forEachDescendant((desc) => returns = returns || (ts.isReturnStatement(desc.compilerNode) && (desc as ReturnStatement).))

                const stub_method = stub_class.insertMethod(0, {
                    name: wrapped_method.getName(),
                    isStatic: wrapped_method.isStatic(),
                    returnType: return_type,
                    scope: wrapped_method.getScope()
                })
                
                const skeleton_method = skeleton_class.insertMethod(0, {
                    name: wrapped_method.getName(),
                    isStatic: true,
                    returnType: return_type,
                    scope: wrapped_method.getScope()
                })

                method.parameters.forEach((parameter) => 
                {
                    const name = parameter.name.getText();
                    const type = parameter.type ? parameter.type.getText() : undefined;

                    stub_method.addParameter({
                        name, type
                    });
                    skeleton_method.addParameter({
                        name, type
                    });
                });
            });
        }

        project.save();
    }
}

export declare type Template = 'worker';
const template = process.argv.slice(2, 3)[0] as Template;
const out = process.argv.slice(3, 4)[0];
const files = process.argv.slice(4);
files.forEach(file => 
{
    let source = ts.createSourceFile(file, fs.readFileSync(file).toString(), ScriptTarget.ES2015, true);
    IPCify.parse(source);
});

IPCify.save(template);
