/**
 * @constant {Object} DEFAULT_OPTIONS
 */
export const DEFAULT_OPTIONS = {
  injectProps: true,
  usePureComponent: true
};

/**
 * @constant {RegExp} FUNCTION_NAME_REGEXP
 */
export const FUNCTION_NAME_REGEXP = /function ([^\(]+)?\(/;

/**
 * @constant {boolean} IS_PRODUCTION
 * @default
 */
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * @constant {Object} LIFECYCLE_METHODS
 */
export const LIFECYCLE_METHODS = {
  getChildContext: true,
  componentWillMount: true,
  UNSAFE_componentWillMount: true,
  componentDidMount: true,
  componentWillReceiveProps: true,
  UNSAFE_componentWillReceiveProps: true,
  shouldComponentUpdate: true,
  componentWillUpdate: true,
  UNSAFE_componentWillUpdate: true,
  getSnapshotBeforeUpdate: true,
  componentDidUpdate: true,
  componentWillUnmount: true
};
