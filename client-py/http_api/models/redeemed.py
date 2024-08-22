from typing import Any, Dict, List, Type, TypeVar

from attrs import define as _attrs_define
from attrs import field as _attrs_field

T = TypeVar("T", bound="Redeemed")


@_attrs_define
class Redeemed:
    """
    Attributes:
        amount (str):
        fund_id (int):
        transaction_id (int):
        user_id (str):
    """

    amount: str
    fund_id: int
    transaction_id: int
    user_id: str
    additional_properties: Dict[str, Any] = _attrs_field(init=False, factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        amount = self.amount

        fund_id = self.fund_id

        transaction_id = self.transaction_id

        user_id = self.user_id

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update(
            {
                "amount": amount,
                "fund_id": fund_id,
                "transaction_id": transaction_id,
                "user_id": user_id,
            }
        )

        return field_dict

    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        amount = d.pop("amount")

        fund_id = d.pop("fund_id")

        transaction_id = d.pop("transaction_id")

        user_id = d.pop("user_id")

        redeemed = cls(
            amount=amount,
            fund_id=fund_id,
            transaction_id=transaction_id,
            user_id=user_id,
        )

        redeemed.additional_properties = d
        return redeemed

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
