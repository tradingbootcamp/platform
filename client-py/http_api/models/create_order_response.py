from typing import (
    TYPE_CHECKING,
    Any,
    Dict,
    List,
    Type,
    TypeVar,
    Union,
    cast,
)

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..types import UNSET, Unset

if TYPE_CHECKING:
    from ..models.order import Order
    from ..models.order_fill import OrderFill
    from ..models.trade import Trade


T = TypeVar("T", bound="CreateOrderResponse")


@_attrs_define
class CreateOrderResponse:
    """
    Attributes:
        fills (List['OrderFill']):
        trades (List['Trade']):
        order (Union['Order', None, Unset]):
    """

    fills: List["OrderFill"]
    trades: List["Trade"]
    order: Union["Order", None, Unset] = UNSET
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        from ..models.order import Order

        fills = []
        for fills_item_data in self.fills:
            fills_item = fills_item_data.to_dict()
            fills.append(fills_item)

        trades = []
        for trades_item_data in self.trades:
            trades_item = trades_item_data.to_dict()
            trades.append(trades_item)

        order: Union[Dict[str, Any], None, Unset]
        if isinstance(self.order, Unset):
            order = UNSET
        elif isinstance(self.order, Order):
            order = self.order.to_dict()
        else:
            order = self.order

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "fills": fills,
                "trades": trades,
            }
        )
        if order is not UNSET:
            field_dict["order"] = order

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.order import Order
        from ..models.order_fill import OrderFill
        from ..models.trade import Trade

        d = src_dict.copy()
        fills = []
        _fills = d.pop("fills")
        for fills_item_data in _fills:
            fills_item = OrderFill.from_dict(fills_item_data)

            fills.append(fills_item)

        trades = []
        _trades = d.pop("trades")
        for trades_item_data in _trades:
            trades_item = Trade.from_dict(trades_item_data)

            trades.append(trades_item)

        def _parse_order(data: object) -> Union["Order", None, Unset]:
            if data is None:
                return data
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                order_type_1 = Order.from_dict(data)

                return order_type_1
            except:  # noqa: E722
                pass
            return cast(Union["Order", None, Unset], data)

        order = _parse_order(d.pop("order", UNSET))

        create_order_response = cls(
            fills=fills,
            trades=trades,
            order=order,
        )

        create_order_response.additional_properties = d
        return create_order_response

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
