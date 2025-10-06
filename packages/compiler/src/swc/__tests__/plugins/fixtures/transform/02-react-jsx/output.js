"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
var _jsxRuntime = require("react/jsx-runtime");
var _react = /*#__PURE__*/ _interopRequireWildcard(require("react"));
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interopRequireWildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _objectSpread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _objectSpreadProps(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
var UserCard = function(param) {
    var user = param.user, onEdit = param.onEdit, onDelete = param.onDelete;
    var ref = (0, _react.useState)(false), isEditing = ref[0], setIsEditing = ref[1];
    var ref1 = (0, _react.useState)(user.name), name = ref1[0], setName = ref1[1];
    (0, _react.useEffect)(function() {
        setName(user.name);
    }, [
        user.name
    ]);
    var handleSave = function() {
        onEdit === null || onEdit === void 0 ? void 0 : onEdit(_objectSpreadProps(_objectSpread({}, user), {
            name: name
        }));
        setIsEditing(false);
    };
    return /*#__PURE__*/ (0, _jsxRuntime.jsx)("div", {
        className: "user-card",
        children: isEditing ? /*#__PURE__*/ (0, _jsxRuntime.jsxs)("div", {
            children: [
                /*#__PURE__*/ (0, _jsxRuntime.jsx)("input", {
                    type: "text",
                    value: name,
                    onChange: function(e) {
                        return setName(e.target.value);
                    }
                }),
                /*#__PURE__*/ (0, _jsxRuntime.jsx)("button", {
                    onClick: handleSave,
                    children: "Save"
                }),
                /*#__PURE__*/ (0, _jsxRuntime.jsx)("button", {
                    onClick: function() {
                        return setIsEditing(false);
                    },
                    children: "Cancel"
                })
            ]
        }) : /*#__PURE__*/ (0, _jsxRuntime.jsxs)("div", {
            children: [
                /*#__PURE__*/ (0, _jsxRuntime.jsx)("h3", {
                    children: user.name
                }),
                /*#__PURE__*/ (0, _jsxRuntime.jsx)("p", {
                    children: user.email
                }),
                /*#__PURE__*/ (0, _jsxRuntime.jsx)("button", {
                    onClick: function() {
                        return setIsEditing(true);
                    },
                    children: "Edit"
                }),
                /*#__PURE__*/ (0, _jsxRuntime.jsx)("button", {
                    onClick: function() {
                        return onDelete === null || onDelete === void 0 ? void 0 : onDelete(user.id);
                    },
                    children: "Delete"
                })
            ]
        })
    });
};
var UserList = function() {
    var ref = (0, _react.useState)([
        {
            id: 1,
            name: "John Doe",
            email: "john@example.com"
        },
        {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com"
        }
    ]), users = ref[0], setUsers = ref[1];
    var handleEdit = function(updatedUser) {
        setUsers(users.map(function(user) {
            return user.id === updatedUser.id ? updatedUser : user;
        }));
    };
    var handleDelete = function(id) {
        setUsers(users.filter(function(user) {
            return user.id !== id;
        }));
    };
    return /*#__PURE__*/ (0, _jsxRuntime.jsxs)("div", {
        className: "user-list",
        children: [
            /*#__PURE__*/ (0, _jsxRuntime.jsx)("h2", {
                children: "Users"
            }),
            users.map(function(user) {
                return /*#__PURE__*/ (0, _jsxRuntime.jsx)(UserCard, {
                    user: user,
                    onEdit: handleEdit,
                    onDelete: handleDelete
                }, user.id);
            })
        ]
    });
};
var _default = UserList;
