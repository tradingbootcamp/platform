use std::time::SystemTime;

use crate::{
    db,
    websocket_api::{
        self,
        market::{Closed, Open, Status},
    },
};
use prost_types::Timestamp;

impl From<db::Portfolio> for websocket_api::Portfolio {
    fn from(
        db::Portfolio {
            total_balance,
            available_balance,
            market_exposures,
        }: db::Portfolio,
    ) -> Self {
        Self {
            total_balance: total_balance
                .try_into()
                .expect("total balance should be within f64"),
            available_balance: available_balance
                .try_into()
                .expect("available balance should be within f64"),
            market_exposures: market_exposures
                .into_iter()
                .map(|exposure| websocket_api::portfolio::MarketExposure {
                    market_id: exposure.market_id,
                    position: exposure.position.0.try_into().expect(""),
                    total_bid_size: exposure.total_bid_size.0.try_into().expect(""),
                    total_offer_size: exposure.total_offer_size.0.try_into().expect(""),
                    total_bid_value: exposure.total_bid_value.0.try_into().expect(""),
                    total_offer_value: exposure.total_offer_value.0.try_into().expect(""),
                })
                .collect(),
        }
    }
}

impl From<db::MarketData> for websocket_api::Market {
    fn from(
        db::MarketData {
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
                },
            constituents,
            ..
        }: db::MarketData,
    ) -> Self {
        Self {
            id,
            name,
            description,
            owner_id,
            transaction: Some(websocket_api::Transaction {
                id: transaction_id,
                timestamp: Some(Timestamp::from(SystemTime::from(transaction_timestamp))),
            }),
            min_settlement: min_settlement
                .0
                .try_into()
                .expect("min settlement should be within f64"),
            max_settlement: max_settlement
                .0
                .try_into()
                .expect("max settlement should be within f64"),
            status: Some(match settled_price {
                Some(price) => Status::Closed(Closed {
                    settle_price: price
                        .0
                        .try_into()
                        .expect("settle price should be within f64"),
                    transaction_id,
                }),
                None => Status::Open(Open {}),
            }),
            redeemable_for: constituents,
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
            size: size.0.try_into().expect("size should be within f64"),
            sizes: Vec::default(),
            price: price.0.try_into().expect("price should be within f64"),
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
            ..
        }: db::Trade,
    ) -> Self {
        Self {
            id,
            market_id,
            buyer_id,
            seller_id,
            transaction_id,
            size: size.0.try_into().expect("size should be within f64"),
            price: price.0.try_into().expect("price should be within f64"),
        }
    }
}

impl From<db::Payment> for websocket_api::Payment {
    fn from(
        db::Payment {
            id,
            payer_id,
            recipient_id,
            amount,
            note,
            transaction_id,
            transaction_timestamp,
        }: db::Payment,
    ) -> Self {
        Self {
            id,
            payer_id,
            recipient_id,
            transaction: Some(websocket_api::Transaction {
                id: transaction_id,
                timestamp: Some(Timestamp::from(SystemTime::from(transaction_timestamp))),
            }),
            amount: amount.0.try_into().expect("amount should be within f64"),
            note,
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
            size_filled: size_filled
                .try_into()
                .expect("size_filled should be within f64"),
            size_remaining: size_remaining
                .try_into()
                .expect("size_remaining should be within f64"),
            price: price.try_into().expect(""),
            side: match side {
                db::Side::Bid => websocket_api::Side::Bid,
                db::Side::Offer => websocket_api::Side::Offer,
            }
            .into(),
        }
    }
}

impl From<db::User> for websocket_api::User {
    fn from(db::User { id, name, is_bot }: db::User) -> Self {
        Self { id, name, is_bot }
    }
}

impl From<db::Ownership> for websocket_api::Ownership {
    fn from(value: db::Ownership) -> Self {
        Self {
            of_bot_id: value.bot_id,
        }
    }
}

impl From<db::Size> for websocket_api::Size {
    fn from(
        db::Size {
            transaction_id,
            size,
            ..
        }: db::Size,
    ) -> Self {
        Self {
            transaction_id,
            size: size.0.try_into().expect(""),
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

impl From<db::TransactionInfo> for websocket_api::Transaction {
    fn from(transaction_info: db::TransactionInfo) -> Self {
        Self {
            id: transaction_info.id,
            timestamp: Some(Timestamp::from(SystemTime::from(
                transaction_info.timestamp,
            ))),
        }
    }
}
