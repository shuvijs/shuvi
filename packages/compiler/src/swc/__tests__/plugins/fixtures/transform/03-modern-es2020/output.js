function _checkPrivateRedeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
        throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
}
function _classApplyDescriptorGet(receiver, descriptor) {
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}
function _classCheckPrivateStaticFieldDescriptor(descriptor, action) {
    if (descriptor === undefined) {
        throw new TypeError("attempted to " + action + " private static field before its declaration");
    }
}
function _classExtractFieldDescriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to " + action + " private field on non-instance");
    }
    return privateMap.get(receiver);
}
function _classPrivateFieldGet(receiver, privateMap) {
    var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get");
    return _classApplyDescriptorGet(receiver, descriptor);
}
function _classPrivateFieldInit(obj, privateMap, value) {
    _checkPrivateRedeclaration(obj, privateMap);
    privateMap.set(obj, value);
}
function _classPrivateMethodGet(receiver, privateSet, fn) {
    if (!privateSet.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return fn;
}
function _classPrivateMethodInit(obj, privateSet) {
    _checkPrivateRedeclaration(obj, privateSet);
    privateSet.add(obj);
}
function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) {
    _classCheckPrivateStaticAccess(receiver, classConstructor);
    _classCheckPrivateStaticFieldDescriptor(descriptor, "get");
    return _classApplyDescriptorGet(receiver, descriptor);
}
function _classStaticPrivateMethodGet(receiver, classConstructor, method) {
    _classCheckPrivateStaticAccess(receiver, classConstructor);
    return method;
}
function _classCheckPrivateStaticAccess(receiver, classConstructor) {
    if (receiver !== classConstructor) {
        throw new TypeError("Private static access of wrong provenance");
    }
}
const user = {
    name: 'John',
    address: {
        street: '123 Main St'
    }
};
// Optional chaining
const street = user.address?.street;
const theme = user.preferences?.theme;
// Nullish coalescing
const displayName = user.name ?? 'Anonymous';
const userTheme = theme ?? 'light';
// BigInt
const bigNumber = 123456789012345678901234567890n;
const anotherBigInt = BigInt('123456789012345678901234567890');
// Dynamic imports
const loadModule = async ()=>{
    const module = await import('./dynamic-module');
    return module.default;
};
// Top-level await (ES2022)
const data = await fetch('/api/data').then((res)=>res.json());
var _privateField = /*#__PURE__*/ new WeakMap(), _privateMethod = /*#__PURE__*/ new WeakSet();
// Class fields and private methods
class ModernClass {
    publicMethod() {
        return _classPrivateMethodGet(this, _privateMethod, privateMethod).call(this);
    }
    static publicStaticMethod() {
        return _classStaticPrivateMethodGet(ModernClass, ModernClass, privateStaticMethod).call(ModernClass);
    }
    constructor(){
        _classPrivateMethodInit(this, _privateMethod);
        _classPrivateFieldInit(this, _privateField, {
            writable: true,
            value: 'private'
        });
        this.publicField = 'public';
    }
}
var _privateStaticField = {
    writable: true,
    value: 'private static'
};
ModernClass.publicStaticField = 'public static';
function privateMethod() {
    return _classPrivateFieldGet(this, _privateField);
}
function privateStaticMethod() {
    return _classStaticPrivateFieldSpecGet(ModernClass, ModernClass, _privateStaticField);
}
// Logical assignment operators
let x = 1;
x || (x = 2); // x = x || 2
x && (x = 3); // x = x && 3
x ?? (x = 4); // x = x ?? 4
// Numeric separators
const million = 1000000;
const binary = 0b1010000110000101;
const hex = 0xa0b0c0;
export { street, theme, displayName, userTheme, bigNumber, anotherBigInt, loadModule, data, ModernClass, x, million, binary, hex };
