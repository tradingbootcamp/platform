import streamlit as st
import numpy as np
import pandas as pd
from datetime import datetime

from dotenv import load_dotenv
from metagame import TradingClient
import os

load_dotenv()

act_as_str = os.environ["ACT_AS"]
act_as = int(act_as_str)

st.text(f"Acting as: {act_as}")

client = TradingClient(
    api_url=os.environ["API_URL"],
    jwt=os.environ["JWT"],
    act_as=int(act_as),
)

import pandas as pd


def get_market_trades(market_name: str):
    state = client.state()
    market_id = state.market_name_to_id.get(market_name)
    if market_id is None:
        return pd.DataFrame()

    if not state.markets[market_id].hasFullTradeHistory:
        client.get_full_trade_history(market_id)
        state = client.state()

    trades = state.markets[market_id].trades
    if not trades:
        return pd.DataFrame()
    df = pd.DataFrame(trades).set_index("id")
    df["buyer"] = df["buyer_id"].map(lambda x: state.accounts[x].name)
    df["seller"] = df["seller_id"].map(lambda x: state.accounts[x].name)
    df["timestamp"] = df["transaction_id"].map(lambda x: state.transactions[x])
    return df  # .drop(columns=["market_id", "buyer_id", "seller_id", "transaction_id"])


def get_market_trades_by_market_id(market_id: int):
    state = client.state()
    if not state.markets[market_id].hasFullTradeHistory:
        client.get_full_trade_history(market_id)
        state = client.state()

    trades = state.markets[market_id].trades
    if not trades:
        return pd.DataFrame()
    df = pd.DataFrame(trades).set_index("id")
    df["buyer"] = df["buyer_id"].map(lambda x: state.accounts[x].name)
    df["seller"] = df["seller_id"].map(lambda x: state.accounts[x].name)
    df["timestamp"] = df["transaction_id"].map(lambda x: state.transactions[x])
    return df  # .drop(columns=["market_id", "buyer_id", "seller_id", "transaction_id"])


# Set page title
st.title("Time and sales")

# Initialize session state if not already done
if "trade_history" not in st.session_state:
    st.session_state.trade_history = []

# Create sidebar for inputs
with st.sidebar:
    st.header("Trading Controls")

    state = client.state()
    market_name_to_id = state.market_name_to_id
    # print(market_name_to_id)
    market = st.selectbox("Market", sorted(list(market_name_to_id.keys())))
    market_id = market_name_to_id[market]
    market_state = state.markets[market_id]
    print(market_state.definition)
    settlement_price = market_state.definition.closed.settle_price
    st.text(f"{market_id} settlement price {settlement_price}")

    # Strategy selector
    strategy = st.selectbox(
        "Select Trading Strategy",
        ["Market Making", "Trend Following", "Mean Reversion", "Custom"],
    )

    # Number of contracts
    contracts = st.number_input(
        "Number of Contracts", min_value=1, max_value=100, value=1
    )

    # Price input
    price = st.number_input(
        "Price per Contract",
        min_value=0.01,
        max_value=10000.0,
        value=100.0,
        format="%.2f",
    )

    # Buy/Sell buttons in columns
    col1, col2 = st.columns(2)
    with col1:
        buy_button = st.button("Buy", type="primary")
    with col2:
        sell_button = st.button("Sell", type="secondary")

# Main content area
# st.header("Position Overview")
# total_value = price * contracts
# st.metric("Total Trade Value", f"${total_value:,.2f}")

# Handle trading actions
if buy_button or sell_button:
    action = "BUY" if buy_button else "SELL"
    trade = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "action": action,
        "strategy": strategy,
        "contracts": contracts,
        "price": price,
        "total_value": total_value,
    }
    st.session_state.trade_history.append(trade)

    st.success(f"{action} order executed: {contracts} contracts at ${price:,.2f}")

# Display trade history
st.header("Trade History")
if st.session_state.trade_history:
    df = pd.DataFrame(st.session_state.trade_history)
    st.dataframe(df, hide_index=True)
else:
    st.info("No trades executed yet.")

# Strategy information
# st.header("Strategy Information")
# strategy_info = {
#    "Market Making": "Provides liquidity by simultaneously quoting buy and sell prices.",
#    "Trend Following": "Aims to capture gains through long or short positions in trending markets.",
#    "Mean Reversion": "Capitalizes on asset prices tendency to return to their average.",
#    "Custom": "User-defined trading strategy.",
# }
# st.write(strategy_info[strategy])

st.write(f"market id {market_id} settled at {settlement_price}")
try:
    trades = get_market_trades_by_market_id(market_id)
except e:
    trades = None

if trades is None:
    exit()

# Replace 'your_id' with your actual ID and 'settlement_price' with the actual settlement price
your_id = 98
# settlement_price = 7.0

# Filter trades where you are the buyer or seller
my_trades = trades[(trades["buyer_id"] == your_id) | (trades["seller_id"] == your_id)]

# Calculate P&L
my_trades["pnl"] = my_trades.apply(
    lambda row: (settlement_price - row["price"]) * row["size"]
    if row["buyer"] == your_id
    else (row["price"] - settlement_price) * row["size"],
    axis=1,
)

# display(my_trades)

# Sum the P&L
total_pnl = my_trades["pnl"].sum()
st.text(f"Total P&L: {total_pnl}")

st.title("Depth of Market (DOM)")


def generate_market_data(base_price=100.00, levels=20):
    prices = [round(base_price + (i - levels // 2) * 0.05, 2) for i in range(levels)]

    data = {
        "Bid Size": np.random.randint(1, 100, levels),
        "Price": prices,
        "Ask Size": np.random.randint(1, 100, levels),
        "Total Traded": np.random.randint(0, 200, levels),
    }

    return pd.DataFrame(data)


# Generate initial data
if "market_data" not in st.session_state:
    st.session_state.market_data = generate_market_data()
    st.session_state.last_price = 100.00


if st.button("Refresh Data"):
    # Simulate price movement
    price_change = np.random.choice([-0.05, 0, 0.05])
    new_base_price = st.session_state.last_price + price_change
    st.session_state.market_data = generate_market_data(new_base_price)
    st.session_state.last_price = new_base_price

# Display DOM
col1, col2, col3 = st.columns([2, 4, 2])

with col2:
    # Style the dataframe
    def highlight_row(row):
        mid_price = st.session_state.last_price
        if row["Price"] == mid_price:
            return ["background-color: #e6f3ff"] * len(row)
        return [""] * len(row)

    # Format and display the data
    styled_df = st.session_state.market_data.style.apply(highlight_row, axis=1).format(
        {
            "Bid Size": "{:,d}",
            "Price": "${:.2f}",
            "Ask Size": "{:,d}",
            "Total Traded": "{:,d}",
        }
    )

    st.dataframe(styled_df, height=400, use_container_width=True)

# Add some market statistics
with st.expander("Market Statistics"):
    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric(
            "Total Bid Volume", f"{st.session_state.market_data['Bid Size'].sum():,}"
        )

    with col2:
        st.metric(
            "Total Ask Volume", f"{st.session_state.market_data['Ask Size'].sum():,}"
        )

    with col3:
        st.metric(
            "Total Traded Volume",
            f"{st.session_state.market_data['Total Traded'].sum():,}",
        )


st.dataframe(
    my_trades,
    #    column_config={
    #        'Symbol': st.column_config.TextColumn('Symbol', width='medium'),
    #        'Last Price': st.column_config.TextColumn('Last Price', width='medium'),
    #        'Change %': st.column_config.TextColumn('Change %', width='medium'),
    #        'Volume': st.column_config.TextColumn('Volume', width='medium'),
    #        'Bid': st.column_config.TextColumn('Bid', width='medium'),
    #        'Ask': st.column_config.TextColumn('Ask', width='medium')
    #    },
    #    hide_index=True,
    use_container_width=True,
)
