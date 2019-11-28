/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './AccessDeniedPage.css';

class AccessDeniedPage extends React.Component {
  static propTypes = {
    error: PropTypes.shape({
      name: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      stack: PropTypes.string.isRequired,
    }),
  };

  static defaultProps = {
    error: null,
  };

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
        <img width="200" height="200" src="data:image/png;base64,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"/>
        <h1>Access Denied</h1>
      </div>
    );
  }
}
export { AccessDeniedPage as AccessDeniedPageWithoutStyle };
export default withStyles(s)(AccessDeniedPage);
