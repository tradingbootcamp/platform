from typing import Optional, TypeVar, Union

from http_api.models import Error
from http_api.types import HTTPStatus, Response

T = TypeVar("T")


class HttpException(Exception):
    error: Error
    status_code: HTTPStatus

    def __init__(self, error: Error, status_code: HTTPStatus):
        super().__init__(error.error)
        self.error = error
        self.status_code = status_code


def handle_detailed_response(response: Response[Union[T, Error]]) -> Optional[T]:
    if isinstance(response.parsed, Error):
        raise HttpException(response.parsed, response.status_code)
    if response.status_code.value >= 300:
        raise HttpException(Error(error="Unknown error"), response.status_code)
    return response.parsed
