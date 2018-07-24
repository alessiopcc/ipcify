import {readFileSync, writeFileSync} from 'fs';
import ts from 'typescript';

const module_name = require('../package.json').name;

class IPCify
{
    private static _imports: {[name: string]: string} = {}

    public static parse(node: ts.Node): void
    {
        // console.log(ts.SyntaxKind[node.kind])
        switch(node.kind) 
        {
            case ts.SyntaxKind.ImportDeclaration:
                this._import_declaration(node as ts.ImportDeclaration);
                break;

            // case ts.SyntaxKind.ImportClause:
            //     console.log(Object.keys(node as any))
            //     console.log(ts.isImportClause(node))
            //     // console.log((node as ts.ImportClause))
            //     break;
            case ts.SyntaxKind.Decorator:
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

            console.log('Imported:', this._imports)
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
                    if(node.parent && node.parent.name)
                    {
                        // const class_name = node.parent.name.getText();

                    }
                    break;
            }
        }
    }

    public static save(): void
    {
        const file = 'ipc.ts';
        const cls = ts.createClassDeclaration(undefined, undefined, 'test', undefined, [], []);
        writeFileSync(file, cls.getFullText());
    }
}

const files = process.argv.slice(2);
files.forEach(file => 
{
    let source = ts.createSourceFile(file, readFileSync(file).toString(), ts.ScriptTarget.ES2015, true);
    IPCify.parse(source);
});

IPCify.save();
