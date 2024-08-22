from typing import Any, Dict, List, Type, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

from ..models.side import Side

T = TypeVar("T", bound="Order")


@_attrs_define
class Order:
    """
    Attributes:
        id (int):
        market_id (int):
        owner_id (str):
        price (str):
        side (Side):
        size (str):
        transaction_id (int):
    """

    id: int
    market_id: int
    owner_id: str
    price: str
    side: Side
    size: str
    transaction_id: int
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        id = self.id

        market_id = self.market_id

        owner_id = self.owner_id

        price = self.price

        side = self.side.value

        size = self.size

        transaction_id = self.transaction_id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "id": id,
                "market_id": market_id,
                "owner_id": owner_id,
                "price": price,
                "side": side,
                "size": size,
                "transaction_id": transaction_id,
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

        size = d.pop("size")

        transaction_id = d.pop("transaction_id")

        order = cls(
            id=id,
            market_id=market_id,
            owner_id=owner_id,
            price=price,
            side=side,
            size=size,
            transaction_id=transaction_id,
        )

        order.additional_properties = d
        return order

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
