use crate::{
    db,
    websocket_api::{
        self,
        market::{Closed, Open, Status},
    },
};

impl From<db::Portfolio> for websocket_api::Portfolio {
    fn from(
        db::Portfolio {
            total_balance,
            available_balance,
            market_exposures,
        }: db::Portfolio,
    ) -> Self {
        Self {
            total_balance: total_balance.to_string(),
            available_balance: available_balance.to_string(),
            market_exposures: market_exposures
                .into_iter()
                .map(|exposure| websocket_api::portfolio::MarketExposure {
                    market_id: exposure.market_id,
                    position: exposure.position.to_string(),
                    total_bid_size: exposure.total_bid_size.to_string(),
                    total_offer_size: exposure.total_offer_size.to_string(),
                    total_bid_value: exposure.total_bid_value.to_string(),
                    total_offer_value: exposure.total_offer_value.to_string(),
                })
                .collect(),
        }
    }
}

impl From<db::Market> for websocket_api::Market {
    fn from(
        db::Market {
            id,
            name,
            description,
            owner_id,
            transaction_id,
            min_settlement,
            max_settlement,
            settled_price,
        }: db::Market,
    ) -> Self {
        Self {
            id,
            name,
            description,
            owner_id,
            transaction_id,
            min_settlement: min_settlement.to_string(),
            max_settlement: max_settlement.to_string(),
            status: Some(match settled_price {
                Some(price) => Status::Closed(Closed {
                    settle_price: price.to_string(),
                }),
                None => Status::Open(Open {}),
            }),
            orders: Vec::default(),
            trades: Vec::default(),
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
            size: size.to_string(),
            price: price.to_string(),
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
        }: db::Trade,
    ) -> Self {
        Self {
            id,
            market_id,
            buyer_id,
            seller_id,
            transaction_id,
            size: size.to_string(),
            price: price.to_string(),
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
        }: db::Payment,
    ) -> Self {
        Self {
            id,
            payer_id,
            recipient_id,
            amount: amount.to_string(),
            note,
            transaction_id,
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
            size_filled: size_filled.to_string(),
            size_remaining: size_remaining.to_string(),
            price: price.to_string(),
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
