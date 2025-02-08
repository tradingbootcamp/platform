use std::time::SystemTime;

use crate::{
    db,
    websocket_api::{
        self,
        market::{Closed, Open, Status},
        Redeemable,
    },
};
use prost_types::Timestamp;
use sqlx::types::time::OffsetDateTime;

impl From<db::Portfolio> for websocket_api::Portfolio {
    fn from(
        db::Portfolio {
            account_id,
            total_balance,
            available_balance,
            market_exposures,
            owner_credits,
        }: db::Portfolio,
    ) -> Self {
        Self {
            account_id,
            total_balance: total_balance.try_into().unwrap(),
            available_balance: available_balance.try_into().unwrap(),
            market_exposures: market_exposures
                .into_iter()
                .map(|exposure| websocket_api::portfolio::MarketExposure {
                    market_id: exposure.market_id,
                    position: exposure.position.0.try_into().unwrap(),
                    total_bid_size: exposure.total_bid_size.0.try_into().unwrap(),
                    total_offer_size: exposure.total_offer_size.0.try_into().unwrap(),
                    total_bid_value: exposure.total_bid_value.0.try_into().unwrap(),
                    total_offer_value: exposure.total_offer_value.0.try_into().unwrap(),
                })
                .collect(),
            owner_credits: owner_credits
                .into_iter()
                .map(|credit| websocket_api::portfolio::OwnerCredit {
                    owner_id: credit.owner_id,
                    credit: credit.credit.0.try_into().unwrap(),
                })
                .collect(),
        }
    }
}

impl From<db::MarketWithRedeemables> for websocket_api::Market {
    fn from(
        db::MarketWithRedeemables {
            market:
                db::Market {
                    id,
                    name,
                    description,
                    owner_id,
                    transaction_id,
                    transaction_timestamp,
                    min_settlement,
                    max_settlement,
                    settled_price,
                    settled_transaction_id,
                    settled_transaction_timestamp,
                    redeem_fee,
                },
            redeemables,
        }: db::MarketWithRedeemables,
    ) -> Self {
        Self {
            id,
            name,
            description,
            owner_id,
            transaction_id,
            transaction_timestamp: transaction_timestamp.map(db_to_ws_timestamp),
            min_settlement: min_settlement.0.try_into().unwrap(),
            max_settlement: max_settlement.0.try_into().unwrap(),
            status: Some(
                match (
                    settled_price,
                    settled_transaction_id,
                    settled_transaction_timestamp,
                ) {
                    (Some(price), id, timestamp) => Status::Closed(Closed {
                        settle_price: price.0.try_into().unwrap(),
                        transaction_id: id.unwrap_or_default(),
                        transaction_timestamp: timestamp.map(db_to_ws_timestamp),
                    }),
                    _ => Status::Open(Open {}),
                },
            ),
            redeemable_for: redeemables.into_iter().map(Redeemable::from).collect(),
            redeem_fee: redeem_fee.0.try_into().unwrap(),
        }
    }
}

impl From<db::Order> for websocket_api::Order {
    fn from(
        db::Order {
            id,
            market_id,
            owner_id,
            transaction_id,
            transaction_timestamp,
            size,
            price,
            side,
        }: db::Order,
    ) -> Self {
        Self {
            id,
            market_id,
            owner_id,
            transaction_id,
            transaction_timestamp: transaction_timestamp.map(db_to_ws_timestamp),
            size: size.0.try_into().unwrap(),
            sizes: Vec::default(),
            price: price.0.try_into().unwrap(),
            side: match side.0 {
                db::Side::Bid => websocket_api::Side::Bid,
                db::Side::Offer => websocket_api::Side::Offer,
            }
            .into(),
        }
    }
}

impl From<db::Trade> for websocket_api::Trade {
    fn from(
        db::Trade {
            id,
            market_id,
            buyer_id,
            seller_id,
            price,
            size,
            transaction_id,
            transaction_timestamp,
            ..
        }: db::Trade,
    ) -> Self {
        Self {
            id,
            market_id,
            buyer_id,
            seller_id,
            transaction_id,
            transaction_timestamp: transaction_timestamp.map(db_to_ws_timestamp),
            size: size.0.try_into().unwrap(),
            price: price.0.try_into().unwrap(),
        }
    }
}

impl From<db::Transfer> for websocket_api::Transfer {
    fn from(
        db::Transfer {
            id,
            initiator_id,
            from_account_id,
            to_account_id,
            amount,
            note,
            transaction_id,
            transaction_timestamp,
        }: db::Transfer,
    ) -> Self {
        Self {
            id,
            initiator_id,
            from_account_id,
            to_account_id,
            amount: amount.0.try_into().unwrap(),
            note,
            transaction_id,
            transaction_timestamp: transaction_timestamp.map(db_to_ws_timestamp),
        }
    }
}

impl From<db::OrderFill> for websocket_api::order_created::OrderFill {
    fn from(
        db::OrderFill {
            id,
            market_id,
            owner_id,
            size_filled,
            size_remaining,
            price,
            side,
        }: db::OrderFill,
    ) -> Self {
        Self {
            id,
            market_id,
            owner_id,
            size_filled: size_filled.try_into().unwrap(),
            size_remaining: size_remaining.try_into().unwrap(),
            price: price.try_into().unwrap(),
            side: match side {
                db::Side::Bid => websocket_api::Side::Bid,
                db::Side::Offer => websocket_api::Side::Offer,
            }
            .into(),
        }
    }
}

impl From<db::Account> for websocket_api::Account {
    fn from(db::Account { id, name, is_user }: db::Account) -> Self {
        Self { id, name, is_user }
    }
}

impl From<db::Size> for websocket_api::Size {
    fn from(
        db::Size {
            transaction_id,
            transaction_timestamp,
            size,
            ..
        }: db::Size,
    ) -> Self {
        Self {
            transaction_id,
            transaction_timestamp: transaction_timestamp.map(db_to_ws_timestamp),
            size: size.0.try_into().unwrap(),
        }
    }
}

impl From<(db::Order, Vec<db::Size>)> for websocket_api::Order {
    fn from((order, sizes): (db::Order, Vec<db::Size>)) -> Self {
        let mut order: websocket_api::Order = order.into();
        order.sizes = sizes.into_iter().map(websocket_api::Size::from).collect();
        order
    }
}

impl From<db::Redeemable> for websocket_api::Redeemable {
    fn from(
        db::Redeemable {
            constituent_id,
            multiplier,
            ..
        }: db::Redeemable,
    ) -> Self {
        Self {
            constituent_id,
            multiplier,
        }
    }
}

#[must_use]
pub fn db_to_ws_timestamp(timestamp: OffsetDateTime) -> Timestamp {
    Timestamp::from(SystemTime::from(timestamp))
}
