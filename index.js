var LIFECYCLE_HOOKS = {
  componentWillMount: true,
  componentDidMount: true,
  componentWillReceiveProps: true,
  getSnapshotBeforeUpdate: true,
  shouldComponentUpdate: true,
  componentWillUpdate: true,
  componentDidUpdate: true,
  componentWillUnmount: true
};

var STATIC_HOOKS = {
  getDerivedStateFromProps: true
};

function wrap(base, method, isStatic) {
  var before = true;

  if (Array.isArray(method)) {
    before = method[0] !== "after";
    method = method[1];
  }

  if (!base) return method;

  return function wrappedLifecyclehook() {
    var ctx = isStatic ? null : this;
    before && method.apply(ctx, arguments);
    base.apply(ctx, arguments);
    !before && method.apply(ctx, arguments);
  };
}

module.exports = function spyOnComponent(component, hooks) {
  var originals = Object.create(null);
  if (hooks && Object.keys(hooks).length > 0) {
    for (var key in hooks) {
      if (STATIC_HOOKS[key]) {
        component.constructor[key] = wrap((originals[key] = component.constructor[key]), hooks[key], true);
      }
    }
    for (var key in hooks) {
      if (LIFECYCLE_HOOKS[key]) {
        component[key] = wrap((originals[key] = component[key]), hooks[key]);
      }
    }
  }

  return function reset(key) {
    var subject = STATIC_HOOKS[key] ? component.constructor : component;

    if (key && originals && originals[key]) {
      subject[key] = originals[key];
    } else {
      if (originals) {
        for (var nKey in originals) {
          subject[nKey] = originals[nKey];
        }
      }
    }
  };
};

module.exports.mixin = function mixinIntoComponent(componentClass, hooks) {
  spyOnComponent(componentClass.prototype, hooks);
  return componentClass;
};
