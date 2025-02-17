#!/bin/bash

mkdir -p historical_data

curl -L https://gist.githubusercontent.com/nicholascc/39df3671b93665861a69e295bcaa50ca/raw/93cd0147900fc822b758ea6df0d19ac4c41b8c95/orders.csv -o historical_data/orders.csv
curl -L https://gist.githubusercontent.com/nicholascc/39df3671b93665861a69e295bcaa50ca/raw/93cd0147900fc822b758ea6df0d19ac4c41b8c95/trades.csv -o historical_data/trades.csv

echo "Files downloaded successfully to historical_data/"