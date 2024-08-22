from typing import Any, Dict, List, Type, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.side import Side

T = TypeVar("T", bound="OrderFill")


@_attrs_define
class OrderFill:
    """
    Attributes:
        id (int):
        market_id (int):
        owner_id (str):
        price (str):
        side (Side):
        size_filled (str):
        size_remaining (str):
    """

    id: int
    market_id: int
    owner_id: str
    price: str
    side: Side
    size_filled: str
    size_remaining: str
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        id = self.id

        market_id = self.market_id

        owner_id = self.owner_id

        price = self.price

        side = self.side.value

        size_filled = self.size_filled

        size_remaining = self.size_remaining

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "market_id": market_id,
                "owner_id": owner_id,
                "price": price,
                "side": side,
                "size_filled": size_filled,
                "size_remaining": size_remaining,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        id = d.pop("id")

        market_id = d.pop("market_id")

        owner_id = d.pop("owner_id")

        price = d.pop("price")

        side = Side(d.pop("side"))

        size_filled = d.pop("size_filled")

        size_remaining = d.pop("size_remaining")

        order_fill = cls(
            id=id,
            market_id=market_id,
            owner_id=owner_id,
            price=price,
            side=side,
            size_filled=size_filled,
            size_remaining=size_remaining,
        )

        order_fill.additional_properties = d
        return order_fill

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
