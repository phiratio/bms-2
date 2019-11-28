/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Home from './Home';
import LayoutBlank from '../../components/LayoutBlank';
import { loggedIn } from '../../core/utils';
import Layout from '../../components/Layout';

async function action({ title, breadcrumbs, location, store }) {
  if (!loggedIn(store.getState().user)) {
    return {
      title,
      chunks: ['home'],
      component: (
        <LayoutBlank location={location} breadcrumbs={breadcrumbs}>
          <Home />
        </LayoutBlank>
      ),
    };
  } else {
    return {
      title,
      chunks: ['home'],
      component: (
        <Layout location={location} breadcrumbs={breadcrumbs}>
          <Home />
        </Layout>
      ),
    };
  }
}

export default action;
