# Trading Bootcamp Python Client

Write your trading bot with Python!

## Setup

- Make sure you have Python 3.8 or higher installed.
- Use git to clone this repository and navigate to the client-py directory.
- Install the required packages with `pip install -r requirements.txt`.
- Make a copy of example.env and rename it to .env. Then set the environment variables:
  - JWT and ID_JWT: log in to the website, open the dev console, and search for the "auth" info log.
  - ACT_AS: You can leave this empty if you want to act as yourself, but otherwise you'll need to act as the bot in the website and look in the dev console for the actingAs log. You'll then copy the id from that log.
- Now run either naive_bot.py or market_maker_bot.py. Both are self-contained examples. The naive bot is a simple starting point, while the market maker bot shows more complex functionality.
