import React from 'react';
import cookies from 'browser-cookies';
import { actions as notifActions } from 'redux-notification-center';
import { unsetUser } from '../../../../actions/user';
import { setNotification } from '../../../../actions/notifications';
import history from '../../../../history';
import LayoutBlank from '../../../../components/LayoutBlank';
import Logout from './Logout';
const { notifClear } = notifActions;

async function action({ store, socket, title }) {
  // if user access page directly then logout does not work, because of SSR
  if (process.env.BROWSER) {
    // clear all existing notifications
    store.dispatch(notifClear());
    store.dispatch(unsetUser());
    cookies.erase(window.App.tokenId);
    socket.close();
    if (typeof Storage !== 'undefined') {
      window.sessionStorage.removeItem('appointment');
      localStorage.removeItem(window.App.tokenId);
    }
  }
  return {
    title,
    chunks: ['home'],
    component: (
      <LayoutBlank>
        <Logout />
      </LayoutBlank>
    ),
  };
}

export default action;
