"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Threadable(target) {
    console.log('Class decorate');
    return _a = class extends target {
            constructor() {
                super(...arguments);
                this.__threadable__ = true;
            }
        },
        _a.__threadable__ = true,
        _a;
    var _a;
}
exports.Threadable = Threadable;
function threadit(_, __, descriptor) {
    const method = descriptor.value;
    descriptor.value = function () {
        if (!this.__threadable__)
            throw new Error('@threadit decorator can be used only in @Threadable classes');
        return method.apply(this, arguments);
    };
    return descriptor;
}
exports.threadit = threadit;
//# sourceMappingURL=decorators.js.map