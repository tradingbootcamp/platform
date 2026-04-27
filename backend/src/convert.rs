use std::time::SystemTime;

use crate::{
    db,
    websocket_api::{self, Redeemable},
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
            traded_market_ids,
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
            traded_market_ids,
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
                    pinned,
                    type_id,
                    group_id,
                    status,
                    universe_id,
                },
            redeemables,
            visible_to,
            option_info,
        }: db::MarketWithRedeemables,
    ) -> Self {
        use websocket_api::market::{Closed, MarketState, Open};
        Self {
            id,
            name,
            description,
            owner_id,
            transaction_id,
            transaction_timestamp: transaction_timestamp.map(db_to_ws_timestamp),
            min_settlement: min_settlement.0.try_into().unwrap(),
            max_settlement: max_settlement.0.try_into().unwrap(),
            market_state: Some(
                match (
                    settled_price,
                    settled_transaction_id,
                    settled_transaction_timestamp,
                ) {
                    (Some(price), id, timestamp) => MarketState::Closed(Closed {
                        settle_price: price.0.try_into().unwrap(),
                        transaction_id: id.unwrap_or_default(),
                        transaction_timestamp: timestamp.map(db_to_ws_timestamp),
                    }),
                    _ => MarketState::Open(Open {}),
                },
            ),
            redeemable_for: redeemables.into_iter().map(Redeemable::from).collect(),
            redeem_fee: redeem_fee.0.try_into().unwrap(),
            visible_to,
            pinned,
            type_id,
            group_id: group_id.unwrap_or(0),
            status: websocket_api::MarketStatus::try_from(status)
                .unwrap_or(websocket_api::MarketStatus::Open) as i32,
            universe_id,
            option: option_info.map(websocket_api::OptionInfo::from),
        }
    }
}

impl From<db::OptionInfo> for websocket_api::OptionInfo {
    fn from(info: db::OptionInfo) -> Self {
        Self {
            underlying_market_id: info.underlying_market_id,
            strike_price: info.strike_price.0.try_into().unwrap(),
            is_call: info.is_call,
            expiration_date: info.expiration_date.map(db_to_ws_timestamp),
        }
    }
}

impl From<db::OptionContract> for websocket_api::OptionContract {
    fn from(contract: db::OptionContract) -> Self {
        Self {
            id: contract.id,
            option_market_id: contract.option_market_id,
            buyer_id: contract.buyer_id,
            writer_id: contract.writer_id,
            remaining_amount: contract.remaining_amount.0.try_into().unwrap(),
        }
    }
}

impl From<db::OptionExerciseResult> for websocket_api::OptionExercised {
    fn from(result: db::OptionExerciseResult) -> Self {
        Self {
            transaction_id: result.transaction_info.id,
            transaction_timestamp: Some(db_to_ws_timestamp(result.transaction_info.timestamp)),
            option_market_id: result.option_market_id,
            exerciser_id: result.exerciser_id,
            counterparty_id: result.counterparty_id,
            amount: result.amount.0.try_into().unwrap(),
            is_cash_settled: result.is_cash_settled,
            contract_id: result.contract_id,
        }
    }
}

impl From<db::MarketType> for websocket_api::MarketType {
    fn from(
        db::MarketType {
            id,
            name,
            description,
            public,
        }: db::MarketType,
    ) -> Self {
        Self {
            id,
            name,
            description,
            public,
        }
    }
}

impl From<db::MarketGroup> for websocket_api::MarketGroup {
    fn from(
        db::MarketGroup {
            id,
            name,
            description,
            type_id,
        }: db::MarketGroup,
    ) -> Self {
        Self {
            id,
            name,
            description,
            type_id,
        }
    }
}

impl From<db::AuctionBuyer> for websocket_api::AuctionBuyer {
    fn from(b: db::AuctionBuyer) -> Self {
        Self {
            account_id: b.account_id,
            amount: b.amount.0.try_into().unwrap(),
        }
    }
}

impl From<db::AuctionWithBuyers> for websocket_api::Auction {
    fn from(db::AuctionWithBuyers { auction, buyers }: db::AuctionWithBuyers) -> Self {
        use websocket_api::auction::{Closed, Open, Status};
        let db::Auction {
            id,
            name,
            description,
            owner_id,
            buyer_id,
            transaction_id,
            transaction_timestamp,
            settled_price,
            image_filename,
            bin_price,
        } = auction;
        Self {
            id,
            name,
            description,
            transaction_id,
            transaction_timestamp: transaction_timestamp.map(db_to_ws_timestamp),
            owner_id,
            buyer_id,
            status: Some(match settled_price {
                Some(settled_price) => Status::Closed(Closed {
                    settle_price: settled_price.0.try_into().unwrap(),
                }),
                _ => Status::Open(Open {}),
            }),
            image_url: image_filename.map(|filename| format!("/images/{filename}")),
            bin_price: bin_price.map(|bin_price| bin_price.0.try_into().unwrap()),
            buyers: buyers
                .into_iter()
                .map(websocket_api::AuctionBuyer::from)
                .collect(),
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
            buyer_is_taker,
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
            buyer_is_taker,
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
    fn from(
        db::Account {
            id,
            name,
            is_user,
            universe_id,
            color,
        }: db::Account,
    ) -> Self {
        Self {
            id,
            name,
            is_user,
            universe_id,
            color,
        }
    }
}

impl From<db::Universe> for websocket_api::Universe {
    fn from(db::Universe { id, name, description, owner_id }: db::Universe) -> Self {
        Self {
            id,
            name,
            description,
            owner_id: owner_id.unwrap_or(0),
        }
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

impl From<db::Trades> for websocket_api::Trades {
    fn from(
        db::Trades {
            market_id,
            trades,
            has_full_history,
            redemptions,
        }: db::Trades,
    ) -> Self {
        Self {
            market_id,
            trades: trades.into_iter().map(websocket_api::Trade::from).collect(),
            has_full_history,
            redemptions: redemptions
                .into_iter()
                .map(websocket_api::Redeemed::from)
                .collect(),
        }
    }
}

impl From<db::Orders> for websocket_api::Orders {
    fn from(
        db::Orders {
            market_id,
            orders,
            has_full_history,
        }: db::Orders,
    ) -> Self {
        Self {
            market_id,
            orders: orders.into_iter().map(websocket_api::Order::from).collect(),
            has_full_history,
        }
    }
}

impl From<db::OrderCreated> for websocket_api::OrderCreated {
    fn from(
        db::OrderCreated {
            market_id,
            account_id,
            order,
            fills,
            trades,
            transaction_info,
        }: db::OrderCreated,
    ) -> Self {
        let order = order.map(|order| {
            let mut order = websocket_api::Order::from(order);
            order.sizes = vec![websocket_api::Size {
                transaction_id: transaction_info.id,
                transaction_timestamp: Some(db_to_ws_timestamp(transaction_info.timestamp)),
                size: order.size,
            }];
            order
        });
        Self {
            market_id,
            account_id,
            order,
            fills: fills
                .into_iter()
                .map(websocket_api::order_created::OrderFill::from)
                .collect(),
            trades: trades.into_iter().map(websocket_api::Trade::from).collect(),
            transaction_id: transaction_info.id,
            transaction_timestamp: Some(db_to_ws_timestamp(transaction_info.timestamp)),
        }
    }
}

impl From<db::OrderCancelled> for websocket_api::OrdersCancelled {
    fn from(
        db::OrderCancelled {
            order_id,
            market_id,
            transaction_info,
        }: db::OrderCancelled,
    ) -> Self {
        Self {
            order_ids: vec![order_id],
            market_id,
            transaction_id: transaction_info.id,
            transaction_timestamp: Some(db_to_ws_timestamp(transaction_info.timestamp)),
        }
    }
}

impl From<db::OrdersCancelled> for websocket_api::OrdersCancelled {
    fn from(
        db::OrdersCancelled {
            orders_affected,
            market_id,
            transaction_info,
        }: db::OrdersCancelled,
    ) -> Self {
        Self {
            order_ids: orders_affected,
            market_id,
            transaction_id: transaction_info.id,
            transaction_timestamp: Some(db_to_ws_timestamp(transaction_info.timestamp)),
        }
    }
}

impl From<db::Redeemed> for websocket_api::Redeemed {
    fn from(
        db::Redeemed {
            account_id,
            fund_id,
            amount,
            transaction_info,
        }: db::Redeemed,
    ) -> Self {
        Self {
            account_id,
            fund_id,
            amount: amount.0.try_into().unwrap(),
            transaction_id: transaction_info.id,
            transaction_timestamp: Some(db_to_ws_timestamp(transaction_info.timestamp)),
        }
    }
}

impl From<db::MarketSettled> for websocket_api::MarketSettled {
    fn from(
        db::MarketSettled {
            id,
            settle_price,
            transaction_info,
        }: db::MarketSettled,
    ) -> Self {
        Self {
            id,
            settle_price: settle_price.0.try_into().unwrap(),
            transaction_id: transaction_info.id,
            transaction_timestamp: Some(db_to_ws_timestamp(transaction_info.timestamp)),
        }
    }
}

impl From<db::AuctionSettled> for websocket_api::AuctionSettled {
    fn from(
        db::AuctionSettled {
            id,
            buyer_id,
            settle_price,
            transaction_info,
            buyers,
        }: db::AuctionSettled,
    ) -> Self {
        Self {
            id,
            buyer_id,
            settle_price: settle_price.0.try_into().unwrap(),
            transaction_id: transaction_info.id,
            transaction_timestamp: Some(db_to_ws_timestamp(transaction_info.timestamp)),
            buyers: buyers
                .into_iter()
                .map(websocket_api::AuctionBuyer::from)
                .collect(),
        }
    }
}

#[must_use]
pub fn db_to_ws_timestamp(timestamp: OffsetDateTime) -> Timestamp {
    Timestamp::from(SystemTime::from(timestamp))
}
