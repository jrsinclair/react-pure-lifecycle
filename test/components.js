// test
import test from 'ava';
import PropTypes from 'prop-types';
import React, {Component, PureComponent} from 'react';
import sinon from 'sinon';
import {mount} from 'enzyme';

// src
import * as components from 'src/components';
import {DEFAULT_OPTIONS} from 'src/constants';

const Functional = ({counter}) => {
  return <div>{counter}</div>;
};

Functional.propTypes = {
  counter: PropTypes.number
};

class Standard extends Component {
  static propTypes = {
    counter: PropTypes.number
  };

  render() {
    const {counter} = this.props;

    return <div>{counter}</div>;
  }
}

class Pure extends PureComponent {
  static propTypes = {
    counter: PropTypes.number
  };

  render() {
    const {counter} = this.props;

    return <div>{counter}</div>;
  }
}

/**
 * test if the lifecycle method was added to the component
 *
 * @param {Object} t
 * @param {function} method
 * @param {Component} ComponentToTest
 */
const testIfLifecycleHookAdded = (t, method, ComponentToTest) => {
  const componentDidMount = sinon.stub();
  const methods = {
    componentDidMount
  };

  const ComponentWithHooks = method(ComponentToTest, methods, DEFAULT_OPTIONS);

  mount(<ComponentWithHooks />);

  t.true(componentDidMount.calledOnce);
};

const testNewLifecycleHooksFireInOrder = (t, method, ComponentToTest) => {
  let newPassed = [];

  const newMethodNames = [
    'componentDidMount',
    'shouldComponentUpdate',
    'getSnapshotBeforeUpdate',
    'componentDidUpdate',
    'componentWillUnmount'
  ];

  const newMethods = newMethodNames.reduce((stubs, key) => {
    return {
      ...stubs,
      [key]() {
        newPassed.push(key);

        return true;
      }
    };
  }, {});

  const NewComponentWithHooks = method(ComponentToTest, newMethods, {
    ...DEFAULT_OPTIONS,
    usePureComponent: false
  });

  const newWrapper = mount(<NewComponentWithHooks />);

  const newExpectedMountResult = ['componentDidMount'];

  t.deepEqual(newPassed, newExpectedMountResult);

  newWrapper.setProps({
    counter: 1
  });

  const newExpectedUpdateResult = [
    ...newExpectedMountResult,
    'shouldComponentUpdate',
    'getSnapshotBeforeUpdate',
    'componentDidUpdate'
  ];

  t.deepEqual(newPassed, newExpectedUpdateResult);

  newWrapper.unmount();

  t.deepEqual(newPassed, [...newExpectedUpdateResult, 'componentWillUnmount']);
};

/**
 * test if all the methods are added and fired in order
 *
 * @param {Object} t
 * @param {function} method
 * @param {Component} ComponentToTest
 */
const testIfLifecycleHooksFireInOrder = (t, method, ComponentToTest) => {
  let passed = [];

  const oldMethodNames = [
    'componentWillMount',
    'UNSAFE_componentWillMount',
    'componentDidMount',
    'componentWillReceiveProps',
    'UNSAFE_componentWillReceiveProps',
    'shouldComponentUpdate',
    'componentWillUpdate',
    'UNSAFE_componentWillUpdate',
    'componentDidUpdate',
    'componentWillUnmount'
  ];

  const methods = oldMethodNames.reduce((stubs, key) => {
    return {
      ...stubs,
      [key]() {
        passed.push(key);

        return true;
      }
    };
  }, {});

  const ComponentWithHooks = method(ComponentToTest, methods, {
    ...DEFAULT_OPTIONS,
    usePureComponent: false
  });

  const wrapper = mount(<ComponentWithHooks />);

  const expectedMountResult = ['componentWillMount', 'UNSAFE_componentWillMount', 'componentDidMount'];

  t.deepEqual(passed, expectedMountResult);

  wrapper.setProps({
    counter: 1
  });

  const expectedUpdateResult = [
    ...expectedMountResult,
    'componentWillReceiveProps',
    'UNSAFE_componentWillReceiveProps',
    'shouldComponentUpdate',
    'componentWillUpdate',
    'UNSAFE_componentWillUpdate',
    'componentDidUpdate'
  ];

  t.deepEqual(passed, expectedUpdateResult);

  wrapper.unmount();

  t.deepEqual(passed, [...expectedUpdateResult, 'componentWillUnmount']);
};

test('if getFunctionHoc will add a lifecycle hook to the component passed', (t) => {
  testIfLifecycleHookAdded(t, components.getFunctionHoc, Functional);
});

test('if getClassHoc will add a lifecycle hook to the component passed', (t) => {
  testIfLifecycleHookAdded(t, components.getClassHoc, Standard);
});

test('if getClassHoc will add a lifecycle hook to the pure component passed', (t) => {
  testIfLifecycleHookAdded(t, components.getClassHoc, Pure);
});

test('if getFunctionHoc will add all lifecycle hooks and fire in order for a functional component', (t) => {
  testIfLifecycleHooksFireInOrder(t, components.getFunctionHoc, Functional);
  testNewLifecycleHooksFireInOrder(t, components.getFunctionHoc, Functional);
});

test('if getClassHoc will add all lifecycle hooks and fire in order for a standard component', (t) => {
  testIfLifecycleHooksFireInOrder(t, components.getClassHoc, Standard);
  testNewLifecycleHooksFireInOrder(t, components.getClassHoc, Standard);
});

test('if getClassHoc will add all lifecycle hooks and fire in order for a pure component', (t) => {
  testIfLifecycleHooksFireInOrder(t, components.getClassHoc, Pure);
  testNewLifecycleHooksFireInOrder(t, components.getClassHoc, Pure);
});

test('if getFunctionHoc will extend a standard class when isPure is false', (t) => {
  const methods = {
    componentDidUpdate() {}
  };
  const options = {
    ...DEFAULT_OPTIONS,
    usePureComponent: false
  };

  const Result = components.getFunctionHoc(Functional, methods, options);

  t.true(Component.isPrototypeOf(Result));
  t.false(PureComponent.isPrototypeOf(Result));
});

test('if getFunctionHoc will extend a pure class when isPure is true', (t) => {
  const methods = {
    componentDidUpdate() {}
  };

  const Result = components.getFunctionHoc(Functional, methods, DEFAULT_OPTIONS);

  t.false(Component.isPrototypeOf(Result));
  t.true(PureComponent.isPrototypeOf(Result));
});

test('if getFunctionHoc will remove childContextTypes from the fn if it exists', (t) => {
  const methods = {
    getChildContext() {
      return {
        foo: 'bar'
      };
    }
  };

  const FunctionalWithChildContext = ({counter}) => {
    return <div>{counter}</div>;
  };

  FunctionalWithChildContext.propTypes = {
    counter: PropTypes.number
  };

  const childContextTypes = {
    foo: PropTypes.string
  };

  FunctionalWithChildContext.childContextTypes = childContextTypes;

  const Result = components.getFunctionHoc(FunctionalWithChildContext, methods, DEFAULT_OPTIONS);

  t.deepEqual(Result.childContextTypes, childContextTypes);
  t.is(FunctionalWithChildContext.childContextTypes, undefined);
});
