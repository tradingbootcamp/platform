from enum import Enum


class Side(str, Enum):
    BID = "bid"
    OFFER = "offer"

    def __str__(self) -> str:
        return str(self.value)
