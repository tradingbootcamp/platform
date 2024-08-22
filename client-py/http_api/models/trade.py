from typing import Any, Dict, List, Type, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="Trade")


@_attrs_define
class Trade:
    """
    Attributes:
        buyer_id (str):
        id (int):
        market_id (int):
        price (str):
        seller_id (str):
        size (str):
        transaction_id (int):
    """

    buyer_id: str
    id: int
    market_id: int
    price: str
    seller_id: str
    size: str
    transaction_id: int
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        buyer_id = self.buyer_id

        id = self.id

        market_id = self.market_id

        price = self.price

        seller_id = self.seller_id

        size = self.size

        transaction_id = self.transaction_id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "buyer_id": buyer_id,
                "id": id,
                "market_id": market_id,
                "price": price,
                "seller_id": seller_id,
                "size": size,
                "transaction_id": transaction_id,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        buyer_id = d.pop("buyer_id")

        id = d.pop("id")

        market_id = d.pop("market_id")

        price = d.pop("price")

        seller_id = d.pop("seller_id")

        size = d.pop("size")

        transaction_id = d.pop("transaction_id")

        trade = cls(
            buyer_id=buyer_id,
            id=id,
            market_id=market_id,
            price=price,
            seller_id=seller_id,
            size=size,
            transaction_id=transaction_id,
        )

        trade.additional_properties = d
        return trade

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
