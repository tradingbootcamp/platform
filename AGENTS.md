# Repository Analysis

This repository contains the source code for a quantitative trading bootcamp platform. The platform is composed of several components that work together to create a simulated trading environment.

## Components

The repository is a monorepo containing the following packages:

- **`backend`**: A Rust-based application that serves as the core of the platform. It handles user authentication, market creation, order matching, and trade execution. It uses a SQLite database for persistence.

- **`frontend`**: A SvelteKit and TypeScript application that provides the main web interface for the platform. Users can interact with the platform, view markets, and manage their accounts through this interface.

- **`python-client`**: A Python client that allows users to write and run automated trading bots. It provides a simple interface for interacting with the platform's API. The client uses Protocol Buffers to communicate with the backend.

- **`client-web`**: A simple React-based web client that can be used as a starting point for building custom user interfaces.

- **`team-allocation`**: A React-based application using TanStack Router and Tailwind CSS. Its specific purpose is not immediately clear from the file structure, but it appears to be a tool for allocating users to teams.

- **`schema`**: This directory contains the Protocol Buffer definitions that define the API for communication between the backend and the clients. The schema defines messages for actions such as creating markets, placing orders, and managing user accounts.

- **`schema-js`**: A JavaScript/TypeScript package generated from the `schema` directory. This package is used by the web frontends to interact with the backend.

## Functionality

The platform provides the following core functionalities:

- **User Authentication**: Users can create accounts and log in to the platform.
- **Market Creation**: Users can create new trading markets.
- **Order Management**: Users can place, view, and cancel orders.
- **Trading**: The platform matches buy and sell orders to execute trades.
- **Auctions**: The platform supports externally settled auctions.
- **Portfolio Management**: Users can view their account balances and portfolio of assets.
- **Bots**: Users can write and run automated trading bots using the Python client.
