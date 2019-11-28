import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { reducer as notifReducer } from 'redux-notification-center';
import { loadingBarReducer } from 'react-redux-loading-bar';
import user from './user';
import runtime from './runtime';
import intl from './intl';
import formNotifications from './formNotifications';
import breadcrumbs from './breadcrumbs';

export default combineReducers({
  user,
  runtime,
  intl,
  form: formReducer,
  formNotifications,
  notifs: notifReducer,
  loadingBar: loadingBarReducer,
  breadcrumbs,
});
