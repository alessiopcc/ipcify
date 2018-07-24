"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const typescript_1 = __importDefault(require("typescript"));
const module_name = require('../package.json').name;
class IPCify {
    static parse(node) {
        switch (node.kind) {
            case typescript_1.default.SyntaxKind.ImportDeclaration:
                this._import_declaration(node);
                break;
            case typescript_1.default.SyntaxKind.Decorator:
                this._decorator(node);
                break;
            default:
                typescript_1.default.forEachChild(node, (child) => this.parse(child));
        }
    }
    static _import_declaration(node) {
        if (node.moduleSpecifier.text === module_name) {
            if (!node.importClause || !node.importClause.namedBindings || !typescript_1.default.isNamedImports(node.importClause.namedBindings))
                return;
            node.importClause.namedBindings.elements.forEach((element) => {
                if (element.propertyName)
                    this._imports[element.name.text] = element.propertyName.text;
                else
                    this._imports[element.name.text] = element.name.text;
            });
            console.log('Imported:', this._imports);
        }
    }
    static _decorator(node) {
        const token = node.expression.getFirstToken() || node.expression;
        const decorator = this._imports[token.getText()];
        if (decorator) {
            switch (decorator) {
                case ('Threadable'):
                    if (node.parent && node.parent.name) {
                    }
                    break;
            }
        }
    }
    static save() {
        const file = 'ipc.ts';
        const cls = typescript_1.default.createClassDeclaration(undefined, undefined, 'test', undefined, [], []);
        fs_1.writeFileSync(file, cls.getFullText());
    }
}
IPCify._imports = {};
const files = process.argv.slice(2);
files.forEach(file => {
    let source = typescript_1.default.createSourceFile(file, fs_1.readFileSync(file).toString(), typescript_1.default.ScriptTarget.ES2015, true);
    IPCify.parse(source);
});
IPCify.save();
//# sourceMappingURL=index.js.map