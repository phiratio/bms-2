import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { FormattedMessage, defineMessages } from 'react-intl';
import s from './NotFound.css';

const messages = defineMessages({
  pageNotFoundText: {
    id: 'Sorry, the page you were trying to view does not exist',
    defaultMessage: 'Sorry, the page you were trying to view does not exist',
  },
});

class NotFound extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>{this.props.title}</h1>
          <p>
            <FormattedMessage {...messages.pageNotFoundText} />
          </p>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(NotFound);
