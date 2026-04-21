# MetaGame Trading Bootcamp Python Client

Write your trading bot with Python!

## Dependencies
- python
- uv (which figures out all the python dependencies)

### Installing uv

Install uv with the standalone installers:

```bash
# On macOS and Linux.
curl -LsSf https://astral.sh/uv/install.sh | sh
```

```bash
# On Windows.
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Or, from [PyPI](https://pypi.org/project/uv/):

```bash
# With pip.
pip install uv
```

```bash
# Or pipx.
pipx install uv
```

## Using bots

This following may not work on Windows without WSL.

0. `git clone https://github.com/tradingbootcamp/platform && cd python-client`
1. Install the dependencies with `uv sync`
2. Copy `example.env` to `.env`
3. Go to the "Accounts" page on the exchange and copy your JWT into `.env`
4. Make sure you are acting as the account you are going to be trading from, then copy the ACT_AS into `.env`
5. Set `API_URL` to the base server URL (e.g. `https://trading-bootcamp.fly.dev`)
6. Optionally set `COHORT` to the cohort name you want to connect to. If omitted, the server's default cohort is used.

You can test if it is working by running
```
uv run examples/min_max_bot.py "<name of market>"
```
This command places orders at the min and max settlement prices, so you shouldn't be risking any capital.

You can look at other example bots in examples/, like the code for an (older?) version of mark (`market_maker_bot.py`) and bob (`naive.py`).

You can also use `list_cohorts()` to discover available cohorts programmatically:
```python
from metagame import list_cohorts
info = list_cohorts("https://trading-bootcamp.fly.dev", jwt)
print(info["cohorts"])  # Available cohorts
print(info["default_cohort"])  # Server default cohort name
```

You can figure out the Jupyter Notebook if you wish.
