import React from 'react';
import CurrencyFormatter from '../../utils/CurrencyFormatter';

export default class OrderItemRow extends React.Component {
  constructor(props) {
    super(props);
    this.formatter = new CurrencyFormatter();
    this.orderItem = this.props.orderItem;
  }

  render() {
    const itemName = this.orderItem.name;
    const orderTotal = parseFloat(
      this.orderItem.quantity *
        this.formatter.convertStringToFloat(this.orderItem.price),
    ).toFixed(2);
    const { quantity } = this.orderItem;

    return (
      <div className="order_item_row">
        <div>{quantity}</div>
        <div>{itemName}</div>
        <div>${orderTotal}</div>
      </div>
    );
  }
}
