# neg: sell, pos: buy
agg_market_name_len = 13
transaction_fee = 1
multiplier = 10
arbs = [
    {
        'delta_tradewars': 0.1,
        'echo_tradewars': 0.1,
        'foxtrot_tradewars': 0.4,
        'def_tradewars': -0.1
    },
    {
        'delta_tradewars': -0.1,
        'echo_tradewars': -0.1,
        'foxtrot_tradewars': -0.4,
        'def_tradewars': 0.1
    },
    {
        'golf_tradewars': 0.3,
        'hotel_tradewars': 0.2,
        'india_tradewars': 0.1,
        'ghi_tradewars': -0.1
    },
    {
        'golf_tradewars': -0.3,
        'hotel_tradewars': -0.2,
        'india_tradewars': -0.1,
        'ghi_tradewars': 0.1
    },
    # {
    #     'alpha_tradewars': 0.2,
    #     'bravo_tradewars': 0.2,
    #     'charlie_tradewars': 0.2,
    #     'abc_tradewars': -0.1
    # },
    # {
    #     'alpha_tradewars': -0.2,
    #     'bravo_tradewars': -0.2,
    #     'charlie_tradewars': -0.2,
    #     'abc_tradewars': 0.1
    # },
]
