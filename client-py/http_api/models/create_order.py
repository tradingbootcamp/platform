from typing import Any, Dict, List, Type, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.side import Side

T = TypeVar("T", bound="CreateOrder")


@_attrs_define
class CreateOrder:
    """
    Attributes:
        market_id (int):
        price (str):
        side (Side):
        size (str):
    """

    market_id: int
    price: str
    side: Side
    size: str
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        market_id = self.market_id

        price = self.price

        side = self.side.value

        size = self.size

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "market_id": market_id,
                "price": price,
                "side": side,
                "size": size,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        market_id = d.pop("market_id")

        price = d.pop("price")

        side = Side(d.pop("side"))

        size = d.pop("size")

        create_order = cls(
            market_id=market_id,
            price=price,
            side=side,
            size=size,
        )

        create_order.additional_properties = d
        return create_order

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
