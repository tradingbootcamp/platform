/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.websocket_api = (function() {

    /**
     * Namespace websocket_api.
     * @exports websocket_api
     * @namespace
     */
    var websocket_api = {};

    websocket_api.ServerMessage = (function() {

        /**
         * Properties of a ServerMessage.
         * @memberof websocket_api
         * @interface IServerMessage
         * @property {string|null} [requestId] ServerMessage requestId
         * @property {websocket_api.IPortfolio|null} [portfolioUpdated] ServerMessage portfolioUpdated
         * @property {websocket_api.IPortfolios|null} [portfolios] ServerMessage portfolios
         * @property {websocket_api.IMarket|null} [market] ServerMessage market
         * @property {websocket_api.IMarketSettled|null} [marketSettled] ServerMessage marketSettled
         * @property {websocket_api.IOrderCreated|null} [orderCreated] ServerMessage orderCreated
         * @property {websocket_api.IOrdersCancelled|null} [ordersCancelled] ServerMessage ordersCancelled
         * @property {websocket_api.ITransfers|null} [transfers] ServerMessage transfers
         * @property {websocket_api.ITransfer|null} [transferCreated] ServerMessage transferCreated
         * @property {websocket_api.IOut|null} [out] ServerMessage out
         * @property {websocket_api.IAuthenticated|null} [authenticated] ServerMessage authenticated
         * @property {websocket_api.IRequestFailed|null} [requestFailed] ServerMessage requestFailed
         * @property {websocket_api.IAccount|null} [accountCreated] ServerMessage accountCreated
         * @property {websocket_api.IAccounts|null} [accounts] ServerMessage accounts
         * @property {websocket_api.IActingAs|null} [actingAs] ServerMessage actingAs
         * @property {websocket_api.IOwnershipGiven|null} [ownershipGiven] ServerMessage ownershipGiven
         * @property {websocket_api.IRedeemed|null} [redeemed] ServerMessage redeemed
         * @property {websocket_api.IOrders|null} [orders] ServerMessage orders
         * @property {websocket_api.ITrades|null} [trades] ServerMessage trades
         * @property {websocket_api.ITransactions|null} [transactions] ServerMessage transactions
         */

        /**
         * Constructs a new ServerMessage.
         * @memberof websocket_api
         * @classdesc Represents a ServerMessage.
         * @implements IServerMessage
         * @constructor
         * @param {websocket_api.IServerMessage=} [properties] Properties to set
         */
        function ServerMessage(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ServerMessage requestId.
         * @member {string} requestId
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.requestId = "";

        /**
         * ServerMessage portfolioUpdated.
         * @member {websocket_api.IPortfolio|null|undefined} portfolioUpdated
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.portfolioUpdated = null;

        /**
         * ServerMessage portfolios.
         * @member {websocket_api.IPortfolios|null|undefined} portfolios
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.portfolios = null;

        /**
         * ServerMessage market.
         * @member {websocket_api.IMarket|null|undefined} market
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.market = null;

        /**
         * ServerMessage marketSettled.
         * @member {websocket_api.IMarketSettled|null|undefined} marketSettled
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.marketSettled = null;

        /**
         * ServerMessage orderCreated.
         * @member {websocket_api.IOrderCreated|null|undefined} orderCreated
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.orderCreated = null;

        /**
         * ServerMessage ordersCancelled.
         * @member {websocket_api.IOrdersCancelled|null|undefined} ordersCancelled
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.ordersCancelled = null;

        /**
         * ServerMessage transfers.
         * @member {websocket_api.ITransfers|null|undefined} transfers
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.transfers = null;

        /**
         * ServerMessage transferCreated.
         * @member {websocket_api.ITransfer|null|undefined} transferCreated
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.transferCreated = null;

        /**
         * ServerMessage out.
         * @member {websocket_api.IOut|null|undefined} out
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.out = null;

        /**
         * ServerMessage authenticated.
         * @member {websocket_api.IAuthenticated|null|undefined} authenticated
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.authenticated = null;

        /**
         * ServerMessage requestFailed.
         * @member {websocket_api.IRequestFailed|null|undefined} requestFailed
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.requestFailed = null;

        /**
         * ServerMessage accountCreated.
         * @member {websocket_api.IAccount|null|undefined} accountCreated
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.accountCreated = null;

        /**
         * ServerMessage accounts.
         * @member {websocket_api.IAccounts|null|undefined} accounts
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.accounts = null;

        /**
         * ServerMessage actingAs.
         * @member {websocket_api.IActingAs|null|undefined} actingAs
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.actingAs = null;

        /**
         * ServerMessage ownershipGiven.
         * @member {websocket_api.IOwnershipGiven|null|undefined} ownershipGiven
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.ownershipGiven = null;

        /**
         * ServerMessage redeemed.
         * @member {websocket_api.IRedeemed|null|undefined} redeemed
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.redeemed = null;

        /**
         * ServerMessage orders.
         * @member {websocket_api.IOrders|null|undefined} orders
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.orders = null;

        /**
         * ServerMessage trades.
         * @member {websocket_api.ITrades|null|undefined} trades
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.trades = null;

        /**
         * ServerMessage transactions.
         * @member {websocket_api.ITransactions|null|undefined} transactions
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.transactions = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * ServerMessage message.
         * @member {"portfolioUpdated"|"portfolios"|"market"|"marketSettled"|"orderCreated"|"ordersCancelled"|"transfers"|"transferCreated"|"out"|"authenticated"|"requestFailed"|"accountCreated"|"accounts"|"actingAs"|"ownershipGiven"|"redeemed"|"orders"|"trades"|"transactions"|undefined} message
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        Object.defineProperty(ServerMessage.prototype, "message", {
            get: $util.oneOfGetter($oneOfFields = ["portfolioUpdated", "portfolios", "market", "marketSettled", "orderCreated", "ordersCancelled", "transfers", "transferCreated", "out", "authenticated", "requestFailed", "accountCreated", "accounts", "actingAs", "ownershipGiven", "redeemed", "orders", "trades", "transactions"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new ServerMessage instance using the specified properties.
         * @function create
         * @memberof websocket_api.ServerMessage
         * @static
         * @param {websocket_api.IServerMessage=} [properties] Properties to set
         * @returns {websocket_api.ServerMessage} ServerMessage instance
         */
        ServerMessage.create = function create(properties) {
            return new ServerMessage(properties);
        };

        /**
         * Encodes the specified ServerMessage message. Does not implicitly {@link websocket_api.ServerMessage.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.ServerMessage
         * @static
         * @param {websocket_api.IServerMessage} message ServerMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ServerMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.portfolioUpdated != null && Object.hasOwnProperty.call(message, "portfolioUpdated"))
                $root.websocket_api.Portfolio.encode(message.portfolioUpdated, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.portfolios != null && Object.hasOwnProperty.call(message, "portfolios"))
                $root.websocket_api.Portfolios.encode(message.portfolios, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.market != null && Object.hasOwnProperty.call(message, "market"))
                $root.websocket_api.Market.encode(message.market, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.marketSettled != null && Object.hasOwnProperty.call(message, "marketSettled"))
                $root.websocket_api.MarketSettled.encode(message.marketSettled, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.orderCreated != null && Object.hasOwnProperty.call(message, "orderCreated"))
                $root.websocket_api.OrderCreated.encode(message.orderCreated, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.ordersCancelled != null && Object.hasOwnProperty.call(message, "ordersCancelled"))
                $root.websocket_api.OrdersCancelled.encode(message.ordersCancelled, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.transfers != null && Object.hasOwnProperty.call(message, "transfers"))
                $root.websocket_api.Transfers.encode(message.transfers, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.transferCreated != null && Object.hasOwnProperty.call(message, "transferCreated"))
                $root.websocket_api.Transfer.encode(message.transferCreated, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.out != null && Object.hasOwnProperty.call(message, "out"))
                $root.websocket_api.Out.encode(message.out, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.authenticated != null && Object.hasOwnProperty.call(message, "authenticated"))
                $root.websocket_api.Authenticated.encode(message.authenticated, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            if (message.requestFailed != null && Object.hasOwnProperty.call(message, "requestFailed"))
                $root.websocket_api.RequestFailed.encode(message.requestFailed, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
            if (message.accountCreated != null && Object.hasOwnProperty.call(message, "accountCreated"))
                $root.websocket_api.Account.encode(message.accountCreated, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
            if (message.accounts != null && Object.hasOwnProperty.call(message, "accounts"))
                $root.websocket_api.Accounts.encode(message.accounts, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
            if (message.actingAs != null && Object.hasOwnProperty.call(message, "actingAs"))
                $root.websocket_api.ActingAs.encode(message.actingAs, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
            if (message.ownershipGiven != null && Object.hasOwnProperty.call(message, "ownershipGiven"))
                $root.websocket_api.OwnershipGiven.encode(message.ownershipGiven, writer.uint32(/* id 17, wireType 2 =*/138).fork()).ldelim();
            if (message.redeemed != null && Object.hasOwnProperty.call(message, "redeemed"))
                $root.websocket_api.Redeemed.encode(message.redeemed, writer.uint32(/* id 18, wireType 2 =*/146).fork()).ldelim();
            if (message.requestId != null && Object.hasOwnProperty.call(message, "requestId"))
                writer.uint32(/* id 19, wireType 2 =*/154).string(message.requestId);
            if (message.orders != null && Object.hasOwnProperty.call(message, "orders"))
                $root.websocket_api.Orders.encode(message.orders, writer.uint32(/* id 20, wireType 2 =*/162).fork()).ldelim();
            if (message.trades != null && Object.hasOwnProperty.call(message, "trades"))
                $root.websocket_api.Trades.encode(message.trades, writer.uint32(/* id 21, wireType 2 =*/170).fork()).ldelim();
            if (message.transactions != null && Object.hasOwnProperty.call(message, "transactions"))
                $root.websocket_api.Transactions.encode(message.transactions, writer.uint32(/* id 22, wireType 2 =*/178).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified ServerMessage message, length delimited. Does not implicitly {@link websocket_api.ServerMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.ServerMessage
         * @static
         * @param {websocket_api.IServerMessage} message ServerMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ServerMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ServerMessage message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.ServerMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.ServerMessage} ServerMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ServerMessage.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.ServerMessage();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 19: {
                        message.requestId = reader.string();
                        break;
                    }
                case 1: {
                        message.portfolioUpdated = $root.websocket_api.Portfolio.decode(reader, reader.uint32());
                        break;
                    }
                case 2: {
                        message.portfolios = $root.websocket_api.Portfolios.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.market = $root.websocket_api.Market.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.marketSettled = $root.websocket_api.MarketSettled.decode(reader, reader.uint32());
                        break;
                    }
                case 5: {
                        message.orderCreated = $root.websocket_api.OrderCreated.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.ordersCancelled = $root.websocket_api.OrdersCancelled.decode(reader, reader.uint32());
                        break;
                    }
                case 7: {
                        message.transfers = $root.websocket_api.Transfers.decode(reader, reader.uint32());
                        break;
                    }
                case 8: {
                        message.transferCreated = $root.websocket_api.Transfer.decode(reader, reader.uint32());
                        break;
                    }
                case 9: {
                        message.out = $root.websocket_api.Out.decode(reader, reader.uint32());
                        break;
                    }
                case 10: {
                        message.authenticated = $root.websocket_api.Authenticated.decode(reader, reader.uint32());
                        break;
                    }
                case 11: {
                        message.requestFailed = $root.websocket_api.RequestFailed.decode(reader, reader.uint32());
                        break;
                    }
                case 12: {
                        message.accountCreated = $root.websocket_api.Account.decode(reader, reader.uint32());
                        break;
                    }
                case 13: {
                        message.accounts = $root.websocket_api.Accounts.decode(reader, reader.uint32());
                        break;
                    }
                case 14: {
                        message.actingAs = $root.websocket_api.ActingAs.decode(reader, reader.uint32());
                        break;
                    }
                case 17: {
                        message.ownershipGiven = $root.websocket_api.OwnershipGiven.decode(reader, reader.uint32());
                        break;
                    }
                case 18: {
                        message.redeemed = $root.websocket_api.Redeemed.decode(reader, reader.uint32());
                        break;
                    }
                case 20: {
                        message.orders = $root.websocket_api.Orders.decode(reader, reader.uint32());
                        break;
                    }
                case 21: {
                        message.trades = $root.websocket_api.Trades.decode(reader, reader.uint32());
                        break;
                    }
                case 22: {
                        message.transactions = $root.websocket_api.Transactions.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ServerMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.ServerMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.ServerMessage} ServerMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ServerMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ServerMessage message.
         * @function verify
         * @memberof websocket_api.ServerMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ServerMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.requestId != null && message.hasOwnProperty("requestId"))
                if (!$util.isString(message.requestId))
                    return "requestId: string expected";
            if (message.portfolioUpdated != null && message.hasOwnProperty("portfolioUpdated")) {
                properties.message = 1;
                {
                    var error = $root.websocket_api.Portfolio.verify(message.portfolioUpdated);
                    if (error)
                        return "portfolioUpdated." + error;
                }
            }
            if (message.portfolios != null && message.hasOwnProperty("portfolios")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Portfolios.verify(message.portfolios);
                    if (error)
                        return "portfolios." + error;
                }
            }
            if (message.market != null && message.hasOwnProperty("market")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Market.verify(message.market);
                    if (error)
                        return "market." + error;
                }
            }
            if (message.marketSettled != null && message.hasOwnProperty("marketSettled")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.MarketSettled.verify(message.marketSettled);
                    if (error)
                        return "marketSettled." + error;
                }
            }
            if (message.orderCreated != null && message.hasOwnProperty("orderCreated")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.OrderCreated.verify(message.orderCreated);
                    if (error)
                        return "orderCreated." + error;
                }
            }
            if (message.ordersCancelled != null && message.hasOwnProperty("ordersCancelled")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.OrdersCancelled.verify(message.ordersCancelled);
                    if (error)
                        return "ordersCancelled." + error;
                }
            }
            if (message.transfers != null && message.hasOwnProperty("transfers")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Transfers.verify(message.transfers);
                    if (error)
                        return "transfers." + error;
                }
            }
            if (message.transferCreated != null && message.hasOwnProperty("transferCreated")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Transfer.verify(message.transferCreated);
                    if (error)
                        return "transferCreated." + error;
                }
            }
            if (message.out != null && message.hasOwnProperty("out")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Out.verify(message.out);
                    if (error)
                        return "out." + error;
                }
            }
            if (message.authenticated != null && message.hasOwnProperty("authenticated")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Authenticated.verify(message.authenticated);
                    if (error)
                        return "authenticated." + error;
                }
            }
            if (message.requestFailed != null && message.hasOwnProperty("requestFailed")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.RequestFailed.verify(message.requestFailed);
                    if (error)
                        return "requestFailed." + error;
                }
            }
            if (message.accountCreated != null && message.hasOwnProperty("accountCreated")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Account.verify(message.accountCreated);
                    if (error)
                        return "accountCreated." + error;
                }
            }
            if (message.accounts != null && message.hasOwnProperty("accounts")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Accounts.verify(message.accounts);
                    if (error)
                        return "accounts." + error;
                }
            }
            if (message.actingAs != null && message.hasOwnProperty("actingAs")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.ActingAs.verify(message.actingAs);
                    if (error)
                        return "actingAs." + error;
                }
            }
            if (message.ownershipGiven != null && message.hasOwnProperty("ownershipGiven")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.OwnershipGiven.verify(message.ownershipGiven);
                    if (error)
                        return "ownershipGiven." + error;
                }
            }
            if (message.redeemed != null && message.hasOwnProperty("redeemed")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Redeemed.verify(message.redeemed);
                    if (error)
                        return "redeemed." + error;
                }
            }
            if (message.orders != null && message.hasOwnProperty("orders")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Orders.verify(message.orders);
                    if (error)
                        return "orders." + error;
                }
            }
            if (message.trades != null && message.hasOwnProperty("trades")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Trades.verify(message.trades);
                    if (error)
                        return "trades." + error;
                }
            }
            if (message.transactions != null && message.hasOwnProperty("transactions")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Transactions.verify(message.transactions);
                    if (error)
                        return "transactions." + error;
                }
            }
            return null;
        };

        /**
         * Creates a ServerMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.ServerMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.ServerMessage} ServerMessage
         */
        ServerMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.ServerMessage)
                return object;
            var message = new $root.websocket_api.ServerMessage();
            if (object.requestId != null)
                message.requestId = String(object.requestId);
            if (object.portfolioUpdated != null) {
                if (typeof object.portfolioUpdated !== "object")
                    throw TypeError(".websocket_api.ServerMessage.portfolioUpdated: object expected");
                message.portfolioUpdated = $root.websocket_api.Portfolio.fromObject(object.portfolioUpdated);
            }
            if (object.portfolios != null) {
                if (typeof object.portfolios !== "object")
                    throw TypeError(".websocket_api.ServerMessage.portfolios: object expected");
                message.portfolios = $root.websocket_api.Portfolios.fromObject(object.portfolios);
            }
            if (object.market != null) {
                if (typeof object.market !== "object")
                    throw TypeError(".websocket_api.ServerMessage.market: object expected");
                message.market = $root.websocket_api.Market.fromObject(object.market);
            }
            if (object.marketSettled != null) {
                if (typeof object.marketSettled !== "object")
                    throw TypeError(".websocket_api.ServerMessage.marketSettled: object expected");
                message.marketSettled = $root.websocket_api.MarketSettled.fromObject(object.marketSettled);
            }
            if (object.orderCreated != null) {
                if (typeof object.orderCreated !== "object")
                    throw TypeError(".websocket_api.ServerMessage.orderCreated: object expected");
                message.orderCreated = $root.websocket_api.OrderCreated.fromObject(object.orderCreated);
            }
            if (object.ordersCancelled != null) {
                if (typeof object.ordersCancelled !== "object")
                    throw TypeError(".websocket_api.ServerMessage.ordersCancelled: object expected");
                message.ordersCancelled = $root.websocket_api.OrdersCancelled.fromObject(object.ordersCancelled);
            }
            if (object.transfers != null) {
                if (typeof object.transfers !== "object")
                    throw TypeError(".websocket_api.ServerMessage.transfers: object expected");
                message.transfers = $root.websocket_api.Transfers.fromObject(object.transfers);
            }
            if (object.transferCreated != null) {
                if (typeof object.transferCreated !== "object")
                    throw TypeError(".websocket_api.ServerMessage.transferCreated: object expected");
                message.transferCreated = $root.websocket_api.Transfer.fromObject(object.transferCreated);
            }
            if (object.out != null) {
                if (typeof object.out !== "object")
                    throw TypeError(".websocket_api.ServerMessage.out: object expected");
                message.out = $root.websocket_api.Out.fromObject(object.out);
            }
            if (object.authenticated != null) {
                if (typeof object.authenticated !== "object")
                    throw TypeError(".websocket_api.ServerMessage.authenticated: object expected");
                message.authenticated = $root.websocket_api.Authenticated.fromObject(object.authenticated);
            }
            if (object.requestFailed != null) {
                if (typeof object.requestFailed !== "object")
                    throw TypeError(".websocket_api.ServerMessage.requestFailed: object expected");
                message.requestFailed = $root.websocket_api.RequestFailed.fromObject(object.requestFailed);
            }
            if (object.accountCreated != null) {
                if (typeof object.accountCreated !== "object")
                    throw TypeError(".websocket_api.ServerMessage.accountCreated: object expected");
                message.accountCreated = $root.websocket_api.Account.fromObject(object.accountCreated);
            }
            if (object.accounts != null) {
                if (typeof object.accounts !== "object")
                    throw TypeError(".websocket_api.ServerMessage.accounts: object expected");
                message.accounts = $root.websocket_api.Accounts.fromObject(object.accounts);
            }
            if (object.actingAs != null) {
                if (typeof object.actingAs !== "object")
                    throw TypeError(".websocket_api.ServerMessage.actingAs: object expected");
                message.actingAs = $root.websocket_api.ActingAs.fromObject(object.actingAs);
            }
            if (object.ownershipGiven != null) {
                if (typeof object.ownershipGiven !== "object")
                    throw TypeError(".websocket_api.ServerMessage.ownershipGiven: object expected");
                message.ownershipGiven = $root.websocket_api.OwnershipGiven.fromObject(object.ownershipGiven);
            }
            if (object.redeemed != null) {
                if (typeof object.redeemed !== "object")
                    throw TypeError(".websocket_api.ServerMessage.redeemed: object expected");
                message.redeemed = $root.websocket_api.Redeemed.fromObject(object.redeemed);
            }
            if (object.orders != null) {
                if (typeof object.orders !== "object")
                    throw TypeError(".websocket_api.ServerMessage.orders: object expected");
                message.orders = $root.websocket_api.Orders.fromObject(object.orders);
            }
            if (object.trades != null) {
                if (typeof object.trades !== "object")
                    throw TypeError(".websocket_api.ServerMessage.trades: object expected");
                message.trades = $root.websocket_api.Trades.fromObject(object.trades);
            }
            if (object.transactions != null) {
                if (typeof object.transactions !== "object")
                    throw TypeError(".websocket_api.ServerMessage.transactions: object expected");
                message.transactions = $root.websocket_api.Transactions.fromObject(object.transactions);
            }
            return message;
        };

        /**
         * Creates a plain object from a ServerMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.ServerMessage
         * @static
         * @param {websocket_api.ServerMessage} message ServerMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ServerMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.requestId = "";
            if (message.portfolioUpdated != null && message.hasOwnProperty("portfolioUpdated")) {
                object.portfolioUpdated = $root.websocket_api.Portfolio.toObject(message.portfolioUpdated, options);
                if (options.oneofs)
                    object.message = "portfolioUpdated";
            }
            if (message.portfolios != null && message.hasOwnProperty("portfolios")) {
                object.portfolios = $root.websocket_api.Portfolios.toObject(message.portfolios, options);
                if (options.oneofs)
                    object.message = "portfolios";
            }
            if (message.market != null && message.hasOwnProperty("market")) {
                object.market = $root.websocket_api.Market.toObject(message.market, options);
                if (options.oneofs)
                    object.message = "market";
            }
            if (message.marketSettled != null && message.hasOwnProperty("marketSettled")) {
                object.marketSettled = $root.websocket_api.MarketSettled.toObject(message.marketSettled, options);
                if (options.oneofs)
                    object.message = "marketSettled";
            }
            if (message.orderCreated != null && message.hasOwnProperty("orderCreated")) {
                object.orderCreated = $root.websocket_api.OrderCreated.toObject(message.orderCreated, options);
                if (options.oneofs)
                    object.message = "orderCreated";
            }
            if (message.ordersCancelled != null && message.hasOwnProperty("ordersCancelled")) {
                object.ordersCancelled = $root.websocket_api.OrdersCancelled.toObject(message.ordersCancelled, options);
                if (options.oneofs)
                    object.message = "ordersCancelled";
            }
            if (message.transfers != null && message.hasOwnProperty("transfers")) {
                object.transfers = $root.websocket_api.Transfers.toObject(message.transfers, options);
                if (options.oneofs)
                    object.message = "transfers";
            }
            if (message.transferCreated != null && message.hasOwnProperty("transferCreated")) {
                object.transferCreated = $root.websocket_api.Transfer.toObject(message.transferCreated, options);
                if (options.oneofs)
                    object.message = "transferCreated";
            }
            if (message.out != null && message.hasOwnProperty("out")) {
                object.out = $root.websocket_api.Out.toObject(message.out, options);
                if (options.oneofs)
                    object.message = "out";
            }
            if (message.authenticated != null && message.hasOwnProperty("authenticated")) {
                object.authenticated = $root.websocket_api.Authenticated.toObject(message.authenticated, options);
                if (options.oneofs)
                    object.message = "authenticated";
            }
            if (message.requestFailed != null && message.hasOwnProperty("requestFailed")) {
                object.requestFailed = $root.websocket_api.RequestFailed.toObject(message.requestFailed, options);
                if (options.oneofs)
                    object.message = "requestFailed";
            }
            if (message.accountCreated != null && message.hasOwnProperty("accountCreated")) {
                object.accountCreated = $root.websocket_api.Account.toObject(message.accountCreated, options);
                if (options.oneofs)
                    object.message = "accountCreated";
            }
            if (message.accounts != null && message.hasOwnProperty("accounts")) {
                object.accounts = $root.websocket_api.Accounts.toObject(message.accounts, options);
                if (options.oneofs)
                    object.message = "accounts";
            }
            if (message.actingAs != null && message.hasOwnProperty("actingAs")) {
                object.actingAs = $root.websocket_api.ActingAs.toObject(message.actingAs, options);
                if (options.oneofs)
                    object.message = "actingAs";
            }
            if (message.ownershipGiven != null && message.hasOwnProperty("ownershipGiven")) {
                object.ownershipGiven = $root.websocket_api.OwnershipGiven.toObject(message.ownershipGiven, options);
                if (options.oneofs)
                    object.message = "ownershipGiven";
            }
            if (message.redeemed != null && message.hasOwnProperty("redeemed")) {
                object.redeemed = $root.websocket_api.Redeemed.toObject(message.redeemed, options);
                if (options.oneofs)
                    object.message = "redeemed";
            }
            if (message.requestId != null && message.hasOwnProperty("requestId"))
                object.requestId = message.requestId;
            if (message.orders != null && message.hasOwnProperty("orders")) {
                object.orders = $root.websocket_api.Orders.toObject(message.orders, options);
                if (options.oneofs)
                    object.message = "orders";
            }
            if (message.trades != null && message.hasOwnProperty("trades")) {
                object.trades = $root.websocket_api.Trades.toObject(message.trades, options);
                if (options.oneofs)
                    object.message = "trades";
            }
            if (message.transactions != null && message.hasOwnProperty("transactions")) {
                object.transactions = $root.websocket_api.Transactions.toObject(message.transactions, options);
                if (options.oneofs)
                    object.message = "transactions";
            }
            return object;
        };

        /**
         * Converts this ServerMessage to JSON.
         * @function toJSON
         * @memberof websocket_api.ServerMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ServerMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ServerMessage
         * @function getTypeUrl
         * @memberof websocket_api.ServerMessage
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ServerMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.ServerMessage";
        };

        return ServerMessage;
    })();

    websocket_api.Authenticated = (function() {

        /**
         * Properties of an Authenticated.
         * @memberof websocket_api
         * @interface IAuthenticated
         * @property {number|Long|null} [accountId] Authenticated accountId
         */

        /**
         * Constructs a new Authenticated.
         * @memberof websocket_api
         * @classdesc Represents an Authenticated.
         * @implements IAuthenticated
         * @constructor
         * @param {websocket_api.IAuthenticated=} [properties] Properties to set
         */
        function Authenticated(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Authenticated accountId.
         * @member {number|Long} accountId
         * @memberof websocket_api.Authenticated
         * @instance
         */
        Authenticated.prototype.accountId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new Authenticated instance using the specified properties.
         * @function create
         * @memberof websocket_api.Authenticated
         * @static
         * @param {websocket_api.IAuthenticated=} [properties] Properties to set
         * @returns {websocket_api.Authenticated} Authenticated instance
         */
        Authenticated.create = function create(properties) {
            return new Authenticated(properties);
        };

        /**
         * Encodes the specified Authenticated message. Does not implicitly {@link websocket_api.Authenticated.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Authenticated
         * @static
         * @param {websocket_api.IAuthenticated} message Authenticated message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Authenticated.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.accountId != null && Object.hasOwnProperty.call(message, "accountId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.accountId);
            return writer;
        };

        /**
         * Encodes the specified Authenticated message, length delimited. Does not implicitly {@link websocket_api.Authenticated.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Authenticated
         * @static
         * @param {websocket_api.IAuthenticated} message Authenticated message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Authenticated.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Authenticated message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Authenticated
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Authenticated} Authenticated
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Authenticated.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Authenticated();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.accountId = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Authenticated message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Authenticated
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Authenticated} Authenticated
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Authenticated.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Authenticated message.
         * @function verify
         * @memberof websocket_api.Authenticated
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Authenticated.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.accountId != null && message.hasOwnProperty("accountId"))
                if (!$util.isInteger(message.accountId) && !(message.accountId && $util.isInteger(message.accountId.low) && $util.isInteger(message.accountId.high)))
                    return "accountId: integer|Long expected";
            return null;
        };

        /**
         * Creates an Authenticated message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Authenticated
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Authenticated} Authenticated
         */
        Authenticated.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Authenticated)
                return object;
            var message = new $root.websocket_api.Authenticated();
            if (object.accountId != null)
                if ($util.Long)
                    (message.accountId = $util.Long.fromValue(object.accountId)).unsigned = false;
                else if (typeof object.accountId === "string")
                    message.accountId = parseInt(object.accountId, 10);
                else if (typeof object.accountId === "number")
                    message.accountId = object.accountId;
                else if (typeof object.accountId === "object")
                    message.accountId = new $util.LongBits(object.accountId.low >>> 0, object.accountId.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from an Authenticated message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Authenticated
         * @static
         * @param {websocket_api.Authenticated} message Authenticated
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Authenticated.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.accountId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.accountId = options.longs === String ? "0" : 0;
            if (message.accountId != null && message.hasOwnProperty("accountId"))
                if (typeof message.accountId === "number")
                    object.accountId = options.longs === String ? String(message.accountId) : message.accountId;
                else
                    object.accountId = options.longs === String ? $util.Long.prototype.toString.call(message.accountId) : options.longs === Number ? new $util.LongBits(message.accountId.low >>> 0, message.accountId.high >>> 0).toNumber() : message.accountId;
            return object;
        };

        /**
         * Converts this Authenticated to JSON.
         * @function toJSON
         * @memberof websocket_api.Authenticated
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Authenticated.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Authenticated
         * @function getTypeUrl
         * @memberof websocket_api.Authenticated
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Authenticated.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Authenticated";
        };

        return Authenticated;
    })();

    websocket_api.ActingAs = (function() {

        /**
         * Properties of an ActingAs.
         * @memberof websocket_api
         * @interface IActingAs
         * @property {number|Long|null} [accountId] ActingAs accountId
         */

        /**
         * Constructs a new ActingAs.
         * @memberof websocket_api
         * @classdesc Represents an ActingAs.
         * @implements IActingAs
         * @constructor
         * @param {websocket_api.IActingAs=} [properties] Properties to set
         */
        function ActingAs(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ActingAs accountId.
         * @member {number|Long} accountId
         * @memberof websocket_api.ActingAs
         * @instance
         */
        ActingAs.prototype.accountId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new ActingAs instance using the specified properties.
         * @function create
         * @memberof websocket_api.ActingAs
         * @static
         * @param {websocket_api.IActingAs=} [properties] Properties to set
         * @returns {websocket_api.ActingAs} ActingAs instance
         */
        ActingAs.create = function create(properties) {
            return new ActingAs(properties);
        };

        /**
         * Encodes the specified ActingAs message. Does not implicitly {@link websocket_api.ActingAs.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.ActingAs
         * @static
         * @param {websocket_api.IActingAs} message ActingAs message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ActingAs.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.accountId != null && Object.hasOwnProperty.call(message, "accountId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.accountId);
            return writer;
        };

        /**
         * Encodes the specified ActingAs message, length delimited. Does not implicitly {@link websocket_api.ActingAs.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.ActingAs
         * @static
         * @param {websocket_api.IActingAs} message ActingAs message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ActingAs.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ActingAs message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.ActingAs
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.ActingAs} ActingAs
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ActingAs.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.ActingAs();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.accountId = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an ActingAs message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.ActingAs
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.ActingAs} ActingAs
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ActingAs.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ActingAs message.
         * @function verify
         * @memberof websocket_api.ActingAs
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ActingAs.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.accountId != null && message.hasOwnProperty("accountId"))
                if (!$util.isInteger(message.accountId) && !(message.accountId && $util.isInteger(message.accountId.low) && $util.isInteger(message.accountId.high)))
                    return "accountId: integer|Long expected";
            return null;
        };

        /**
         * Creates an ActingAs message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.ActingAs
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.ActingAs} ActingAs
         */
        ActingAs.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.ActingAs)
                return object;
            var message = new $root.websocket_api.ActingAs();
            if (object.accountId != null)
                if ($util.Long)
                    (message.accountId = $util.Long.fromValue(object.accountId)).unsigned = false;
                else if (typeof object.accountId === "string")
                    message.accountId = parseInt(object.accountId, 10);
                else if (typeof object.accountId === "number")
                    message.accountId = object.accountId;
                else if (typeof object.accountId === "object")
                    message.accountId = new $util.LongBits(object.accountId.low >>> 0, object.accountId.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from an ActingAs message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.ActingAs
         * @static
         * @param {websocket_api.ActingAs} message ActingAs
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ActingAs.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.accountId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.accountId = options.longs === String ? "0" : 0;
            if (message.accountId != null && message.hasOwnProperty("accountId"))
                if (typeof message.accountId === "number")
                    object.accountId = options.longs === String ? String(message.accountId) : message.accountId;
                else
                    object.accountId = options.longs === String ? $util.Long.prototype.toString.call(message.accountId) : options.longs === Number ? new $util.LongBits(message.accountId.low >>> 0, message.accountId.high >>> 0).toNumber() : message.accountId;
            return object;
        };

        /**
         * Converts this ActingAs to JSON.
         * @function toJSON
         * @memberof websocket_api.ActingAs
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ActingAs.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ActingAs
         * @function getTypeUrl
         * @memberof websocket_api.ActingAs
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ActingAs.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.ActingAs";
        };

        return ActingAs;
    })();

    websocket_api.Portfolios = (function() {

        /**
         * Properties of a Portfolios.
         * @memberof websocket_api
         * @interface IPortfolios
         * @property {Array.<websocket_api.IPortfolio>|null} [portfolios] Portfolios portfolios
         * @property {boolean|null} [areNewOwnerships] Portfolios areNewOwnerships
         */

        /**
         * Constructs a new Portfolios.
         * @memberof websocket_api
         * @classdesc Represents a Portfolios.
         * @implements IPortfolios
         * @constructor
         * @param {websocket_api.IPortfolios=} [properties] Properties to set
         */
        function Portfolios(properties) {
            this.portfolios = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Portfolios portfolios.
         * @member {Array.<websocket_api.IPortfolio>} portfolios
         * @memberof websocket_api.Portfolios
         * @instance
         */
        Portfolios.prototype.portfolios = $util.emptyArray;

        /**
         * Portfolios areNewOwnerships.
         * @member {boolean} areNewOwnerships
         * @memberof websocket_api.Portfolios
         * @instance
         */
        Portfolios.prototype.areNewOwnerships = false;

        /**
         * Creates a new Portfolios instance using the specified properties.
         * @function create
         * @memberof websocket_api.Portfolios
         * @static
         * @param {websocket_api.IPortfolios=} [properties] Properties to set
         * @returns {websocket_api.Portfolios} Portfolios instance
         */
        Portfolios.create = function create(properties) {
            return new Portfolios(properties);
        };

        /**
         * Encodes the specified Portfolios message. Does not implicitly {@link websocket_api.Portfolios.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Portfolios
         * @static
         * @param {websocket_api.IPortfolios} message Portfolios message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Portfolios.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.portfolios != null && message.portfolios.length)
                for (var i = 0; i < message.portfolios.length; ++i)
                    $root.websocket_api.Portfolio.encode(message.portfolios[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.areNewOwnerships != null && Object.hasOwnProperty.call(message, "areNewOwnerships"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.areNewOwnerships);
            return writer;
        };

        /**
         * Encodes the specified Portfolios message, length delimited. Does not implicitly {@link websocket_api.Portfolios.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Portfolios
         * @static
         * @param {websocket_api.IPortfolios} message Portfolios message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Portfolios.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Portfolios message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Portfolios
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Portfolios} Portfolios
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Portfolios.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Portfolios();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.portfolios && message.portfolios.length))
                            message.portfolios = [];
                        message.portfolios.push($root.websocket_api.Portfolio.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.areNewOwnerships = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Portfolios message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Portfolios
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Portfolios} Portfolios
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Portfolios.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Portfolios message.
         * @function verify
         * @memberof websocket_api.Portfolios
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Portfolios.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.portfolios != null && message.hasOwnProperty("portfolios")) {
                if (!Array.isArray(message.portfolios))
                    return "portfolios: array expected";
                for (var i = 0; i < message.portfolios.length; ++i) {
                    var error = $root.websocket_api.Portfolio.verify(message.portfolios[i]);
                    if (error)
                        return "portfolios." + error;
                }
            }
            if (message.areNewOwnerships != null && message.hasOwnProperty("areNewOwnerships"))
                if (typeof message.areNewOwnerships !== "boolean")
                    return "areNewOwnerships: boolean expected";
            return null;
        };

        /**
         * Creates a Portfolios message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Portfolios
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Portfolios} Portfolios
         */
        Portfolios.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Portfolios)
                return object;
            var message = new $root.websocket_api.Portfolios();
            if (object.portfolios) {
                if (!Array.isArray(object.portfolios))
                    throw TypeError(".websocket_api.Portfolios.portfolios: array expected");
                message.portfolios = [];
                for (var i = 0; i < object.portfolios.length; ++i) {
                    if (typeof object.portfolios[i] !== "object")
                        throw TypeError(".websocket_api.Portfolios.portfolios: object expected");
                    message.portfolios[i] = $root.websocket_api.Portfolio.fromObject(object.portfolios[i]);
                }
            }
            if (object.areNewOwnerships != null)
                message.areNewOwnerships = Boolean(object.areNewOwnerships);
            return message;
        };

        /**
         * Creates a plain object from a Portfolios message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Portfolios
         * @static
         * @param {websocket_api.Portfolios} message Portfolios
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Portfolios.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.portfolios = [];
            if (options.defaults)
                object.areNewOwnerships = false;
            if (message.portfolios && message.portfolios.length) {
                object.portfolios = [];
                for (var j = 0; j < message.portfolios.length; ++j)
                    object.portfolios[j] = $root.websocket_api.Portfolio.toObject(message.portfolios[j], options);
            }
            if (message.areNewOwnerships != null && message.hasOwnProperty("areNewOwnerships"))
                object.areNewOwnerships = message.areNewOwnerships;
            return object;
        };

        /**
         * Converts this Portfolios to JSON.
         * @function toJSON
         * @memberof websocket_api.Portfolios
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Portfolios.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Portfolios
         * @function getTypeUrl
         * @memberof websocket_api.Portfolios
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Portfolios.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Portfolios";
        };

        return Portfolios;
    })();

    websocket_api.OwnershipGiven = (function() {

        /**
         * Properties of an OwnershipGiven.
         * @memberof websocket_api
         * @interface IOwnershipGiven
         */

        /**
         * Constructs a new OwnershipGiven.
         * @memberof websocket_api
         * @classdesc Represents an OwnershipGiven.
         * @implements IOwnershipGiven
         * @constructor
         * @param {websocket_api.IOwnershipGiven=} [properties] Properties to set
         */
        function OwnershipGiven(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new OwnershipGiven instance using the specified properties.
         * @function create
         * @memberof websocket_api.OwnershipGiven
         * @static
         * @param {websocket_api.IOwnershipGiven=} [properties] Properties to set
         * @returns {websocket_api.OwnershipGiven} OwnershipGiven instance
         */
        OwnershipGiven.create = function create(properties) {
            return new OwnershipGiven(properties);
        };

        /**
         * Encodes the specified OwnershipGiven message. Does not implicitly {@link websocket_api.OwnershipGiven.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.OwnershipGiven
         * @static
         * @param {websocket_api.IOwnershipGiven} message OwnershipGiven message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        OwnershipGiven.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        /**
         * Encodes the specified OwnershipGiven message, length delimited. Does not implicitly {@link websocket_api.OwnershipGiven.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.OwnershipGiven
         * @static
         * @param {websocket_api.IOwnershipGiven} message OwnershipGiven message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        OwnershipGiven.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an OwnershipGiven message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.OwnershipGiven
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.OwnershipGiven} OwnershipGiven
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        OwnershipGiven.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.OwnershipGiven();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an OwnershipGiven message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.OwnershipGiven
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.OwnershipGiven} OwnershipGiven
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        OwnershipGiven.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an OwnershipGiven message.
         * @function verify
         * @memberof websocket_api.OwnershipGiven
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        OwnershipGiven.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        /**
         * Creates an OwnershipGiven message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.OwnershipGiven
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.OwnershipGiven} OwnershipGiven
         */
        OwnershipGiven.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.OwnershipGiven)
                return object;
            return new $root.websocket_api.OwnershipGiven();
        };

        /**
         * Creates a plain object from an OwnershipGiven message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.OwnershipGiven
         * @static
         * @param {websocket_api.OwnershipGiven} message OwnershipGiven
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        OwnershipGiven.toObject = function toObject() {
            return {};
        };

        /**
         * Converts this OwnershipGiven to JSON.
         * @function toJSON
         * @memberof websocket_api.OwnershipGiven
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        OwnershipGiven.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for OwnershipGiven
         * @function getTypeUrl
         * @memberof websocket_api.OwnershipGiven
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        OwnershipGiven.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.OwnershipGiven";
        };

        return OwnershipGiven;
    })();

    websocket_api.Transfers = (function() {

        /**
         * Properties of a Transfers.
         * @memberof websocket_api
         * @interface ITransfers
         * @property {Array.<websocket_api.ITransfer>|null} [transfers] Transfers transfers
         */

        /**
         * Constructs a new Transfers.
         * @memberof websocket_api
         * @classdesc Represents a Transfers.
         * @implements ITransfers
         * @constructor
         * @param {websocket_api.ITransfers=} [properties] Properties to set
         */
        function Transfers(properties) {
            this.transfers = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Transfers transfers.
         * @member {Array.<websocket_api.ITransfer>} transfers
         * @memberof websocket_api.Transfers
         * @instance
         */
        Transfers.prototype.transfers = $util.emptyArray;

        /**
         * Creates a new Transfers instance using the specified properties.
         * @function create
         * @memberof websocket_api.Transfers
         * @static
         * @param {websocket_api.ITransfers=} [properties] Properties to set
         * @returns {websocket_api.Transfers} Transfers instance
         */
        Transfers.create = function create(properties) {
            return new Transfers(properties);
        };

        /**
         * Encodes the specified Transfers message. Does not implicitly {@link websocket_api.Transfers.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Transfers
         * @static
         * @param {websocket_api.ITransfers} message Transfers message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transfers.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.transfers != null && message.transfers.length)
                for (var i = 0; i < message.transfers.length; ++i)
                    $root.websocket_api.Transfer.encode(message.transfers[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Transfers message, length delimited. Does not implicitly {@link websocket_api.Transfers.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Transfers
         * @static
         * @param {websocket_api.ITransfers} message Transfers message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transfers.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Transfers message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Transfers
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Transfers} Transfers
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transfers.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Transfers();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.transfers && message.transfers.length))
                            message.transfers = [];
                        message.transfers.push($root.websocket_api.Transfer.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Transfers message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Transfers
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Transfers} Transfers
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transfers.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Transfers message.
         * @function verify
         * @memberof websocket_api.Transfers
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Transfers.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.transfers != null && message.hasOwnProperty("transfers")) {
                if (!Array.isArray(message.transfers))
                    return "transfers: array expected";
                for (var i = 0; i < message.transfers.length; ++i) {
                    var error = $root.websocket_api.Transfer.verify(message.transfers[i]);
                    if (error)
                        return "transfers." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Transfers message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Transfers
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Transfers} Transfers
         */
        Transfers.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Transfers)
                return object;
            var message = new $root.websocket_api.Transfers();
            if (object.transfers) {
                if (!Array.isArray(object.transfers))
                    throw TypeError(".websocket_api.Transfers.transfers: array expected");
                message.transfers = [];
                for (var i = 0; i < object.transfers.length; ++i) {
                    if (typeof object.transfers[i] !== "object")
                        throw TypeError(".websocket_api.Transfers.transfers: object expected");
                    message.transfers[i] = $root.websocket_api.Transfer.fromObject(object.transfers[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a Transfers message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Transfers
         * @static
         * @param {websocket_api.Transfers} message Transfers
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Transfers.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.transfers = [];
            if (message.transfers && message.transfers.length) {
                object.transfers = [];
                for (var j = 0; j < message.transfers.length; ++j)
                    object.transfers[j] = $root.websocket_api.Transfer.toObject(message.transfers[j], options);
            }
            return object;
        };

        /**
         * Converts this Transfers to JSON.
         * @function toJSON
         * @memberof websocket_api.Transfers
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Transfers.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Transfers
         * @function getTypeUrl
         * @memberof websocket_api.Transfers
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Transfers.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Transfers";
        };

        return Transfers;
    })();

    websocket_api.Transactions = (function() {

        /**
         * Properties of a Transactions.
         * @memberof websocket_api
         * @interface ITransactions
         * @property {Array.<websocket_api.ITransaction>|null} [transactions] Transactions transactions
         */

        /**
         * Constructs a new Transactions.
         * @memberof websocket_api
         * @classdesc Represents a Transactions.
         * @implements ITransactions
         * @constructor
         * @param {websocket_api.ITransactions=} [properties] Properties to set
         */
        function Transactions(properties) {
            this.transactions = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Transactions transactions.
         * @member {Array.<websocket_api.ITransaction>} transactions
         * @memberof websocket_api.Transactions
         * @instance
         */
        Transactions.prototype.transactions = $util.emptyArray;

        /**
         * Creates a new Transactions instance using the specified properties.
         * @function create
         * @memberof websocket_api.Transactions
         * @static
         * @param {websocket_api.ITransactions=} [properties] Properties to set
         * @returns {websocket_api.Transactions} Transactions instance
         */
        Transactions.create = function create(properties) {
            return new Transactions(properties);
        };

        /**
         * Encodes the specified Transactions message. Does not implicitly {@link websocket_api.Transactions.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Transactions
         * @static
         * @param {websocket_api.ITransactions} message Transactions message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transactions.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.transactions != null && message.transactions.length)
                for (var i = 0; i < message.transactions.length; ++i)
                    $root.websocket_api.Transaction.encode(message.transactions[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Transactions message, length delimited. Does not implicitly {@link websocket_api.Transactions.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Transactions
         * @static
         * @param {websocket_api.ITransactions} message Transactions message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transactions.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Transactions message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Transactions
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Transactions} Transactions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transactions.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Transactions();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.transactions && message.transactions.length))
                            message.transactions = [];
                        message.transactions.push($root.websocket_api.Transaction.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Transactions message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Transactions
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Transactions} Transactions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transactions.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Transactions message.
         * @function verify
         * @memberof websocket_api.Transactions
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Transactions.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.transactions != null && message.hasOwnProperty("transactions")) {
                if (!Array.isArray(message.transactions))
                    return "transactions: array expected";
                for (var i = 0; i < message.transactions.length; ++i) {
                    var error = $root.websocket_api.Transaction.verify(message.transactions[i]);
                    if (error)
                        return "transactions." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Transactions message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Transactions
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Transactions} Transactions
         */
        Transactions.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Transactions)
                return object;
            var message = new $root.websocket_api.Transactions();
            if (object.transactions) {
                if (!Array.isArray(object.transactions))
                    throw TypeError(".websocket_api.Transactions.transactions: array expected");
                message.transactions = [];
                for (var i = 0; i < object.transactions.length; ++i) {
                    if (typeof object.transactions[i] !== "object")
                        throw TypeError(".websocket_api.Transactions.transactions: object expected");
                    message.transactions[i] = $root.websocket_api.Transaction.fromObject(object.transactions[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a Transactions message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Transactions
         * @static
         * @param {websocket_api.Transactions} message Transactions
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Transactions.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.transactions = [];
            if (message.transactions && message.transactions.length) {
                object.transactions = [];
                for (var j = 0; j < message.transactions.length; ++j)
                    object.transactions[j] = $root.websocket_api.Transaction.toObject(message.transactions[j], options);
            }
            return object;
        };

        /**
         * Converts this Transactions to JSON.
         * @function toJSON
         * @memberof websocket_api.Transactions
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Transactions.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Transactions
         * @function getTypeUrl
         * @memberof websocket_api.Transactions
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Transactions.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Transactions";
        };

        return Transactions;
    })();

    websocket_api.Accounts = (function() {

        /**
         * Properties of an Accounts.
         * @memberof websocket_api
         * @interface IAccounts
         * @property {Array.<websocket_api.IAccount>|null} [accounts] Accounts accounts
         */

        /**
         * Constructs a new Accounts.
         * @memberof websocket_api
         * @classdesc Represents an Accounts.
         * @implements IAccounts
         * @constructor
         * @param {websocket_api.IAccounts=} [properties] Properties to set
         */
        function Accounts(properties) {
            this.accounts = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Accounts accounts.
         * @member {Array.<websocket_api.IAccount>} accounts
         * @memberof websocket_api.Accounts
         * @instance
         */
        Accounts.prototype.accounts = $util.emptyArray;

        /**
         * Creates a new Accounts instance using the specified properties.
         * @function create
         * @memberof websocket_api.Accounts
         * @static
         * @param {websocket_api.IAccounts=} [properties] Properties to set
         * @returns {websocket_api.Accounts} Accounts instance
         */
        Accounts.create = function create(properties) {
            return new Accounts(properties);
        };

        /**
         * Encodes the specified Accounts message. Does not implicitly {@link websocket_api.Accounts.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Accounts
         * @static
         * @param {websocket_api.IAccounts} message Accounts message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Accounts.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.accounts != null && message.accounts.length)
                for (var i = 0; i < message.accounts.length; ++i)
                    $root.websocket_api.Account.encode(message.accounts[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Accounts message, length delimited. Does not implicitly {@link websocket_api.Accounts.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Accounts
         * @static
         * @param {websocket_api.IAccounts} message Accounts message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Accounts.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Accounts message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Accounts
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Accounts} Accounts
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Accounts.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Accounts();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.accounts && message.accounts.length))
                            message.accounts = [];
                        message.accounts.push($root.websocket_api.Account.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Accounts message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Accounts
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Accounts} Accounts
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Accounts.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Accounts message.
         * @function verify
         * @memberof websocket_api.Accounts
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Accounts.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.accounts != null && message.hasOwnProperty("accounts")) {
                if (!Array.isArray(message.accounts))
                    return "accounts: array expected";
                for (var i = 0; i < message.accounts.length; ++i) {
                    var error = $root.websocket_api.Account.verify(message.accounts[i]);
                    if (error)
                        return "accounts." + error;
                }
            }
            return null;
        };

        /**
         * Creates an Accounts message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Accounts
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Accounts} Accounts
         */
        Accounts.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Accounts)
                return object;
            var message = new $root.websocket_api.Accounts();
            if (object.accounts) {
                if (!Array.isArray(object.accounts))
                    throw TypeError(".websocket_api.Accounts.accounts: array expected");
                message.accounts = [];
                for (var i = 0; i < object.accounts.length; ++i) {
                    if (typeof object.accounts[i] !== "object")
                        throw TypeError(".websocket_api.Accounts.accounts: object expected");
                    message.accounts[i] = $root.websocket_api.Account.fromObject(object.accounts[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an Accounts message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Accounts
         * @static
         * @param {websocket_api.Accounts} message Accounts
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Accounts.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.accounts = [];
            if (message.accounts && message.accounts.length) {
                object.accounts = [];
                for (var j = 0; j < message.accounts.length; ++j)
                    object.accounts[j] = $root.websocket_api.Account.toObject(message.accounts[j], options);
            }
            return object;
        };

        /**
         * Converts this Accounts to JSON.
         * @function toJSON
         * @memberof websocket_api.Accounts
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Accounts.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Accounts
         * @function getTypeUrl
         * @memberof websocket_api.Accounts
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Accounts.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Accounts";
        };

        return Accounts;
    })();

    websocket_api.Portfolio = (function() {

        /**
         * Properties of a Portfolio.
         * @memberof websocket_api
         * @interface IPortfolio
         * @property {number|Long|null} [accountId] Portfolio accountId
         * @property {number|null} [totalBalance] Portfolio totalBalance
         * @property {number|null} [availableBalance] Portfolio availableBalance
         * @property {Array.<websocket_api.Portfolio.IMarketExposure>|null} [marketExposures] Portfolio marketExposures
         * @property {Array.<websocket_api.Portfolio.IOwnerCredit>|null} [ownerCredits] Portfolio ownerCredits
         */

        /**
         * Constructs a new Portfolio.
         * @memberof websocket_api
         * @classdesc Represents a Portfolio.
         * @implements IPortfolio
         * @constructor
         * @param {websocket_api.IPortfolio=} [properties] Properties to set
         */
        function Portfolio(properties) {
            this.marketExposures = [];
            this.ownerCredits = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Portfolio accountId.
         * @member {number|Long} accountId
         * @memberof websocket_api.Portfolio
         * @instance
         */
        Portfolio.prototype.accountId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Portfolio totalBalance.
         * @member {number} totalBalance
         * @memberof websocket_api.Portfolio
         * @instance
         */
        Portfolio.prototype.totalBalance = 0;

        /**
         * Portfolio availableBalance.
         * @member {number} availableBalance
         * @memberof websocket_api.Portfolio
         * @instance
         */
        Portfolio.prototype.availableBalance = 0;

        /**
         * Portfolio marketExposures.
         * @member {Array.<websocket_api.Portfolio.IMarketExposure>} marketExposures
         * @memberof websocket_api.Portfolio
         * @instance
         */
        Portfolio.prototype.marketExposures = $util.emptyArray;

        /**
         * Portfolio ownerCredits.
         * @member {Array.<websocket_api.Portfolio.IOwnerCredit>} ownerCredits
         * @memberof websocket_api.Portfolio
         * @instance
         */
        Portfolio.prototype.ownerCredits = $util.emptyArray;

        /**
         * Creates a new Portfolio instance using the specified properties.
         * @function create
         * @memberof websocket_api.Portfolio
         * @static
         * @param {websocket_api.IPortfolio=} [properties] Properties to set
         * @returns {websocket_api.Portfolio} Portfolio instance
         */
        Portfolio.create = function create(properties) {
            return new Portfolio(properties);
        };

        /**
         * Encodes the specified Portfolio message. Does not implicitly {@link websocket_api.Portfolio.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Portfolio
         * @static
         * @param {websocket_api.IPortfolio} message Portfolio message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Portfolio.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.accountId != null && Object.hasOwnProperty.call(message, "accountId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.accountId);
            if (message.totalBalance != null && Object.hasOwnProperty.call(message, "totalBalance"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.totalBalance);
            if (message.availableBalance != null && Object.hasOwnProperty.call(message, "availableBalance"))
                writer.uint32(/* id 3, wireType 1 =*/25).double(message.availableBalance);
            if (message.marketExposures != null && message.marketExposures.length)
                for (var i = 0; i < message.marketExposures.length; ++i)
                    $root.websocket_api.Portfolio.MarketExposure.encode(message.marketExposures[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.ownerCredits != null && message.ownerCredits.length)
                for (var i = 0; i < message.ownerCredits.length; ++i)
                    $root.websocket_api.Portfolio.OwnerCredit.encode(message.ownerCredits[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Portfolio message, length delimited. Does not implicitly {@link websocket_api.Portfolio.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Portfolio
         * @static
         * @param {websocket_api.IPortfolio} message Portfolio message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Portfolio.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Portfolio message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Portfolio
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Portfolio} Portfolio
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Portfolio.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Portfolio();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.accountId = reader.int64();
                        break;
                    }
                case 2: {
                        message.totalBalance = reader.double();
                        break;
                    }
                case 3: {
                        message.availableBalance = reader.double();
                        break;
                    }
                case 4: {
                        if (!(message.marketExposures && message.marketExposures.length))
                            message.marketExposures = [];
                        message.marketExposures.push($root.websocket_api.Portfolio.MarketExposure.decode(reader, reader.uint32()));
                        break;
                    }
                case 5: {
                        if (!(message.ownerCredits && message.ownerCredits.length))
                            message.ownerCredits = [];
                        message.ownerCredits.push($root.websocket_api.Portfolio.OwnerCredit.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Portfolio message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Portfolio
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Portfolio} Portfolio
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Portfolio.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Portfolio message.
         * @function verify
         * @memberof websocket_api.Portfolio
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Portfolio.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.accountId != null && message.hasOwnProperty("accountId"))
                if (!$util.isInteger(message.accountId) && !(message.accountId && $util.isInteger(message.accountId.low) && $util.isInteger(message.accountId.high)))
                    return "accountId: integer|Long expected";
            if (message.totalBalance != null && message.hasOwnProperty("totalBalance"))
                if (typeof message.totalBalance !== "number")
                    return "totalBalance: number expected";
            if (message.availableBalance != null && message.hasOwnProperty("availableBalance"))
                if (typeof message.availableBalance !== "number")
                    return "availableBalance: number expected";
            if (message.marketExposures != null && message.hasOwnProperty("marketExposures")) {
                if (!Array.isArray(message.marketExposures))
                    return "marketExposures: array expected";
                for (var i = 0; i < message.marketExposures.length; ++i) {
                    var error = $root.websocket_api.Portfolio.MarketExposure.verify(message.marketExposures[i]);
                    if (error)
                        return "marketExposures." + error;
                }
            }
            if (message.ownerCredits != null && message.hasOwnProperty("ownerCredits")) {
                if (!Array.isArray(message.ownerCredits))
                    return "ownerCredits: array expected";
                for (var i = 0; i < message.ownerCredits.length; ++i) {
                    var error = $root.websocket_api.Portfolio.OwnerCredit.verify(message.ownerCredits[i]);
                    if (error)
                        return "ownerCredits." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Portfolio message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Portfolio
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Portfolio} Portfolio
         */
        Portfolio.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Portfolio)
                return object;
            var message = new $root.websocket_api.Portfolio();
            if (object.accountId != null)
                if ($util.Long)
                    (message.accountId = $util.Long.fromValue(object.accountId)).unsigned = false;
                else if (typeof object.accountId === "string")
                    message.accountId = parseInt(object.accountId, 10);
                else if (typeof object.accountId === "number")
                    message.accountId = object.accountId;
                else if (typeof object.accountId === "object")
                    message.accountId = new $util.LongBits(object.accountId.low >>> 0, object.accountId.high >>> 0).toNumber();
            if (object.totalBalance != null)
                message.totalBalance = Number(object.totalBalance);
            if (object.availableBalance != null)
                message.availableBalance = Number(object.availableBalance);
            if (object.marketExposures) {
                if (!Array.isArray(object.marketExposures))
                    throw TypeError(".websocket_api.Portfolio.marketExposures: array expected");
                message.marketExposures = [];
                for (var i = 0; i < object.marketExposures.length; ++i) {
                    if (typeof object.marketExposures[i] !== "object")
                        throw TypeError(".websocket_api.Portfolio.marketExposures: object expected");
                    message.marketExposures[i] = $root.websocket_api.Portfolio.MarketExposure.fromObject(object.marketExposures[i]);
                }
            }
            if (object.ownerCredits) {
                if (!Array.isArray(object.ownerCredits))
                    throw TypeError(".websocket_api.Portfolio.ownerCredits: array expected");
                message.ownerCredits = [];
                for (var i = 0; i < object.ownerCredits.length; ++i) {
                    if (typeof object.ownerCredits[i] !== "object")
                        throw TypeError(".websocket_api.Portfolio.ownerCredits: object expected");
                    message.ownerCredits[i] = $root.websocket_api.Portfolio.OwnerCredit.fromObject(object.ownerCredits[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a Portfolio message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Portfolio
         * @static
         * @param {websocket_api.Portfolio} message Portfolio
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Portfolio.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.marketExposures = [];
                object.ownerCredits = [];
            }
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.accountId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.accountId = options.longs === String ? "0" : 0;
                object.totalBalance = 0;
                object.availableBalance = 0;
            }
            if (message.accountId != null && message.hasOwnProperty("accountId"))
                if (typeof message.accountId === "number")
                    object.accountId = options.longs === String ? String(message.accountId) : message.accountId;
                else
                    object.accountId = options.longs === String ? $util.Long.prototype.toString.call(message.accountId) : options.longs === Number ? new $util.LongBits(message.accountId.low >>> 0, message.accountId.high >>> 0).toNumber() : message.accountId;
            if (message.totalBalance != null && message.hasOwnProperty("totalBalance"))
                object.totalBalance = options.json && !isFinite(message.totalBalance) ? String(message.totalBalance) : message.totalBalance;
            if (message.availableBalance != null && message.hasOwnProperty("availableBalance"))
                object.availableBalance = options.json && !isFinite(message.availableBalance) ? String(message.availableBalance) : message.availableBalance;
            if (message.marketExposures && message.marketExposures.length) {
                object.marketExposures = [];
                for (var j = 0; j < message.marketExposures.length; ++j)
                    object.marketExposures[j] = $root.websocket_api.Portfolio.MarketExposure.toObject(message.marketExposures[j], options);
            }
            if (message.ownerCredits && message.ownerCredits.length) {
                object.ownerCredits = [];
                for (var j = 0; j < message.ownerCredits.length; ++j)
                    object.ownerCredits[j] = $root.websocket_api.Portfolio.OwnerCredit.toObject(message.ownerCredits[j], options);
            }
            return object;
        };

        /**
         * Converts this Portfolio to JSON.
         * @function toJSON
         * @memberof websocket_api.Portfolio
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Portfolio.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Portfolio
         * @function getTypeUrl
         * @memberof websocket_api.Portfolio
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Portfolio.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Portfolio";
        };

        Portfolio.MarketExposure = (function() {

            /**
             * Properties of a MarketExposure.
             * @memberof websocket_api.Portfolio
             * @interface IMarketExposure
             * @property {number|Long|null} [marketId] MarketExposure marketId
             * @property {number|null} [position] MarketExposure position
             * @property {number|null} [totalBidSize] MarketExposure totalBidSize
             * @property {number|null} [totalOfferSize] MarketExposure totalOfferSize
             * @property {number|null} [totalBidValue] MarketExposure totalBidValue
             * @property {number|null} [totalOfferValue] MarketExposure totalOfferValue
             */

            /**
             * Constructs a new MarketExposure.
             * @memberof websocket_api.Portfolio
             * @classdesc Represents a MarketExposure.
             * @implements IMarketExposure
             * @constructor
             * @param {websocket_api.Portfolio.IMarketExposure=} [properties] Properties to set
             */
            function MarketExposure(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * MarketExposure marketId.
             * @member {number|Long} marketId
             * @memberof websocket_api.Portfolio.MarketExposure
             * @instance
             */
            MarketExposure.prototype.marketId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * MarketExposure position.
             * @member {number} position
             * @memberof websocket_api.Portfolio.MarketExposure
             * @instance
             */
            MarketExposure.prototype.position = 0;

            /**
             * MarketExposure totalBidSize.
             * @member {number} totalBidSize
             * @memberof websocket_api.Portfolio.MarketExposure
             * @instance
             */
            MarketExposure.prototype.totalBidSize = 0;

            /**
             * MarketExposure totalOfferSize.
             * @member {number} totalOfferSize
             * @memberof websocket_api.Portfolio.MarketExposure
             * @instance
             */
            MarketExposure.prototype.totalOfferSize = 0;

            /**
             * MarketExposure totalBidValue.
             * @member {number} totalBidValue
             * @memberof websocket_api.Portfolio.MarketExposure
             * @instance
             */
            MarketExposure.prototype.totalBidValue = 0;

            /**
             * MarketExposure totalOfferValue.
             * @member {number} totalOfferValue
             * @memberof websocket_api.Portfolio.MarketExposure
             * @instance
             */
            MarketExposure.prototype.totalOfferValue = 0;

            /**
             * Creates a new MarketExposure instance using the specified properties.
             * @function create
             * @memberof websocket_api.Portfolio.MarketExposure
             * @static
             * @param {websocket_api.Portfolio.IMarketExposure=} [properties] Properties to set
             * @returns {websocket_api.Portfolio.MarketExposure} MarketExposure instance
             */
            MarketExposure.create = function create(properties) {
                return new MarketExposure(properties);
            };

            /**
             * Encodes the specified MarketExposure message. Does not implicitly {@link websocket_api.Portfolio.MarketExposure.verify|verify} messages.
             * @function encode
             * @memberof websocket_api.Portfolio.MarketExposure
             * @static
             * @param {websocket_api.Portfolio.IMarketExposure} message MarketExposure message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MarketExposure.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.marketId != null && Object.hasOwnProperty.call(message, "marketId"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.marketId);
                if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                    writer.uint32(/* id 2, wireType 1 =*/17).double(message.position);
                if (message.totalBidSize != null && Object.hasOwnProperty.call(message, "totalBidSize"))
                    writer.uint32(/* id 3, wireType 1 =*/25).double(message.totalBidSize);
                if (message.totalOfferSize != null && Object.hasOwnProperty.call(message, "totalOfferSize"))
                    writer.uint32(/* id 4, wireType 1 =*/33).double(message.totalOfferSize);
                if (message.totalBidValue != null && Object.hasOwnProperty.call(message, "totalBidValue"))
                    writer.uint32(/* id 5, wireType 1 =*/41).double(message.totalBidValue);
                if (message.totalOfferValue != null && Object.hasOwnProperty.call(message, "totalOfferValue"))
                    writer.uint32(/* id 6, wireType 1 =*/49).double(message.totalOfferValue);
                return writer;
            };

            /**
             * Encodes the specified MarketExposure message, length delimited. Does not implicitly {@link websocket_api.Portfolio.MarketExposure.verify|verify} messages.
             * @function encodeDelimited
             * @memberof websocket_api.Portfolio.MarketExposure
             * @static
             * @param {websocket_api.Portfolio.IMarketExposure} message MarketExposure message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MarketExposure.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a MarketExposure message from the specified reader or buffer.
             * @function decode
             * @memberof websocket_api.Portfolio.MarketExposure
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {websocket_api.Portfolio.MarketExposure} MarketExposure
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MarketExposure.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Portfolio.MarketExposure();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.marketId = reader.int64();
                            break;
                        }
                    case 2: {
                            message.position = reader.double();
                            break;
                        }
                    case 3: {
                            message.totalBidSize = reader.double();
                            break;
                        }
                    case 4: {
                            message.totalOfferSize = reader.double();
                            break;
                        }
                    case 5: {
                            message.totalBidValue = reader.double();
                            break;
                        }
                    case 6: {
                            message.totalOfferValue = reader.double();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a MarketExposure message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof websocket_api.Portfolio.MarketExposure
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {websocket_api.Portfolio.MarketExposure} MarketExposure
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MarketExposure.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a MarketExposure message.
             * @function verify
             * @memberof websocket_api.Portfolio.MarketExposure
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            MarketExposure.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.marketId != null && message.hasOwnProperty("marketId"))
                    if (!$util.isInteger(message.marketId) && !(message.marketId && $util.isInteger(message.marketId.low) && $util.isInteger(message.marketId.high)))
                        return "marketId: integer|Long expected";
                if (message.position != null && message.hasOwnProperty("position"))
                    if (typeof message.position !== "number")
                        return "position: number expected";
                if (message.totalBidSize != null && message.hasOwnProperty("totalBidSize"))
                    if (typeof message.totalBidSize !== "number")
                        return "totalBidSize: number expected";
                if (message.totalOfferSize != null && message.hasOwnProperty("totalOfferSize"))
                    if (typeof message.totalOfferSize !== "number")
                        return "totalOfferSize: number expected";
                if (message.totalBidValue != null && message.hasOwnProperty("totalBidValue"))
                    if (typeof message.totalBidValue !== "number")
                        return "totalBidValue: number expected";
                if (message.totalOfferValue != null && message.hasOwnProperty("totalOfferValue"))
                    if (typeof message.totalOfferValue !== "number")
                        return "totalOfferValue: number expected";
                return null;
            };

            /**
             * Creates a MarketExposure message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof websocket_api.Portfolio.MarketExposure
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {websocket_api.Portfolio.MarketExposure} MarketExposure
             */
            MarketExposure.fromObject = function fromObject(object) {
                if (object instanceof $root.websocket_api.Portfolio.MarketExposure)
                    return object;
                var message = new $root.websocket_api.Portfolio.MarketExposure();
                if (object.marketId != null)
                    if ($util.Long)
                        (message.marketId = $util.Long.fromValue(object.marketId)).unsigned = false;
                    else if (typeof object.marketId === "string")
                        message.marketId = parseInt(object.marketId, 10);
                    else if (typeof object.marketId === "number")
                        message.marketId = object.marketId;
                    else if (typeof object.marketId === "object")
                        message.marketId = new $util.LongBits(object.marketId.low >>> 0, object.marketId.high >>> 0).toNumber();
                if (object.position != null)
                    message.position = Number(object.position);
                if (object.totalBidSize != null)
                    message.totalBidSize = Number(object.totalBidSize);
                if (object.totalOfferSize != null)
                    message.totalOfferSize = Number(object.totalOfferSize);
                if (object.totalBidValue != null)
                    message.totalBidValue = Number(object.totalBidValue);
                if (object.totalOfferValue != null)
                    message.totalOfferValue = Number(object.totalOfferValue);
                return message;
            };

            /**
             * Creates a plain object from a MarketExposure message. Also converts values to other types if specified.
             * @function toObject
             * @memberof websocket_api.Portfolio.MarketExposure
             * @static
             * @param {websocket_api.Portfolio.MarketExposure} message MarketExposure
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            MarketExposure.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.marketId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.marketId = options.longs === String ? "0" : 0;
                    object.position = 0;
                    object.totalBidSize = 0;
                    object.totalOfferSize = 0;
                    object.totalBidValue = 0;
                    object.totalOfferValue = 0;
                }
                if (message.marketId != null && message.hasOwnProperty("marketId"))
                    if (typeof message.marketId === "number")
                        object.marketId = options.longs === String ? String(message.marketId) : message.marketId;
                    else
                        object.marketId = options.longs === String ? $util.Long.prototype.toString.call(message.marketId) : options.longs === Number ? new $util.LongBits(message.marketId.low >>> 0, message.marketId.high >>> 0).toNumber() : message.marketId;
                if (message.position != null && message.hasOwnProperty("position"))
                    object.position = options.json && !isFinite(message.position) ? String(message.position) : message.position;
                if (message.totalBidSize != null && message.hasOwnProperty("totalBidSize"))
                    object.totalBidSize = options.json && !isFinite(message.totalBidSize) ? String(message.totalBidSize) : message.totalBidSize;
                if (message.totalOfferSize != null && message.hasOwnProperty("totalOfferSize"))
                    object.totalOfferSize = options.json && !isFinite(message.totalOfferSize) ? String(message.totalOfferSize) : message.totalOfferSize;
                if (message.totalBidValue != null && message.hasOwnProperty("totalBidValue"))
                    object.totalBidValue = options.json && !isFinite(message.totalBidValue) ? String(message.totalBidValue) : message.totalBidValue;
                if (message.totalOfferValue != null && message.hasOwnProperty("totalOfferValue"))
                    object.totalOfferValue = options.json && !isFinite(message.totalOfferValue) ? String(message.totalOfferValue) : message.totalOfferValue;
                return object;
            };

            /**
             * Converts this MarketExposure to JSON.
             * @function toJSON
             * @memberof websocket_api.Portfolio.MarketExposure
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            MarketExposure.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for MarketExposure
             * @function getTypeUrl
             * @memberof websocket_api.Portfolio.MarketExposure
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            MarketExposure.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/websocket_api.Portfolio.MarketExposure";
            };

            return MarketExposure;
        })();

        Portfolio.OwnerCredit = (function() {

            /**
             * Properties of an OwnerCredit.
             * @memberof websocket_api.Portfolio
             * @interface IOwnerCredit
             * @property {number|Long|null} [ownerId] OwnerCredit ownerId
             * @property {number|null} [credit] OwnerCredit credit
             */

            /**
             * Constructs a new OwnerCredit.
             * @memberof websocket_api.Portfolio
             * @classdesc Represents an OwnerCredit.
             * @implements IOwnerCredit
             * @constructor
             * @param {websocket_api.Portfolio.IOwnerCredit=} [properties] Properties to set
             */
            function OwnerCredit(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * OwnerCredit ownerId.
             * @member {number|Long} ownerId
             * @memberof websocket_api.Portfolio.OwnerCredit
             * @instance
             */
            OwnerCredit.prototype.ownerId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * OwnerCredit credit.
             * @member {number} credit
             * @memberof websocket_api.Portfolio.OwnerCredit
             * @instance
             */
            OwnerCredit.prototype.credit = 0;

            /**
             * Creates a new OwnerCredit instance using the specified properties.
             * @function create
             * @memberof websocket_api.Portfolio.OwnerCredit
             * @static
             * @param {websocket_api.Portfolio.IOwnerCredit=} [properties] Properties to set
             * @returns {websocket_api.Portfolio.OwnerCredit} OwnerCredit instance
             */
            OwnerCredit.create = function create(properties) {
                return new OwnerCredit(properties);
            };

            /**
             * Encodes the specified OwnerCredit message. Does not implicitly {@link websocket_api.Portfolio.OwnerCredit.verify|verify} messages.
             * @function encode
             * @memberof websocket_api.Portfolio.OwnerCredit
             * @static
             * @param {websocket_api.Portfolio.IOwnerCredit} message OwnerCredit message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OwnerCredit.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.ownerId != null && Object.hasOwnProperty.call(message, "ownerId"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.ownerId);
                if (message.credit != null && Object.hasOwnProperty.call(message, "credit"))
                    writer.uint32(/* id 2, wireType 1 =*/17).double(message.credit);
                return writer;
            };

            /**
             * Encodes the specified OwnerCredit message, length delimited. Does not implicitly {@link websocket_api.Portfolio.OwnerCredit.verify|verify} messages.
             * @function encodeDelimited
             * @memberof websocket_api.Portfolio.OwnerCredit
             * @static
             * @param {websocket_api.Portfolio.IOwnerCredit} message OwnerCredit message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OwnerCredit.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an OwnerCredit message from the specified reader or buffer.
             * @function decode
             * @memberof websocket_api.Portfolio.OwnerCredit
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {websocket_api.Portfolio.OwnerCredit} OwnerCredit
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OwnerCredit.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Portfolio.OwnerCredit();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.ownerId = reader.int64();
                            break;
                        }
                    case 2: {
                            message.credit = reader.double();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an OwnerCredit message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof websocket_api.Portfolio.OwnerCredit
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {websocket_api.Portfolio.OwnerCredit} OwnerCredit
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OwnerCredit.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an OwnerCredit message.
             * @function verify
             * @memberof websocket_api.Portfolio.OwnerCredit
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            OwnerCredit.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.ownerId != null && message.hasOwnProperty("ownerId"))
                    if (!$util.isInteger(message.ownerId) && !(message.ownerId && $util.isInteger(message.ownerId.low) && $util.isInteger(message.ownerId.high)))
                        return "ownerId: integer|Long expected";
                if (message.credit != null && message.hasOwnProperty("credit"))
                    if (typeof message.credit !== "number")
                        return "credit: number expected";
                return null;
            };

            /**
             * Creates an OwnerCredit message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof websocket_api.Portfolio.OwnerCredit
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {websocket_api.Portfolio.OwnerCredit} OwnerCredit
             */
            OwnerCredit.fromObject = function fromObject(object) {
                if (object instanceof $root.websocket_api.Portfolio.OwnerCredit)
                    return object;
                var message = new $root.websocket_api.Portfolio.OwnerCredit();
                if (object.ownerId != null)
                    if ($util.Long)
                        (message.ownerId = $util.Long.fromValue(object.ownerId)).unsigned = false;
                    else if (typeof object.ownerId === "string")
                        message.ownerId = parseInt(object.ownerId, 10);
                    else if (typeof object.ownerId === "number")
                        message.ownerId = object.ownerId;
                    else if (typeof object.ownerId === "object")
                        message.ownerId = new $util.LongBits(object.ownerId.low >>> 0, object.ownerId.high >>> 0).toNumber();
                if (object.credit != null)
                    message.credit = Number(object.credit);
                return message;
            };

            /**
             * Creates a plain object from an OwnerCredit message. Also converts values to other types if specified.
             * @function toObject
             * @memberof websocket_api.Portfolio.OwnerCredit
             * @static
             * @param {websocket_api.Portfolio.OwnerCredit} message OwnerCredit
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            OwnerCredit.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.ownerId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.ownerId = options.longs === String ? "0" : 0;
                    object.credit = 0;
                }
                if (message.ownerId != null && message.hasOwnProperty("ownerId"))
                    if (typeof message.ownerId === "number")
                        object.ownerId = options.longs === String ? String(message.ownerId) : message.ownerId;
                    else
                        object.ownerId = options.longs === String ? $util.Long.prototype.toString.call(message.ownerId) : options.longs === Number ? new $util.LongBits(message.ownerId.low >>> 0, message.ownerId.high >>> 0).toNumber() : message.ownerId;
                if (message.credit != null && message.hasOwnProperty("credit"))
                    object.credit = options.json && !isFinite(message.credit) ? String(message.credit) : message.credit;
                return object;
            };

            /**
             * Converts this OwnerCredit to JSON.
             * @function toJSON
             * @memberof websocket_api.Portfolio.OwnerCredit
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            OwnerCredit.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for OwnerCredit
             * @function getTypeUrl
             * @memberof websocket_api.Portfolio.OwnerCredit
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            OwnerCredit.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/websocket_api.Portfolio.OwnerCredit";
            };

            return OwnerCredit;
        })();

        return Portfolio;
    })();

    websocket_api.Market = (function() {

        /**
         * Properties of a Market.
         * @memberof websocket_api
         * @interface IMarket
         * @property {number|Long|null} [id] Market id
         * @property {string|null} [name] Market name
         * @property {string|null} [description] Market description
         * @property {number|Long|null} [ownerId] Market ownerId
         * @property {websocket_api.ITransaction|null} [transaction] Market transaction
         * @property {number|null} [minSettlement] Market minSettlement
         * @property {number|null} [maxSettlement] Market maxSettlement
         * @property {Array.<number|Long>|null} [redeemableFor] Market redeemableFor
         * @property {websocket_api.Market.IOpen|null} [open] Market open
         * @property {websocket_api.Market.IClosed|null} [closed] Market closed
         */

        /**
         * Constructs a new Market.
         * @memberof websocket_api
         * @classdesc Represents a Market.
         * @implements IMarket
         * @constructor
         * @param {websocket_api.IMarket=} [properties] Properties to set
         */
        function Market(properties) {
            this.redeemableFor = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Market id.
         * @member {number|Long} id
         * @memberof websocket_api.Market
         * @instance
         */
        Market.prototype.id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Market name.
         * @member {string} name
         * @memberof websocket_api.Market
         * @instance
         */
        Market.prototype.name = "";

        /**
         * Market description.
         * @member {string} description
         * @memberof websocket_api.Market
         * @instance
         */
        Market.prototype.description = "";

        /**
         * Market ownerId.
         * @member {number|Long} ownerId
         * @memberof websocket_api.Market
         * @instance
         */
        Market.prototype.ownerId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Market transaction.
         * @member {websocket_api.ITransaction|null|undefined} transaction
         * @memberof websocket_api.Market
         * @instance
         */
        Market.prototype.transaction = null;

        /**
         * Market minSettlement.
         * @member {number} minSettlement
         * @memberof websocket_api.Market
         * @instance
         */
        Market.prototype.minSettlement = 0;

        /**
         * Market maxSettlement.
         * @member {number} maxSettlement
         * @memberof websocket_api.Market
         * @instance
         */
        Market.prototype.maxSettlement = 0;

        /**
         * Market redeemableFor.
         * @member {Array.<number|Long>} redeemableFor
         * @memberof websocket_api.Market
         * @instance
         */
        Market.prototype.redeemableFor = $util.emptyArray;

        /**
         * Market open.
         * @member {websocket_api.Market.IOpen|null|undefined} open
         * @memberof websocket_api.Market
         * @instance
         */
        Market.prototype.open = null;

        /**
         * Market closed.
         * @member {websocket_api.Market.IClosed|null|undefined} closed
         * @memberof websocket_api.Market
         * @instance
         */
        Market.prototype.closed = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * Market status.
         * @member {"open"|"closed"|undefined} status
         * @memberof websocket_api.Market
         * @instance
         */
        Object.defineProperty(Market.prototype, "status", {
            get: $util.oneOfGetter($oneOfFields = ["open", "closed"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new Market instance using the specified properties.
         * @function create
         * @memberof websocket_api.Market
         * @static
         * @param {websocket_api.IMarket=} [properties] Properties to set
         * @returns {websocket_api.Market} Market instance
         */
        Market.create = function create(properties) {
            return new Market(properties);
        };

        /**
         * Encodes the specified Market message. Does not implicitly {@link websocket_api.Market.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Market
         * @static
         * @param {websocket_api.IMarket} message Market message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Market.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.description);
            if (message.transaction != null && Object.hasOwnProperty.call(message, "transaction"))
                $root.websocket_api.Transaction.encode(message.transaction, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.minSettlement != null && Object.hasOwnProperty.call(message, "minSettlement"))
                writer.uint32(/* id 6, wireType 1 =*/49).double(message.minSettlement);
            if (message.maxSettlement != null && Object.hasOwnProperty.call(message, "maxSettlement"))
                writer.uint32(/* id 7, wireType 1 =*/57).double(message.maxSettlement);
            if (message.open != null && Object.hasOwnProperty.call(message, "open"))
                $root.websocket_api.Market.Open.encode(message.open, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.closed != null && Object.hasOwnProperty.call(message, "closed"))
                $root.websocket_api.Market.Closed.encode(message.closed, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.ownerId != null && Object.hasOwnProperty.call(message, "ownerId"))
                writer.uint32(/* id 10, wireType 0 =*/80).int64(message.ownerId);
            if (message.redeemableFor != null && message.redeemableFor.length) {
                writer.uint32(/* id 13, wireType 2 =*/106).fork();
                for (var i = 0; i < message.redeemableFor.length; ++i)
                    writer.int64(message.redeemableFor[i]);
                writer.ldelim();
            }
            return writer;
        };

        /**
         * Encodes the specified Market message, length delimited. Does not implicitly {@link websocket_api.Market.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Market
         * @static
         * @param {websocket_api.IMarket} message Market message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Market.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Market message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Market
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Market} Market
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Market.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Market();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.int64();
                        break;
                    }
                case 2: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.description = reader.string();
                        break;
                    }
                case 10: {
                        message.ownerId = reader.int64();
                        break;
                    }
                case 5: {
                        message.transaction = $root.websocket_api.Transaction.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.minSettlement = reader.double();
                        break;
                    }
                case 7: {
                        message.maxSettlement = reader.double();
                        break;
                    }
                case 13: {
                        if (!(message.redeemableFor && message.redeemableFor.length))
                            message.redeemableFor = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.redeemableFor.push(reader.int64());
                        } else
                            message.redeemableFor.push(reader.int64());
                        break;
                    }
                case 8: {
                        message.open = $root.websocket_api.Market.Open.decode(reader, reader.uint32());
                        break;
                    }
                case 9: {
                        message.closed = $root.websocket_api.Market.Closed.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Market message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Market
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Market} Market
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Market.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Market message.
         * @function verify
         * @memberof websocket_api.Market
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Market.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.ownerId != null && message.hasOwnProperty("ownerId"))
                if (!$util.isInteger(message.ownerId) && !(message.ownerId && $util.isInteger(message.ownerId.low) && $util.isInteger(message.ownerId.high)))
                    return "ownerId: integer|Long expected";
            if (message.transaction != null && message.hasOwnProperty("transaction")) {
                var error = $root.websocket_api.Transaction.verify(message.transaction);
                if (error)
                    return "transaction." + error;
            }
            if (message.minSettlement != null && message.hasOwnProperty("minSettlement"))
                if (typeof message.minSettlement !== "number")
                    return "minSettlement: number expected";
            if (message.maxSettlement != null && message.hasOwnProperty("maxSettlement"))
                if (typeof message.maxSettlement !== "number")
                    return "maxSettlement: number expected";
            if (message.redeemableFor != null && message.hasOwnProperty("redeemableFor")) {
                if (!Array.isArray(message.redeemableFor))
                    return "redeemableFor: array expected";
                for (var i = 0; i < message.redeemableFor.length; ++i)
                    if (!$util.isInteger(message.redeemableFor[i]) && !(message.redeemableFor[i] && $util.isInteger(message.redeemableFor[i].low) && $util.isInteger(message.redeemableFor[i].high)))
                        return "redeemableFor: integer|Long[] expected";
            }
            if (message.open != null && message.hasOwnProperty("open")) {
                properties.status = 1;
                {
                    var error = $root.websocket_api.Market.Open.verify(message.open);
                    if (error)
                        return "open." + error;
                }
            }
            if (message.closed != null && message.hasOwnProperty("closed")) {
                if (properties.status === 1)
                    return "status: multiple values";
                properties.status = 1;
                {
                    var error = $root.websocket_api.Market.Closed.verify(message.closed);
                    if (error)
                        return "closed." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Market message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Market
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Market} Market
         */
        Market.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Market)
                return object;
            var message = new $root.websocket_api.Market();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = false;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.ownerId != null)
                if ($util.Long)
                    (message.ownerId = $util.Long.fromValue(object.ownerId)).unsigned = false;
                else if (typeof object.ownerId === "string")
                    message.ownerId = parseInt(object.ownerId, 10);
                else if (typeof object.ownerId === "number")
                    message.ownerId = object.ownerId;
                else if (typeof object.ownerId === "object")
                    message.ownerId = new $util.LongBits(object.ownerId.low >>> 0, object.ownerId.high >>> 0).toNumber();
            if (object.transaction != null) {
                if (typeof object.transaction !== "object")
                    throw TypeError(".websocket_api.Market.transaction: object expected");
                message.transaction = $root.websocket_api.Transaction.fromObject(object.transaction);
            }
            if (object.minSettlement != null)
                message.minSettlement = Number(object.minSettlement);
            if (object.maxSettlement != null)
                message.maxSettlement = Number(object.maxSettlement);
            if (object.redeemableFor) {
                if (!Array.isArray(object.redeemableFor))
                    throw TypeError(".websocket_api.Market.redeemableFor: array expected");
                message.redeemableFor = [];
                for (var i = 0; i < object.redeemableFor.length; ++i)
                    if ($util.Long)
                        (message.redeemableFor[i] = $util.Long.fromValue(object.redeemableFor[i])).unsigned = false;
                    else if (typeof object.redeemableFor[i] === "string")
                        message.redeemableFor[i] = parseInt(object.redeemableFor[i], 10);
                    else if (typeof object.redeemableFor[i] === "number")
                        message.redeemableFor[i] = object.redeemableFor[i];
                    else if (typeof object.redeemableFor[i] === "object")
                        message.redeemableFor[i] = new $util.LongBits(object.redeemableFor[i].low >>> 0, object.redeemableFor[i].high >>> 0).toNumber();
            }
            if (object.open != null) {
                if (typeof object.open !== "object")
                    throw TypeError(".websocket_api.Market.open: object expected");
                message.open = $root.websocket_api.Market.Open.fromObject(object.open);
            }
            if (object.closed != null) {
                if (typeof object.closed !== "object")
                    throw TypeError(".websocket_api.Market.closed: object expected");
                message.closed = $root.websocket_api.Market.Closed.fromObject(object.closed);
            }
            return message;
        };

        /**
         * Creates a plain object from a Market message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Market
         * @static
         * @param {websocket_api.Market} message Market
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Market.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.redeemableFor = [];
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                object.name = "";
                object.description = "";
                object.transaction = null;
                object.minSettlement = 0;
                object.maxSettlement = 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.ownerId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.ownerId = options.longs === String ? "0" : 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.transaction != null && message.hasOwnProperty("transaction"))
                object.transaction = $root.websocket_api.Transaction.toObject(message.transaction, options);
            if (message.minSettlement != null && message.hasOwnProperty("minSettlement"))
                object.minSettlement = options.json && !isFinite(message.minSettlement) ? String(message.minSettlement) : message.minSettlement;
            if (message.maxSettlement != null && message.hasOwnProperty("maxSettlement"))
                object.maxSettlement = options.json && !isFinite(message.maxSettlement) ? String(message.maxSettlement) : message.maxSettlement;
            if (message.open != null && message.hasOwnProperty("open")) {
                object.open = $root.websocket_api.Market.Open.toObject(message.open, options);
                if (options.oneofs)
                    object.status = "open";
            }
            if (message.closed != null && message.hasOwnProperty("closed")) {
                object.closed = $root.websocket_api.Market.Closed.toObject(message.closed, options);
                if (options.oneofs)
                    object.status = "closed";
            }
            if (message.ownerId != null && message.hasOwnProperty("ownerId"))
                if (typeof message.ownerId === "number")
                    object.ownerId = options.longs === String ? String(message.ownerId) : message.ownerId;
                else
                    object.ownerId = options.longs === String ? $util.Long.prototype.toString.call(message.ownerId) : options.longs === Number ? new $util.LongBits(message.ownerId.low >>> 0, message.ownerId.high >>> 0).toNumber() : message.ownerId;
            if (message.redeemableFor && message.redeemableFor.length) {
                object.redeemableFor = [];
                for (var j = 0; j < message.redeemableFor.length; ++j)
                    if (typeof message.redeemableFor[j] === "number")
                        object.redeemableFor[j] = options.longs === String ? String(message.redeemableFor[j]) : message.redeemableFor[j];
                    else
                        object.redeemableFor[j] = options.longs === String ? $util.Long.prototype.toString.call(message.redeemableFor[j]) : options.longs === Number ? new $util.LongBits(message.redeemableFor[j].low >>> 0, message.redeemableFor[j].high >>> 0).toNumber() : message.redeemableFor[j];
            }
            return object;
        };

        /**
         * Converts this Market to JSON.
         * @function toJSON
         * @memberof websocket_api.Market
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Market.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Market
         * @function getTypeUrl
         * @memberof websocket_api.Market
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Market.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Market";
        };

        Market.Open = (function() {

            /**
             * Properties of an Open.
             * @memberof websocket_api.Market
             * @interface IOpen
             */

            /**
             * Constructs a new Open.
             * @memberof websocket_api.Market
             * @classdesc Represents an Open.
             * @implements IOpen
             * @constructor
             * @param {websocket_api.Market.IOpen=} [properties] Properties to set
             */
            function Open(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Creates a new Open instance using the specified properties.
             * @function create
             * @memberof websocket_api.Market.Open
             * @static
             * @param {websocket_api.Market.IOpen=} [properties] Properties to set
             * @returns {websocket_api.Market.Open} Open instance
             */
            Open.create = function create(properties) {
                return new Open(properties);
            };

            /**
             * Encodes the specified Open message. Does not implicitly {@link websocket_api.Market.Open.verify|verify} messages.
             * @function encode
             * @memberof websocket_api.Market.Open
             * @static
             * @param {websocket_api.Market.IOpen} message Open message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Open.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };

            /**
             * Encodes the specified Open message, length delimited. Does not implicitly {@link websocket_api.Market.Open.verify|verify} messages.
             * @function encodeDelimited
             * @memberof websocket_api.Market.Open
             * @static
             * @param {websocket_api.Market.IOpen} message Open message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Open.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Open message from the specified reader or buffer.
             * @function decode
             * @memberof websocket_api.Market.Open
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {websocket_api.Market.Open} Open
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Open.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Market.Open();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Open message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof websocket_api.Market.Open
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {websocket_api.Market.Open} Open
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Open.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Open message.
             * @function verify
             * @memberof websocket_api.Market.Open
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Open.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                return null;
            };

            /**
             * Creates an Open message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof websocket_api.Market.Open
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {websocket_api.Market.Open} Open
             */
            Open.fromObject = function fromObject(object) {
                if (object instanceof $root.websocket_api.Market.Open)
                    return object;
                return new $root.websocket_api.Market.Open();
            };

            /**
             * Creates a plain object from an Open message. Also converts values to other types if specified.
             * @function toObject
             * @memberof websocket_api.Market.Open
             * @static
             * @param {websocket_api.Market.Open} message Open
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Open.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this Open to JSON.
             * @function toJSON
             * @memberof websocket_api.Market.Open
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Open.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Open
             * @function getTypeUrl
             * @memberof websocket_api.Market.Open
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Open.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/websocket_api.Market.Open";
            };

            return Open;
        })();

        Market.Closed = (function() {

            /**
             * Properties of a Closed.
             * @memberof websocket_api.Market
             * @interface IClosed
             * @property {number|null} [settlePrice] Closed settlePrice
             * @property {number|Long|null} [transactionId] Closed transactionId
             */

            /**
             * Constructs a new Closed.
             * @memberof websocket_api.Market
             * @classdesc Represents a Closed.
             * @implements IClosed
             * @constructor
             * @param {websocket_api.Market.IClosed=} [properties] Properties to set
             */
            function Closed(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Closed settlePrice.
             * @member {number} settlePrice
             * @memberof websocket_api.Market.Closed
             * @instance
             */
            Closed.prototype.settlePrice = 0;

            /**
             * Closed transactionId.
             * @member {number|Long} transactionId
             * @memberof websocket_api.Market.Closed
             * @instance
             */
            Closed.prototype.transactionId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new Closed instance using the specified properties.
             * @function create
             * @memberof websocket_api.Market.Closed
             * @static
             * @param {websocket_api.Market.IClosed=} [properties] Properties to set
             * @returns {websocket_api.Market.Closed} Closed instance
             */
            Closed.create = function create(properties) {
                return new Closed(properties);
            };

            /**
             * Encodes the specified Closed message. Does not implicitly {@link websocket_api.Market.Closed.verify|verify} messages.
             * @function encode
             * @memberof websocket_api.Market.Closed
             * @static
             * @param {websocket_api.Market.IClosed} message Closed message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Closed.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.settlePrice != null && Object.hasOwnProperty.call(message, "settlePrice"))
                    writer.uint32(/* id 1, wireType 1 =*/9).double(message.settlePrice);
                if (message.transactionId != null && Object.hasOwnProperty.call(message, "transactionId"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int64(message.transactionId);
                return writer;
            };

            /**
             * Encodes the specified Closed message, length delimited. Does not implicitly {@link websocket_api.Market.Closed.verify|verify} messages.
             * @function encodeDelimited
             * @memberof websocket_api.Market.Closed
             * @static
             * @param {websocket_api.Market.IClosed} message Closed message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Closed.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Closed message from the specified reader or buffer.
             * @function decode
             * @memberof websocket_api.Market.Closed
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {websocket_api.Market.Closed} Closed
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Closed.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Market.Closed();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.settlePrice = reader.double();
                            break;
                        }
                    case 2: {
                            message.transactionId = reader.int64();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Closed message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof websocket_api.Market.Closed
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {websocket_api.Market.Closed} Closed
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Closed.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Closed message.
             * @function verify
             * @memberof websocket_api.Market.Closed
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Closed.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.settlePrice != null && message.hasOwnProperty("settlePrice"))
                    if (typeof message.settlePrice !== "number")
                        return "settlePrice: number expected";
                if (message.transactionId != null && message.hasOwnProperty("transactionId"))
                    if (!$util.isInteger(message.transactionId) && !(message.transactionId && $util.isInteger(message.transactionId.low) && $util.isInteger(message.transactionId.high)))
                        return "transactionId: integer|Long expected";
                return null;
            };

            /**
             * Creates a Closed message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof websocket_api.Market.Closed
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {websocket_api.Market.Closed} Closed
             */
            Closed.fromObject = function fromObject(object) {
                if (object instanceof $root.websocket_api.Market.Closed)
                    return object;
                var message = new $root.websocket_api.Market.Closed();
                if (object.settlePrice != null)
                    message.settlePrice = Number(object.settlePrice);
                if (object.transactionId != null)
                    if ($util.Long)
                        (message.transactionId = $util.Long.fromValue(object.transactionId)).unsigned = false;
                    else if (typeof object.transactionId === "string")
                        message.transactionId = parseInt(object.transactionId, 10);
                    else if (typeof object.transactionId === "number")
                        message.transactionId = object.transactionId;
                    else if (typeof object.transactionId === "object")
                        message.transactionId = new $util.LongBits(object.transactionId.low >>> 0, object.transactionId.high >>> 0).toNumber();
                return message;
            };

            /**
             * Creates a plain object from a Closed message. Also converts values to other types if specified.
             * @function toObject
             * @memberof websocket_api.Market.Closed
             * @static
             * @param {websocket_api.Market.Closed} message Closed
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Closed.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.settlePrice = 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.transactionId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.transactionId = options.longs === String ? "0" : 0;
                }
                if (message.settlePrice != null && message.hasOwnProperty("settlePrice"))
                    object.settlePrice = options.json && !isFinite(message.settlePrice) ? String(message.settlePrice) : message.settlePrice;
                if (message.transactionId != null && message.hasOwnProperty("transactionId"))
                    if (typeof message.transactionId === "number")
                        object.transactionId = options.longs === String ? String(message.transactionId) : message.transactionId;
                    else
                        object.transactionId = options.longs === String ? $util.Long.prototype.toString.call(message.transactionId) : options.longs === Number ? new $util.LongBits(message.transactionId.low >>> 0, message.transactionId.high >>> 0).toNumber() : message.transactionId;
                return object;
            };

            /**
             * Converts this Closed to JSON.
             * @function toJSON
             * @memberof websocket_api.Market.Closed
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Closed.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Closed
             * @function getTypeUrl
             * @memberof websocket_api.Market.Closed
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Closed.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/websocket_api.Market.Closed";
            };

            return Closed;
        })();

        return Market;
    })();

    websocket_api.Transaction = (function() {

        /**
         * Properties of a Transaction.
         * @memberof websocket_api
         * @interface ITransaction
         * @property {number|Long|null} [id] Transaction id
         * @property {google.protobuf.ITimestamp|null} [timestamp] Transaction timestamp
         */

        /**
         * Constructs a new Transaction.
         * @memberof websocket_api
         * @classdesc Represents a Transaction.
         * @implements ITransaction
         * @constructor
         * @param {websocket_api.ITransaction=} [properties] Properties to set
         */
        function Transaction(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Transaction id.
         * @member {number|Long} id
         * @memberof websocket_api.Transaction
         * @instance
         */
        Transaction.prototype.id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Transaction timestamp.
         * @member {google.protobuf.ITimestamp|null|undefined} timestamp
         * @memberof websocket_api.Transaction
         * @instance
         */
        Transaction.prototype.timestamp = null;

        /**
         * Creates a new Transaction instance using the specified properties.
         * @function create
         * @memberof websocket_api.Transaction
         * @static
         * @param {websocket_api.ITransaction=} [properties] Properties to set
         * @returns {websocket_api.Transaction} Transaction instance
         */
        Transaction.create = function create(properties) {
            return new Transaction(properties);
        };

        /**
         * Encodes the specified Transaction message. Does not implicitly {@link websocket_api.Transaction.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Transaction
         * @static
         * @param {websocket_api.ITransaction} message Transaction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transaction.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.id);
            if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                $root.google.protobuf.Timestamp.encode(message.timestamp, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Transaction message, length delimited. Does not implicitly {@link websocket_api.Transaction.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Transaction
         * @static
         * @param {websocket_api.ITransaction} message Transaction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transaction.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Transaction message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Transaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Transaction} Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transaction.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Transaction();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.int64();
                        break;
                    }
                case 2: {
                        message.timestamp = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Transaction message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Transaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Transaction} Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transaction.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Transaction message.
         * @function verify
         * @memberof websocket_api.Transaction
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Transaction.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.timestamp != null && message.hasOwnProperty("timestamp")) {
                var error = $root.google.protobuf.Timestamp.verify(message.timestamp);
                if (error)
                    return "timestamp." + error;
            }
            return null;
        };

        /**
         * Creates a Transaction message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Transaction
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Transaction} Transaction
         */
        Transaction.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Transaction)
                return object;
            var message = new $root.websocket_api.Transaction();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = false;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
            if (object.timestamp != null) {
                if (typeof object.timestamp !== "object")
                    throw TypeError(".websocket_api.Transaction.timestamp: object expected");
                message.timestamp = $root.google.protobuf.Timestamp.fromObject(object.timestamp);
            }
            return message;
        };

        /**
         * Creates a plain object from a Transaction message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Transaction
         * @static
         * @param {websocket_api.Transaction} message Transaction
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Transaction.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                object.timestamp = null;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                object.timestamp = $root.google.protobuf.Timestamp.toObject(message.timestamp, options);
            return object;
        };

        /**
         * Converts this Transaction to JSON.
         * @function toJSON
         * @memberof websocket_api.Transaction
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Transaction.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Transaction
         * @function getTypeUrl
         * @memberof websocket_api.Transaction
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Transaction.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Transaction";
        };

        return Transaction;
    })();

    websocket_api.MarketSettled = (function() {

        /**
         * Properties of a MarketSettled.
         * @memberof websocket_api
         * @interface IMarketSettled
         * @property {number|Long|null} [id] MarketSettled id
         * @property {number|null} [settlePrice] MarketSettled settlePrice
         * @property {websocket_api.ITransaction|null} [transaction] MarketSettled transaction
         */

        /**
         * Constructs a new MarketSettled.
         * @memberof websocket_api
         * @classdesc Represents a MarketSettled.
         * @implements IMarketSettled
         * @constructor
         * @param {websocket_api.IMarketSettled=} [properties] Properties to set
         */
        function MarketSettled(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MarketSettled id.
         * @member {number|Long} id
         * @memberof websocket_api.MarketSettled
         * @instance
         */
        MarketSettled.prototype.id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * MarketSettled settlePrice.
         * @member {number} settlePrice
         * @memberof websocket_api.MarketSettled
         * @instance
         */
        MarketSettled.prototype.settlePrice = 0;

        /**
         * MarketSettled transaction.
         * @member {websocket_api.ITransaction|null|undefined} transaction
         * @memberof websocket_api.MarketSettled
         * @instance
         */
        MarketSettled.prototype.transaction = null;

        /**
         * Creates a new MarketSettled instance using the specified properties.
         * @function create
         * @memberof websocket_api.MarketSettled
         * @static
         * @param {websocket_api.IMarketSettled=} [properties] Properties to set
         * @returns {websocket_api.MarketSettled} MarketSettled instance
         */
        MarketSettled.create = function create(properties) {
            return new MarketSettled(properties);
        };

        /**
         * Encodes the specified MarketSettled message. Does not implicitly {@link websocket_api.MarketSettled.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.MarketSettled
         * @static
         * @param {websocket_api.IMarketSettled} message MarketSettled message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarketSettled.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.id);
            if (message.settlePrice != null && Object.hasOwnProperty.call(message, "settlePrice"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.settlePrice);
            if (message.transaction != null && Object.hasOwnProperty.call(message, "transaction"))
                $root.websocket_api.Transaction.encode(message.transaction, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified MarketSettled message, length delimited. Does not implicitly {@link websocket_api.MarketSettled.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.MarketSettled
         * @static
         * @param {websocket_api.IMarketSettled} message MarketSettled message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MarketSettled.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MarketSettled message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.MarketSettled
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.MarketSettled} MarketSettled
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarketSettled.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.MarketSettled();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.int64();
                        break;
                    }
                case 2: {
                        message.settlePrice = reader.double();
                        break;
                    }
                case 3: {
                        message.transaction = $root.websocket_api.Transaction.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MarketSettled message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.MarketSettled
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.MarketSettled} MarketSettled
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MarketSettled.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MarketSettled message.
         * @function verify
         * @memberof websocket_api.MarketSettled
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MarketSettled.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.settlePrice != null && message.hasOwnProperty("settlePrice"))
                if (typeof message.settlePrice !== "number")
                    return "settlePrice: number expected";
            if (message.transaction != null && message.hasOwnProperty("transaction")) {
                var error = $root.websocket_api.Transaction.verify(message.transaction);
                if (error)
                    return "transaction." + error;
            }
            return null;
        };

        /**
         * Creates a MarketSettled message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.MarketSettled
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.MarketSettled} MarketSettled
         */
        MarketSettled.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.MarketSettled)
                return object;
            var message = new $root.websocket_api.MarketSettled();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = false;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
            if (object.settlePrice != null)
                message.settlePrice = Number(object.settlePrice);
            if (object.transaction != null) {
                if (typeof object.transaction !== "object")
                    throw TypeError(".websocket_api.MarketSettled.transaction: object expected");
                message.transaction = $root.websocket_api.Transaction.fromObject(object.transaction);
            }
            return message;
        };

        /**
         * Creates a plain object from a MarketSettled message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.MarketSettled
         * @static
         * @param {websocket_api.MarketSettled} message MarketSettled
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MarketSettled.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                object.settlePrice = 0;
                object.transaction = null;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
            if (message.settlePrice != null && message.hasOwnProperty("settlePrice"))
                object.settlePrice = options.json && !isFinite(message.settlePrice) ? String(message.settlePrice) : message.settlePrice;
            if (message.transaction != null && message.hasOwnProperty("transaction"))
                object.transaction = $root.websocket_api.Transaction.toObject(message.transaction, options);
            return object;
        };

        /**
         * Converts this MarketSettled to JSON.
         * @function toJSON
         * @memberof websocket_api.MarketSettled
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MarketSettled.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MarketSettled
         * @function getTypeUrl
         * @memberof websocket_api.MarketSettled
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MarketSettled.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.MarketSettled";
        };

        return MarketSettled;
    })();

    websocket_api.OrdersCancelled = (function() {

        /**
         * Properties of an OrdersCancelled.
         * @memberof websocket_api
         * @interface IOrdersCancelled
         * @property {Array.<number|Long>|null} [orderIds] OrdersCancelled orderIds
         * @property {number|Long|null} [marketId] OrdersCancelled marketId
         * @property {websocket_api.ITransaction|null} [transaction] OrdersCancelled transaction
         */

        /**
         * Constructs a new OrdersCancelled.
         * @memberof websocket_api
         * @classdesc Represents an OrdersCancelled.
         * @implements IOrdersCancelled
         * @constructor
         * @param {websocket_api.IOrdersCancelled=} [properties] Properties to set
         */
        function OrdersCancelled(properties) {
            this.orderIds = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * OrdersCancelled orderIds.
         * @member {Array.<number|Long>} orderIds
         * @memberof websocket_api.OrdersCancelled
         * @instance
         */
        OrdersCancelled.prototype.orderIds = $util.emptyArray;

        /**
         * OrdersCancelled marketId.
         * @member {number|Long} marketId
         * @memberof websocket_api.OrdersCancelled
         * @instance
         */
        OrdersCancelled.prototype.marketId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * OrdersCancelled transaction.
         * @member {websocket_api.ITransaction|null|undefined} transaction
         * @memberof websocket_api.OrdersCancelled
         * @instance
         */
        OrdersCancelled.prototype.transaction = null;

        /**
         * Creates a new OrdersCancelled instance using the specified properties.
         * @function create
         * @memberof websocket_api.OrdersCancelled
         * @static
         * @param {websocket_api.IOrdersCancelled=} [properties] Properties to set
         * @returns {websocket_api.OrdersCancelled} OrdersCancelled instance
         */
        OrdersCancelled.create = function create(properties) {
            return new OrdersCancelled(properties);
        };

        /**
         * Encodes the specified OrdersCancelled message. Does not implicitly {@link websocket_api.OrdersCancelled.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.OrdersCancelled
         * @static
         * @param {websocket_api.IOrdersCancelled} message OrdersCancelled message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        OrdersCancelled.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.orderIds != null && message.orderIds.length) {
                writer.uint32(/* id 1, wireType 2 =*/10).fork();
                for (var i = 0; i < message.orderIds.length; ++i)
                    writer.int64(message.orderIds[i]);
                writer.ldelim();
            }
            if (message.marketId != null && Object.hasOwnProperty.call(message, "marketId"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.marketId);
            if (message.transaction != null && Object.hasOwnProperty.call(message, "transaction"))
                $root.websocket_api.Transaction.encode(message.transaction, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified OrdersCancelled message, length delimited. Does not implicitly {@link websocket_api.OrdersCancelled.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.OrdersCancelled
         * @static
         * @param {websocket_api.IOrdersCancelled} message OrdersCancelled message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        OrdersCancelled.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an OrdersCancelled message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.OrdersCancelled
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.OrdersCancelled} OrdersCancelled
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        OrdersCancelled.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.OrdersCancelled();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.orderIds && message.orderIds.length))
                            message.orderIds = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.orderIds.push(reader.int64());
                        } else
                            message.orderIds.push(reader.int64());
                        break;
                    }
                case 2: {
                        message.marketId = reader.int64();
                        break;
                    }
                case 3: {
                        message.transaction = $root.websocket_api.Transaction.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an OrdersCancelled message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.OrdersCancelled
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.OrdersCancelled} OrdersCancelled
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        OrdersCancelled.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an OrdersCancelled message.
         * @function verify
         * @memberof websocket_api.OrdersCancelled
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        OrdersCancelled.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.orderIds != null && message.hasOwnProperty("orderIds")) {
                if (!Array.isArray(message.orderIds))
                    return "orderIds: array expected";
                for (var i = 0; i < message.orderIds.length; ++i)
                    if (!$util.isInteger(message.orderIds[i]) && !(message.orderIds[i] && $util.isInteger(message.orderIds[i].low) && $util.isInteger(message.orderIds[i].high)))
                        return "orderIds: integer|Long[] expected";
            }
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (!$util.isInteger(message.marketId) && !(message.marketId && $util.isInteger(message.marketId.low) && $util.isInteger(message.marketId.high)))
                    return "marketId: integer|Long expected";
            if (message.transaction != null && message.hasOwnProperty("transaction")) {
                var error = $root.websocket_api.Transaction.verify(message.transaction);
                if (error)
                    return "transaction." + error;
            }
            return null;
        };

        /**
         * Creates an OrdersCancelled message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.OrdersCancelled
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.OrdersCancelled} OrdersCancelled
         */
        OrdersCancelled.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.OrdersCancelled)
                return object;
            var message = new $root.websocket_api.OrdersCancelled();
            if (object.orderIds) {
                if (!Array.isArray(object.orderIds))
                    throw TypeError(".websocket_api.OrdersCancelled.orderIds: array expected");
                message.orderIds = [];
                for (var i = 0; i < object.orderIds.length; ++i)
                    if ($util.Long)
                        (message.orderIds[i] = $util.Long.fromValue(object.orderIds[i])).unsigned = false;
                    else if (typeof object.orderIds[i] === "string")
                        message.orderIds[i] = parseInt(object.orderIds[i], 10);
                    else if (typeof object.orderIds[i] === "number")
                        message.orderIds[i] = object.orderIds[i];
                    else if (typeof object.orderIds[i] === "object")
                        message.orderIds[i] = new $util.LongBits(object.orderIds[i].low >>> 0, object.orderIds[i].high >>> 0).toNumber();
            }
            if (object.marketId != null)
                if ($util.Long)
                    (message.marketId = $util.Long.fromValue(object.marketId)).unsigned = false;
                else if (typeof object.marketId === "string")
                    message.marketId = parseInt(object.marketId, 10);
                else if (typeof object.marketId === "number")
                    message.marketId = object.marketId;
                else if (typeof object.marketId === "object")
                    message.marketId = new $util.LongBits(object.marketId.low >>> 0, object.marketId.high >>> 0).toNumber();
            if (object.transaction != null) {
                if (typeof object.transaction !== "object")
                    throw TypeError(".websocket_api.OrdersCancelled.transaction: object expected");
                message.transaction = $root.websocket_api.Transaction.fromObject(object.transaction);
            }
            return message;
        };

        /**
         * Creates a plain object from an OrdersCancelled message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.OrdersCancelled
         * @static
         * @param {websocket_api.OrdersCancelled} message OrdersCancelled
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        OrdersCancelled.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.orderIds = [];
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.marketId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.marketId = options.longs === String ? "0" : 0;
                object.transaction = null;
            }
            if (message.orderIds && message.orderIds.length) {
                object.orderIds = [];
                for (var j = 0; j < message.orderIds.length; ++j)
                    if (typeof message.orderIds[j] === "number")
                        object.orderIds[j] = options.longs === String ? String(message.orderIds[j]) : message.orderIds[j];
                    else
                        object.orderIds[j] = options.longs === String ? $util.Long.prototype.toString.call(message.orderIds[j]) : options.longs === Number ? new $util.LongBits(message.orderIds[j].low >>> 0, message.orderIds[j].high >>> 0).toNumber() : message.orderIds[j];
            }
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (typeof message.marketId === "number")
                    object.marketId = options.longs === String ? String(message.marketId) : message.marketId;
                else
                    object.marketId = options.longs === String ? $util.Long.prototype.toString.call(message.marketId) : options.longs === Number ? new $util.LongBits(message.marketId.low >>> 0, message.marketId.high >>> 0).toNumber() : message.marketId;
            if (message.transaction != null && message.hasOwnProperty("transaction"))
                object.transaction = $root.websocket_api.Transaction.toObject(message.transaction, options);
            return object;
        };

        /**
         * Converts this OrdersCancelled to JSON.
         * @function toJSON
         * @memberof websocket_api.OrdersCancelled
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        OrdersCancelled.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for OrdersCancelled
         * @function getTypeUrl
         * @memberof websocket_api.OrdersCancelled
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        OrdersCancelled.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.OrdersCancelled";
        };

        return OrdersCancelled;
    })();

    websocket_api.OrderCreated = (function() {

        /**
         * Properties of an OrderCreated.
         * @memberof websocket_api
         * @interface IOrderCreated
         * @property {number|Long|null} [marketId] OrderCreated marketId
         * @property {number|Long|null} [accountId] OrderCreated accountId
         * @property {websocket_api.IOrder|null} [order] OrderCreated order
         * @property {Array.<websocket_api.OrderCreated.IOrderFill>|null} [fills] OrderCreated fills
         * @property {Array.<websocket_api.ITrade>|null} [trades] OrderCreated trades
         * @property {websocket_api.ITransaction|null} [transaction] OrderCreated transaction
         */

        /**
         * Constructs a new OrderCreated.
         * @memberof websocket_api
         * @classdesc Represents an OrderCreated.
         * @implements IOrderCreated
         * @constructor
         * @param {websocket_api.IOrderCreated=} [properties] Properties to set
         */
        function OrderCreated(properties) {
            this.fills = [];
            this.trades = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * OrderCreated marketId.
         * @member {number|Long} marketId
         * @memberof websocket_api.OrderCreated
         * @instance
         */
        OrderCreated.prototype.marketId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * OrderCreated accountId.
         * @member {number|Long} accountId
         * @memberof websocket_api.OrderCreated
         * @instance
         */
        OrderCreated.prototype.accountId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * OrderCreated order.
         * @member {websocket_api.IOrder|null|undefined} order
         * @memberof websocket_api.OrderCreated
         * @instance
         */
        OrderCreated.prototype.order = null;

        /**
         * OrderCreated fills.
         * @member {Array.<websocket_api.OrderCreated.IOrderFill>} fills
         * @memberof websocket_api.OrderCreated
         * @instance
         */
        OrderCreated.prototype.fills = $util.emptyArray;

        /**
         * OrderCreated trades.
         * @member {Array.<websocket_api.ITrade>} trades
         * @memberof websocket_api.OrderCreated
         * @instance
         */
        OrderCreated.prototype.trades = $util.emptyArray;

        /**
         * OrderCreated transaction.
         * @member {websocket_api.ITransaction|null|undefined} transaction
         * @memberof websocket_api.OrderCreated
         * @instance
         */
        OrderCreated.prototype.transaction = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * OrderCreated _order.
         * @member {"order"|undefined} _order
         * @memberof websocket_api.OrderCreated
         * @instance
         */
        Object.defineProperty(OrderCreated.prototype, "_order", {
            get: $util.oneOfGetter($oneOfFields = ["order"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new OrderCreated instance using the specified properties.
         * @function create
         * @memberof websocket_api.OrderCreated
         * @static
         * @param {websocket_api.IOrderCreated=} [properties] Properties to set
         * @returns {websocket_api.OrderCreated} OrderCreated instance
         */
        OrderCreated.create = function create(properties) {
            return new OrderCreated(properties);
        };

        /**
         * Encodes the specified OrderCreated message. Does not implicitly {@link websocket_api.OrderCreated.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.OrderCreated
         * @static
         * @param {websocket_api.IOrderCreated} message OrderCreated message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        OrderCreated.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.marketId != null && Object.hasOwnProperty.call(message, "marketId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.marketId);
            if (message.accountId != null && Object.hasOwnProperty.call(message, "accountId"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.accountId);
            if (message.order != null && Object.hasOwnProperty.call(message, "order"))
                $root.websocket_api.Order.encode(message.order, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.fills != null && message.fills.length)
                for (var i = 0; i < message.fills.length; ++i)
                    $root.websocket_api.OrderCreated.OrderFill.encode(message.fills[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.trades != null && message.trades.length)
                for (var i = 0; i < message.trades.length; ++i)
                    $root.websocket_api.Trade.encode(message.trades[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.transaction != null && Object.hasOwnProperty.call(message, "transaction"))
                $root.websocket_api.Transaction.encode(message.transaction, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified OrderCreated message, length delimited. Does not implicitly {@link websocket_api.OrderCreated.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.OrderCreated
         * @static
         * @param {websocket_api.IOrderCreated} message OrderCreated message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        OrderCreated.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an OrderCreated message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.OrderCreated
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.OrderCreated} OrderCreated
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        OrderCreated.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.OrderCreated();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.marketId = reader.int64();
                        break;
                    }
                case 2: {
                        message.accountId = reader.int64();
                        break;
                    }
                case 3: {
                        message.order = $root.websocket_api.Order.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        if (!(message.fills && message.fills.length))
                            message.fills = [];
                        message.fills.push($root.websocket_api.OrderCreated.OrderFill.decode(reader, reader.uint32()));
                        break;
                    }
                case 5: {
                        if (!(message.trades && message.trades.length))
                            message.trades = [];
                        message.trades.push($root.websocket_api.Trade.decode(reader, reader.uint32()));
                        break;
                    }
                case 6: {
                        message.transaction = $root.websocket_api.Transaction.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an OrderCreated message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.OrderCreated
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.OrderCreated} OrderCreated
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        OrderCreated.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an OrderCreated message.
         * @function verify
         * @memberof websocket_api.OrderCreated
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        OrderCreated.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (!$util.isInteger(message.marketId) && !(message.marketId && $util.isInteger(message.marketId.low) && $util.isInteger(message.marketId.high)))
                    return "marketId: integer|Long expected";
            if (message.accountId != null && message.hasOwnProperty("accountId"))
                if (!$util.isInteger(message.accountId) && !(message.accountId && $util.isInteger(message.accountId.low) && $util.isInteger(message.accountId.high)))
                    return "accountId: integer|Long expected";
            if (message.order != null && message.hasOwnProperty("order")) {
                properties._order = 1;
                {
                    var error = $root.websocket_api.Order.verify(message.order);
                    if (error)
                        return "order." + error;
                }
            }
            if (message.fills != null && message.hasOwnProperty("fills")) {
                if (!Array.isArray(message.fills))
                    return "fills: array expected";
                for (var i = 0; i < message.fills.length; ++i) {
                    var error = $root.websocket_api.OrderCreated.OrderFill.verify(message.fills[i]);
                    if (error)
                        return "fills." + error;
                }
            }
            if (message.trades != null && message.hasOwnProperty("trades")) {
                if (!Array.isArray(message.trades))
                    return "trades: array expected";
                for (var i = 0; i < message.trades.length; ++i) {
                    var error = $root.websocket_api.Trade.verify(message.trades[i]);
                    if (error)
                        return "trades." + error;
                }
            }
            if (message.transaction != null && message.hasOwnProperty("transaction")) {
                var error = $root.websocket_api.Transaction.verify(message.transaction);
                if (error)
                    return "transaction." + error;
            }
            return null;
        };

        /**
         * Creates an OrderCreated message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.OrderCreated
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.OrderCreated} OrderCreated
         */
        OrderCreated.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.OrderCreated)
                return object;
            var message = new $root.websocket_api.OrderCreated();
            if (object.marketId != null)
                if ($util.Long)
                    (message.marketId = $util.Long.fromValue(object.marketId)).unsigned = false;
                else if (typeof object.marketId === "string")
                    message.marketId = parseInt(object.marketId, 10);
                else if (typeof object.marketId === "number")
                    message.marketId = object.marketId;
                else if (typeof object.marketId === "object")
                    message.marketId = new $util.LongBits(object.marketId.low >>> 0, object.marketId.high >>> 0).toNumber();
            if (object.accountId != null)
                if ($util.Long)
                    (message.accountId = $util.Long.fromValue(object.accountId)).unsigned = false;
                else if (typeof object.accountId === "string")
                    message.accountId = parseInt(object.accountId, 10);
                else if (typeof object.accountId === "number")
                    message.accountId = object.accountId;
                else if (typeof object.accountId === "object")
                    message.accountId = new $util.LongBits(object.accountId.low >>> 0, object.accountId.high >>> 0).toNumber();
            if (object.order != null) {
                if (typeof object.order !== "object")
                    throw TypeError(".websocket_api.OrderCreated.order: object expected");
                message.order = $root.websocket_api.Order.fromObject(object.order);
            }
            if (object.fills) {
                if (!Array.isArray(object.fills))
                    throw TypeError(".websocket_api.OrderCreated.fills: array expected");
                message.fills = [];
                for (var i = 0; i < object.fills.length; ++i) {
                    if (typeof object.fills[i] !== "object")
                        throw TypeError(".websocket_api.OrderCreated.fills: object expected");
                    message.fills[i] = $root.websocket_api.OrderCreated.OrderFill.fromObject(object.fills[i]);
                }
            }
            if (object.trades) {
                if (!Array.isArray(object.trades))
                    throw TypeError(".websocket_api.OrderCreated.trades: array expected");
                message.trades = [];
                for (var i = 0; i < object.trades.length; ++i) {
                    if (typeof object.trades[i] !== "object")
                        throw TypeError(".websocket_api.OrderCreated.trades: object expected");
                    message.trades[i] = $root.websocket_api.Trade.fromObject(object.trades[i]);
                }
            }
            if (object.transaction != null) {
                if (typeof object.transaction !== "object")
                    throw TypeError(".websocket_api.OrderCreated.transaction: object expected");
                message.transaction = $root.websocket_api.Transaction.fromObject(object.transaction);
            }
            return message;
        };

        /**
         * Creates a plain object from an OrderCreated message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.OrderCreated
         * @static
         * @param {websocket_api.OrderCreated} message OrderCreated
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        OrderCreated.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.fills = [];
                object.trades = [];
            }
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.marketId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.marketId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.accountId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.accountId = options.longs === String ? "0" : 0;
                object.transaction = null;
            }
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (typeof message.marketId === "number")
                    object.marketId = options.longs === String ? String(message.marketId) : message.marketId;
                else
                    object.marketId = options.longs === String ? $util.Long.prototype.toString.call(message.marketId) : options.longs === Number ? new $util.LongBits(message.marketId.low >>> 0, message.marketId.high >>> 0).toNumber() : message.marketId;
            if (message.accountId != null && message.hasOwnProperty("accountId"))
                if (typeof message.accountId === "number")
                    object.accountId = options.longs === String ? String(message.accountId) : message.accountId;
                else
                    object.accountId = options.longs === String ? $util.Long.prototype.toString.call(message.accountId) : options.longs === Number ? new $util.LongBits(message.accountId.low >>> 0, message.accountId.high >>> 0).toNumber() : message.accountId;
            if (message.order != null && message.hasOwnProperty("order")) {
                object.order = $root.websocket_api.Order.toObject(message.order, options);
                if (options.oneofs)
                    object._order = "order";
            }
            if (message.fills && message.fills.length) {
                object.fills = [];
                for (var j = 0; j < message.fills.length; ++j)
                    object.fills[j] = $root.websocket_api.OrderCreated.OrderFill.toObject(message.fills[j], options);
            }
            if (message.trades && message.trades.length) {
                object.trades = [];
                for (var j = 0; j < message.trades.length; ++j)
                    object.trades[j] = $root.websocket_api.Trade.toObject(message.trades[j], options);
            }
            if (message.transaction != null && message.hasOwnProperty("transaction"))
                object.transaction = $root.websocket_api.Transaction.toObject(message.transaction, options);
            return object;
        };

        /**
         * Converts this OrderCreated to JSON.
         * @function toJSON
         * @memberof websocket_api.OrderCreated
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        OrderCreated.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for OrderCreated
         * @function getTypeUrl
         * @memberof websocket_api.OrderCreated
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        OrderCreated.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.OrderCreated";
        };

        OrderCreated.OrderFill = (function() {

            /**
             * Properties of an OrderFill.
             * @memberof websocket_api.OrderCreated
             * @interface IOrderFill
             * @property {number|Long|null} [id] OrderFill id
             * @property {number|Long|null} [marketId] OrderFill marketId
             * @property {number|Long|null} [ownerId] OrderFill ownerId
             * @property {number|null} [sizeFilled] OrderFill sizeFilled
             * @property {number|null} [sizeRemaining] OrderFill sizeRemaining
             * @property {number|null} [price] OrderFill price
             * @property {websocket_api.Side|null} [side] OrderFill side
             */

            /**
             * Constructs a new OrderFill.
             * @memberof websocket_api.OrderCreated
             * @classdesc Represents an OrderFill.
             * @implements IOrderFill
             * @constructor
             * @param {websocket_api.OrderCreated.IOrderFill=} [properties] Properties to set
             */
            function OrderFill(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * OrderFill id.
             * @member {number|Long} id
             * @memberof websocket_api.OrderCreated.OrderFill
             * @instance
             */
            OrderFill.prototype.id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * OrderFill marketId.
             * @member {number|Long} marketId
             * @memberof websocket_api.OrderCreated.OrderFill
             * @instance
             */
            OrderFill.prototype.marketId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * OrderFill ownerId.
             * @member {number|Long} ownerId
             * @memberof websocket_api.OrderCreated.OrderFill
             * @instance
             */
            OrderFill.prototype.ownerId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * OrderFill sizeFilled.
             * @member {number} sizeFilled
             * @memberof websocket_api.OrderCreated.OrderFill
             * @instance
             */
            OrderFill.prototype.sizeFilled = 0;

            /**
             * OrderFill sizeRemaining.
             * @member {number} sizeRemaining
             * @memberof websocket_api.OrderCreated.OrderFill
             * @instance
             */
            OrderFill.prototype.sizeRemaining = 0;

            /**
             * OrderFill price.
             * @member {number} price
             * @memberof websocket_api.OrderCreated.OrderFill
             * @instance
             */
            OrderFill.prototype.price = 0;

            /**
             * OrderFill side.
             * @member {websocket_api.Side} side
             * @memberof websocket_api.OrderCreated.OrderFill
             * @instance
             */
            OrderFill.prototype.side = 0;

            /**
             * Creates a new OrderFill instance using the specified properties.
             * @function create
             * @memberof websocket_api.OrderCreated.OrderFill
             * @static
             * @param {websocket_api.OrderCreated.IOrderFill=} [properties] Properties to set
             * @returns {websocket_api.OrderCreated.OrderFill} OrderFill instance
             */
            OrderFill.create = function create(properties) {
                return new OrderFill(properties);
            };

            /**
             * Encodes the specified OrderFill message. Does not implicitly {@link websocket_api.OrderCreated.OrderFill.verify|verify} messages.
             * @function encode
             * @memberof websocket_api.OrderCreated.OrderFill
             * @static
             * @param {websocket_api.OrderCreated.IOrderFill} message OrderFill message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OrderFill.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.id);
                if (message.marketId != null && Object.hasOwnProperty.call(message, "marketId"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int64(message.marketId);
                if (message.sizeFilled != null && Object.hasOwnProperty.call(message, "sizeFilled"))
                    writer.uint32(/* id 4, wireType 1 =*/33).double(message.sizeFilled);
                if (message.sizeRemaining != null && Object.hasOwnProperty.call(message, "sizeRemaining"))
                    writer.uint32(/* id 5, wireType 1 =*/41).double(message.sizeRemaining);
                if (message.price != null && Object.hasOwnProperty.call(message, "price"))
                    writer.uint32(/* id 6, wireType 1 =*/49).double(message.price);
                if (message.side != null && Object.hasOwnProperty.call(message, "side"))
                    writer.uint32(/* id 7, wireType 0 =*/56).int32(message.side);
                if (message.ownerId != null && Object.hasOwnProperty.call(message, "ownerId"))
                    writer.uint32(/* id 8, wireType 0 =*/64).int64(message.ownerId);
                return writer;
            };

            /**
             * Encodes the specified OrderFill message, length delimited. Does not implicitly {@link websocket_api.OrderCreated.OrderFill.verify|verify} messages.
             * @function encodeDelimited
             * @memberof websocket_api.OrderCreated.OrderFill
             * @static
             * @param {websocket_api.OrderCreated.IOrderFill} message OrderFill message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            OrderFill.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an OrderFill message from the specified reader or buffer.
             * @function decode
             * @memberof websocket_api.OrderCreated.OrderFill
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {websocket_api.OrderCreated.OrderFill} OrderFill
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OrderFill.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.OrderCreated.OrderFill();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.id = reader.int64();
                            break;
                        }
                    case 2: {
                            message.marketId = reader.int64();
                            break;
                        }
                    case 8: {
                            message.ownerId = reader.int64();
                            break;
                        }
                    case 4: {
                            message.sizeFilled = reader.double();
                            break;
                        }
                    case 5: {
                            message.sizeRemaining = reader.double();
                            break;
                        }
                    case 6: {
                            message.price = reader.double();
                            break;
                        }
                    case 7: {
                            message.side = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an OrderFill message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof websocket_api.OrderCreated.OrderFill
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {websocket_api.OrderCreated.OrderFill} OrderFill
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            OrderFill.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an OrderFill message.
             * @function verify
             * @memberof websocket_api.OrderCreated.OrderFill
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            OrderFill.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.id != null && message.hasOwnProperty("id"))
                    if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                        return "id: integer|Long expected";
                if (message.marketId != null && message.hasOwnProperty("marketId"))
                    if (!$util.isInteger(message.marketId) && !(message.marketId && $util.isInteger(message.marketId.low) && $util.isInteger(message.marketId.high)))
                        return "marketId: integer|Long expected";
                if (message.ownerId != null && message.hasOwnProperty("ownerId"))
                    if (!$util.isInteger(message.ownerId) && !(message.ownerId && $util.isInteger(message.ownerId.low) && $util.isInteger(message.ownerId.high)))
                        return "ownerId: integer|Long expected";
                if (message.sizeFilled != null && message.hasOwnProperty("sizeFilled"))
                    if (typeof message.sizeFilled !== "number")
                        return "sizeFilled: number expected";
                if (message.sizeRemaining != null && message.hasOwnProperty("sizeRemaining"))
                    if (typeof message.sizeRemaining !== "number")
                        return "sizeRemaining: number expected";
                if (message.price != null && message.hasOwnProperty("price"))
                    if (typeof message.price !== "number")
                        return "price: number expected";
                if (message.side != null && message.hasOwnProperty("side"))
                    switch (message.side) {
                    default:
                        return "side: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                        break;
                    }
                return null;
            };

            /**
             * Creates an OrderFill message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof websocket_api.OrderCreated.OrderFill
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {websocket_api.OrderCreated.OrderFill} OrderFill
             */
            OrderFill.fromObject = function fromObject(object) {
                if (object instanceof $root.websocket_api.OrderCreated.OrderFill)
                    return object;
                var message = new $root.websocket_api.OrderCreated.OrderFill();
                if (object.id != null)
                    if ($util.Long)
                        (message.id = $util.Long.fromValue(object.id)).unsigned = false;
                    else if (typeof object.id === "string")
                        message.id = parseInt(object.id, 10);
                    else if (typeof object.id === "number")
                        message.id = object.id;
                    else if (typeof object.id === "object")
                        message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
                if (object.marketId != null)
                    if ($util.Long)
                        (message.marketId = $util.Long.fromValue(object.marketId)).unsigned = false;
                    else if (typeof object.marketId === "string")
                        message.marketId = parseInt(object.marketId, 10);
                    else if (typeof object.marketId === "number")
                        message.marketId = object.marketId;
                    else if (typeof object.marketId === "object")
                        message.marketId = new $util.LongBits(object.marketId.low >>> 0, object.marketId.high >>> 0).toNumber();
                if (object.ownerId != null)
                    if ($util.Long)
                        (message.ownerId = $util.Long.fromValue(object.ownerId)).unsigned = false;
                    else if (typeof object.ownerId === "string")
                        message.ownerId = parseInt(object.ownerId, 10);
                    else if (typeof object.ownerId === "number")
                        message.ownerId = object.ownerId;
                    else if (typeof object.ownerId === "object")
                        message.ownerId = new $util.LongBits(object.ownerId.low >>> 0, object.ownerId.high >>> 0).toNumber();
                if (object.sizeFilled != null)
                    message.sizeFilled = Number(object.sizeFilled);
                if (object.sizeRemaining != null)
                    message.sizeRemaining = Number(object.sizeRemaining);
                if (object.price != null)
                    message.price = Number(object.price);
                switch (object.side) {
                default:
                    if (typeof object.side === "number") {
                        message.side = object.side;
                        break;
                    }
                    break;
                case "UNKNOWN":
                case 0:
                    message.side = 0;
                    break;
                case "BID":
                case 1:
                    message.side = 1;
                    break;
                case "OFFER":
                case 2:
                    message.side = 2;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from an OrderFill message. Also converts values to other types if specified.
             * @function toObject
             * @memberof websocket_api.OrderCreated.OrderFill
             * @static
             * @param {websocket_api.OrderCreated.OrderFill} message OrderFill
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            OrderFill.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.id = options.longs === String ? "0" : 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.marketId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.marketId = options.longs === String ? "0" : 0;
                    object.sizeFilled = 0;
                    object.sizeRemaining = 0;
                    object.price = 0;
                    object.side = options.enums === String ? "UNKNOWN" : 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.ownerId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.ownerId = options.longs === String ? "0" : 0;
                }
                if (message.id != null && message.hasOwnProperty("id"))
                    if (typeof message.id === "number")
                        object.id = options.longs === String ? String(message.id) : message.id;
                    else
                        object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
                if (message.marketId != null && message.hasOwnProperty("marketId"))
                    if (typeof message.marketId === "number")
                        object.marketId = options.longs === String ? String(message.marketId) : message.marketId;
                    else
                        object.marketId = options.longs === String ? $util.Long.prototype.toString.call(message.marketId) : options.longs === Number ? new $util.LongBits(message.marketId.low >>> 0, message.marketId.high >>> 0).toNumber() : message.marketId;
                if (message.sizeFilled != null && message.hasOwnProperty("sizeFilled"))
                    object.sizeFilled = options.json && !isFinite(message.sizeFilled) ? String(message.sizeFilled) : message.sizeFilled;
                if (message.sizeRemaining != null && message.hasOwnProperty("sizeRemaining"))
                    object.sizeRemaining = options.json && !isFinite(message.sizeRemaining) ? String(message.sizeRemaining) : message.sizeRemaining;
                if (message.price != null && message.hasOwnProperty("price"))
                    object.price = options.json && !isFinite(message.price) ? String(message.price) : message.price;
                if (message.side != null && message.hasOwnProperty("side"))
                    object.side = options.enums === String ? $root.websocket_api.Side[message.side] === undefined ? message.side : $root.websocket_api.Side[message.side] : message.side;
                if (message.ownerId != null && message.hasOwnProperty("ownerId"))
                    if (typeof message.ownerId === "number")
                        object.ownerId = options.longs === String ? String(message.ownerId) : message.ownerId;
                    else
                        object.ownerId = options.longs === String ? $util.Long.prototype.toString.call(message.ownerId) : options.longs === Number ? new $util.LongBits(message.ownerId.low >>> 0, message.ownerId.high >>> 0).toNumber() : message.ownerId;
                return object;
            };

            /**
             * Converts this OrderFill to JSON.
             * @function toJSON
             * @memberof websocket_api.OrderCreated.OrderFill
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            OrderFill.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for OrderFill
             * @function getTypeUrl
             * @memberof websocket_api.OrderCreated.OrderFill
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            OrderFill.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/websocket_api.OrderCreated.OrderFill";
            };

            return OrderFill;
        })();

        return OrderCreated;
    })();

    websocket_api.Order = (function() {

        /**
         * Properties of an Order.
         * @memberof websocket_api
         * @interface IOrder
         * @property {number|Long|null} [id] Order id
         * @property {number|Long|null} [marketId] Order marketId
         * @property {number|Long|null} [ownerId] Order ownerId
         * @property {number|Long|null} [transactionId] Order transactionId
         * @property {number|null} [price] Order price
         * @property {number|null} [size] Order size
         * @property {websocket_api.Side|null} [side] Order side
         * @property {Array.<websocket_api.ISize>|null} [sizes] Order sizes
         */

        /**
         * Constructs a new Order.
         * @memberof websocket_api
         * @classdesc Represents an Order.
         * @implements IOrder
         * @constructor
         * @param {websocket_api.IOrder=} [properties] Properties to set
         */
        function Order(properties) {
            this.sizes = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Order id.
         * @member {number|Long} id
         * @memberof websocket_api.Order
         * @instance
         */
        Order.prototype.id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Order marketId.
         * @member {number|Long} marketId
         * @memberof websocket_api.Order
         * @instance
         */
        Order.prototype.marketId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Order ownerId.
         * @member {number|Long} ownerId
         * @memberof websocket_api.Order
         * @instance
         */
        Order.prototype.ownerId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Order transactionId.
         * @member {number|Long} transactionId
         * @memberof websocket_api.Order
         * @instance
         */
        Order.prototype.transactionId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Order price.
         * @member {number} price
         * @memberof websocket_api.Order
         * @instance
         */
        Order.prototype.price = 0;

        /**
         * Order size.
         * @member {number} size
         * @memberof websocket_api.Order
         * @instance
         */
        Order.prototype.size = 0;

        /**
         * Order side.
         * @member {websocket_api.Side} side
         * @memberof websocket_api.Order
         * @instance
         */
        Order.prototype.side = 0;

        /**
         * Order sizes.
         * @member {Array.<websocket_api.ISize>} sizes
         * @memberof websocket_api.Order
         * @instance
         */
        Order.prototype.sizes = $util.emptyArray;

        /**
         * Creates a new Order instance using the specified properties.
         * @function create
         * @memberof websocket_api.Order
         * @static
         * @param {websocket_api.IOrder=} [properties] Properties to set
         * @returns {websocket_api.Order} Order instance
         */
        Order.create = function create(properties) {
            return new Order(properties);
        };

        /**
         * Encodes the specified Order message. Does not implicitly {@link websocket_api.Order.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Order
         * @static
         * @param {websocket_api.IOrder} message Order message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Order.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.id);
            if (message.marketId != null && Object.hasOwnProperty.call(message, "marketId"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.marketId);
            if (message.transactionId != null && Object.hasOwnProperty.call(message, "transactionId"))
                writer.uint32(/* id 4, wireType 0 =*/32).int64(message.transactionId);
            if (message.price != null && Object.hasOwnProperty.call(message, "price"))
                writer.uint32(/* id 5, wireType 1 =*/41).double(message.price);
            if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                writer.uint32(/* id 6, wireType 1 =*/49).double(message.size);
            if (message.side != null && Object.hasOwnProperty.call(message, "side"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.side);
            if (message.sizes != null && message.sizes.length)
                for (var i = 0; i < message.sizes.length; ++i)
                    $root.websocket_api.Size.encode(message.sizes[i], writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.ownerId != null && Object.hasOwnProperty.call(message, "ownerId"))
                writer.uint32(/* id 9, wireType 0 =*/72).int64(message.ownerId);
            return writer;
        };

        /**
         * Encodes the specified Order message, length delimited. Does not implicitly {@link websocket_api.Order.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Order
         * @static
         * @param {websocket_api.IOrder} message Order message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Order.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Order message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Order
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Order} Order
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Order.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Order();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.int64();
                        break;
                    }
                case 2: {
                        message.marketId = reader.int64();
                        break;
                    }
                case 9: {
                        message.ownerId = reader.int64();
                        break;
                    }
                case 4: {
                        message.transactionId = reader.int64();
                        break;
                    }
                case 5: {
                        message.price = reader.double();
                        break;
                    }
                case 6: {
                        message.size = reader.double();
                        break;
                    }
                case 7: {
                        message.side = reader.int32();
                        break;
                    }
                case 8: {
                        if (!(message.sizes && message.sizes.length))
                            message.sizes = [];
                        message.sizes.push($root.websocket_api.Size.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Order message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Order
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Order} Order
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Order.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Order message.
         * @function verify
         * @memberof websocket_api.Order
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Order.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (!$util.isInteger(message.marketId) && !(message.marketId && $util.isInteger(message.marketId.low) && $util.isInteger(message.marketId.high)))
                    return "marketId: integer|Long expected";
            if (message.ownerId != null && message.hasOwnProperty("ownerId"))
                if (!$util.isInteger(message.ownerId) && !(message.ownerId && $util.isInteger(message.ownerId.low) && $util.isInteger(message.ownerId.high)))
                    return "ownerId: integer|Long expected";
            if (message.transactionId != null && message.hasOwnProperty("transactionId"))
                if (!$util.isInteger(message.transactionId) && !(message.transactionId && $util.isInteger(message.transactionId.low) && $util.isInteger(message.transactionId.high)))
                    return "transactionId: integer|Long expected";
            if (message.price != null && message.hasOwnProperty("price"))
                if (typeof message.price !== "number")
                    return "price: number expected";
            if (message.size != null && message.hasOwnProperty("size"))
                if (typeof message.size !== "number")
                    return "size: number expected";
            if (message.side != null && message.hasOwnProperty("side"))
                switch (message.side) {
                default:
                    return "side: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.sizes != null && message.hasOwnProperty("sizes")) {
                if (!Array.isArray(message.sizes))
                    return "sizes: array expected";
                for (var i = 0; i < message.sizes.length; ++i) {
                    var error = $root.websocket_api.Size.verify(message.sizes[i]);
                    if (error)
                        return "sizes." + error;
                }
            }
            return null;
        };

        /**
         * Creates an Order message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Order
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Order} Order
         */
        Order.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Order)
                return object;
            var message = new $root.websocket_api.Order();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = false;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
            if (object.marketId != null)
                if ($util.Long)
                    (message.marketId = $util.Long.fromValue(object.marketId)).unsigned = false;
                else if (typeof object.marketId === "string")
                    message.marketId = parseInt(object.marketId, 10);
                else if (typeof object.marketId === "number")
                    message.marketId = object.marketId;
                else if (typeof object.marketId === "object")
                    message.marketId = new $util.LongBits(object.marketId.low >>> 0, object.marketId.high >>> 0).toNumber();
            if (object.ownerId != null)
                if ($util.Long)
                    (message.ownerId = $util.Long.fromValue(object.ownerId)).unsigned = false;
                else if (typeof object.ownerId === "string")
                    message.ownerId = parseInt(object.ownerId, 10);
                else if (typeof object.ownerId === "number")
                    message.ownerId = object.ownerId;
                else if (typeof object.ownerId === "object")
                    message.ownerId = new $util.LongBits(object.ownerId.low >>> 0, object.ownerId.high >>> 0).toNumber();
            if (object.transactionId != null)
                if ($util.Long)
                    (message.transactionId = $util.Long.fromValue(object.transactionId)).unsigned = false;
                else if (typeof object.transactionId === "string")
                    message.transactionId = parseInt(object.transactionId, 10);
                else if (typeof object.transactionId === "number")
                    message.transactionId = object.transactionId;
                else if (typeof object.transactionId === "object")
                    message.transactionId = new $util.LongBits(object.transactionId.low >>> 0, object.transactionId.high >>> 0).toNumber();
            if (object.price != null)
                message.price = Number(object.price);
            if (object.size != null)
                message.size = Number(object.size);
            switch (object.side) {
            default:
                if (typeof object.side === "number") {
                    message.side = object.side;
                    break;
                }
                break;
            case "UNKNOWN":
            case 0:
                message.side = 0;
                break;
            case "BID":
            case 1:
                message.side = 1;
                break;
            case "OFFER":
            case 2:
                message.side = 2;
                break;
            }
            if (object.sizes) {
                if (!Array.isArray(object.sizes))
                    throw TypeError(".websocket_api.Order.sizes: array expected");
                message.sizes = [];
                for (var i = 0; i < object.sizes.length; ++i) {
                    if (typeof object.sizes[i] !== "object")
                        throw TypeError(".websocket_api.Order.sizes: object expected");
                    message.sizes[i] = $root.websocket_api.Size.fromObject(object.sizes[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an Order message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Order
         * @static
         * @param {websocket_api.Order} message Order
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Order.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.sizes = [];
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.marketId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.marketId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.transactionId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.transactionId = options.longs === String ? "0" : 0;
                object.price = 0;
                object.size = 0;
                object.side = options.enums === String ? "UNKNOWN" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.ownerId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.ownerId = options.longs === String ? "0" : 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (typeof message.marketId === "number")
                    object.marketId = options.longs === String ? String(message.marketId) : message.marketId;
                else
                    object.marketId = options.longs === String ? $util.Long.prototype.toString.call(message.marketId) : options.longs === Number ? new $util.LongBits(message.marketId.low >>> 0, message.marketId.high >>> 0).toNumber() : message.marketId;
            if (message.transactionId != null && message.hasOwnProperty("transactionId"))
                if (typeof message.transactionId === "number")
                    object.transactionId = options.longs === String ? String(message.transactionId) : message.transactionId;
                else
                    object.transactionId = options.longs === String ? $util.Long.prototype.toString.call(message.transactionId) : options.longs === Number ? new $util.LongBits(message.transactionId.low >>> 0, message.transactionId.high >>> 0).toNumber() : message.transactionId;
            if (message.price != null && message.hasOwnProperty("price"))
                object.price = options.json && !isFinite(message.price) ? String(message.price) : message.price;
            if (message.size != null && message.hasOwnProperty("size"))
                object.size = options.json && !isFinite(message.size) ? String(message.size) : message.size;
            if (message.side != null && message.hasOwnProperty("side"))
                object.side = options.enums === String ? $root.websocket_api.Side[message.side] === undefined ? message.side : $root.websocket_api.Side[message.side] : message.side;
            if (message.sizes && message.sizes.length) {
                object.sizes = [];
                for (var j = 0; j < message.sizes.length; ++j)
                    object.sizes[j] = $root.websocket_api.Size.toObject(message.sizes[j], options);
            }
            if (message.ownerId != null && message.hasOwnProperty("ownerId"))
                if (typeof message.ownerId === "number")
                    object.ownerId = options.longs === String ? String(message.ownerId) : message.ownerId;
                else
                    object.ownerId = options.longs === String ? $util.Long.prototype.toString.call(message.ownerId) : options.longs === Number ? new $util.LongBits(message.ownerId.low >>> 0, message.ownerId.high >>> 0).toNumber() : message.ownerId;
            return object;
        };

        /**
         * Converts this Order to JSON.
         * @function toJSON
         * @memberof websocket_api.Order
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Order.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Order
         * @function getTypeUrl
         * @memberof websocket_api.Order
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Order.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Order";
        };

        return Order;
    })();

    websocket_api.Size = (function() {

        /**
         * Properties of a Size.
         * @memberof websocket_api
         * @interface ISize
         * @property {number|Long|null} [transactionId] Size transactionId
         * @property {number|null} [size] Size size
         */

        /**
         * Constructs a new Size.
         * @memberof websocket_api
         * @classdesc Represents a Size.
         * @implements ISize
         * @constructor
         * @param {websocket_api.ISize=} [properties] Properties to set
         */
        function Size(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Size transactionId.
         * @member {number|Long} transactionId
         * @memberof websocket_api.Size
         * @instance
         */
        Size.prototype.transactionId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Size size.
         * @member {number} size
         * @memberof websocket_api.Size
         * @instance
         */
        Size.prototype.size = 0;

        /**
         * Creates a new Size instance using the specified properties.
         * @function create
         * @memberof websocket_api.Size
         * @static
         * @param {websocket_api.ISize=} [properties] Properties to set
         * @returns {websocket_api.Size} Size instance
         */
        Size.create = function create(properties) {
            return new Size(properties);
        };

        /**
         * Encodes the specified Size message. Does not implicitly {@link websocket_api.Size.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Size
         * @static
         * @param {websocket_api.ISize} message Size message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Size.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.transactionId != null && Object.hasOwnProperty.call(message, "transactionId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.transactionId);
            if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.size);
            return writer;
        };

        /**
         * Encodes the specified Size message, length delimited. Does not implicitly {@link websocket_api.Size.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Size
         * @static
         * @param {websocket_api.ISize} message Size message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Size.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Size message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Size
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Size} Size
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Size.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Size();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.transactionId = reader.int64();
                        break;
                    }
                case 2: {
                        message.size = reader.double();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Size message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Size
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Size} Size
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Size.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Size message.
         * @function verify
         * @memberof websocket_api.Size
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Size.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.transactionId != null && message.hasOwnProperty("transactionId"))
                if (!$util.isInteger(message.transactionId) && !(message.transactionId && $util.isInteger(message.transactionId.low) && $util.isInteger(message.transactionId.high)))
                    return "transactionId: integer|Long expected";
            if (message.size != null && message.hasOwnProperty("size"))
                if (typeof message.size !== "number")
                    return "size: number expected";
            return null;
        };

        /**
         * Creates a Size message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Size
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Size} Size
         */
        Size.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Size)
                return object;
            var message = new $root.websocket_api.Size();
            if (object.transactionId != null)
                if ($util.Long)
                    (message.transactionId = $util.Long.fromValue(object.transactionId)).unsigned = false;
                else if (typeof object.transactionId === "string")
                    message.transactionId = parseInt(object.transactionId, 10);
                else if (typeof object.transactionId === "number")
                    message.transactionId = object.transactionId;
                else if (typeof object.transactionId === "object")
                    message.transactionId = new $util.LongBits(object.transactionId.low >>> 0, object.transactionId.high >>> 0).toNumber();
            if (object.size != null)
                message.size = Number(object.size);
            return message;
        };

        /**
         * Creates a plain object from a Size message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Size
         * @static
         * @param {websocket_api.Size} message Size
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Size.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.transactionId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.transactionId = options.longs === String ? "0" : 0;
                object.size = 0;
            }
            if (message.transactionId != null && message.hasOwnProperty("transactionId"))
                if (typeof message.transactionId === "number")
                    object.transactionId = options.longs === String ? String(message.transactionId) : message.transactionId;
                else
                    object.transactionId = options.longs === String ? $util.Long.prototype.toString.call(message.transactionId) : options.longs === Number ? new $util.LongBits(message.transactionId.low >>> 0, message.transactionId.high >>> 0).toNumber() : message.transactionId;
            if (message.size != null && message.hasOwnProperty("size"))
                object.size = options.json && !isFinite(message.size) ? String(message.size) : message.size;
            return object;
        };

        /**
         * Converts this Size to JSON.
         * @function toJSON
         * @memberof websocket_api.Size
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Size.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Size
         * @function getTypeUrl
         * @memberof websocket_api.Size
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Size.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Size";
        };

        return Size;
    })();

    /**
     * Side enum.
     * @name websocket_api.Side
     * @enum {number}
     * @property {number} UNKNOWN=0 UNKNOWN value
     * @property {number} BID=1 BID value
     * @property {number} OFFER=2 OFFER value
     */
    websocket_api.Side = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "UNKNOWN"] = 0;
        values[valuesById[1] = "BID"] = 1;
        values[valuesById[2] = "OFFER"] = 2;
        return values;
    })();

    websocket_api.Trade = (function() {

        /**
         * Properties of a Trade.
         * @memberof websocket_api
         * @interface ITrade
         * @property {number|Long|null} [id] Trade id
         * @property {number|Long|null} [marketId] Trade marketId
         * @property {number|Long|null} [transactionId] Trade transactionId
         * @property {number|null} [price] Trade price
         * @property {number|null} [size] Trade size
         * @property {number|Long|null} [buyerId] Trade buyerId
         * @property {number|Long|null} [sellerId] Trade sellerId
         */

        /**
         * Constructs a new Trade.
         * @memberof websocket_api
         * @classdesc Represents a Trade.
         * @implements ITrade
         * @constructor
         * @param {websocket_api.ITrade=} [properties] Properties to set
         */
        function Trade(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Trade id.
         * @member {number|Long} id
         * @memberof websocket_api.Trade
         * @instance
         */
        Trade.prototype.id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Trade marketId.
         * @member {number|Long} marketId
         * @memberof websocket_api.Trade
         * @instance
         */
        Trade.prototype.marketId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Trade transactionId.
         * @member {number|Long} transactionId
         * @memberof websocket_api.Trade
         * @instance
         */
        Trade.prototype.transactionId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Trade price.
         * @member {number} price
         * @memberof websocket_api.Trade
         * @instance
         */
        Trade.prototype.price = 0;

        /**
         * Trade size.
         * @member {number} size
         * @memberof websocket_api.Trade
         * @instance
         */
        Trade.prototype.size = 0;

        /**
         * Trade buyerId.
         * @member {number|Long} buyerId
         * @memberof websocket_api.Trade
         * @instance
         */
        Trade.prototype.buyerId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Trade sellerId.
         * @member {number|Long} sellerId
         * @memberof websocket_api.Trade
         * @instance
         */
        Trade.prototype.sellerId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new Trade instance using the specified properties.
         * @function create
         * @memberof websocket_api.Trade
         * @static
         * @param {websocket_api.ITrade=} [properties] Properties to set
         * @returns {websocket_api.Trade} Trade instance
         */
        Trade.create = function create(properties) {
            return new Trade(properties);
        };

        /**
         * Encodes the specified Trade message. Does not implicitly {@link websocket_api.Trade.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Trade
         * @static
         * @param {websocket_api.ITrade} message Trade message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Trade.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.id);
            if (message.marketId != null && Object.hasOwnProperty.call(message, "marketId"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.marketId);
            if (message.transactionId != null && Object.hasOwnProperty.call(message, "transactionId"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.transactionId);
            if (message.price != null && Object.hasOwnProperty.call(message, "price"))
                writer.uint32(/* id 4, wireType 1 =*/33).double(message.price);
            if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                writer.uint32(/* id 5, wireType 1 =*/41).double(message.size);
            if (message.buyerId != null && Object.hasOwnProperty.call(message, "buyerId"))
                writer.uint32(/* id 8, wireType 0 =*/64).int64(message.buyerId);
            if (message.sellerId != null && Object.hasOwnProperty.call(message, "sellerId"))
                writer.uint32(/* id 9, wireType 0 =*/72).int64(message.sellerId);
            return writer;
        };

        /**
         * Encodes the specified Trade message, length delimited. Does not implicitly {@link websocket_api.Trade.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Trade
         * @static
         * @param {websocket_api.ITrade} message Trade message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Trade.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Trade message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Trade
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Trade} Trade
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Trade.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Trade();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.int64();
                        break;
                    }
                case 2: {
                        message.marketId = reader.int64();
                        break;
                    }
                case 3: {
                        message.transactionId = reader.int64();
                        break;
                    }
                case 4: {
                        message.price = reader.double();
                        break;
                    }
                case 5: {
                        message.size = reader.double();
                        break;
                    }
                case 8: {
                        message.buyerId = reader.int64();
                        break;
                    }
                case 9: {
                        message.sellerId = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Trade message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Trade
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Trade} Trade
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Trade.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Trade message.
         * @function verify
         * @memberof websocket_api.Trade
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Trade.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (!$util.isInteger(message.marketId) && !(message.marketId && $util.isInteger(message.marketId.low) && $util.isInteger(message.marketId.high)))
                    return "marketId: integer|Long expected";
            if (message.transactionId != null && message.hasOwnProperty("transactionId"))
                if (!$util.isInteger(message.transactionId) && !(message.transactionId && $util.isInteger(message.transactionId.low) && $util.isInteger(message.transactionId.high)))
                    return "transactionId: integer|Long expected";
            if (message.price != null && message.hasOwnProperty("price"))
                if (typeof message.price !== "number")
                    return "price: number expected";
            if (message.size != null && message.hasOwnProperty("size"))
                if (typeof message.size !== "number")
                    return "size: number expected";
            if (message.buyerId != null && message.hasOwnProperty("buyerId"))
                if (!$util.isInteger(message.buyerId) && !(message.buyerId && $util.isInteger(message.buyerId.low) && $util.isInteger(message.buyerId.high)))
                    return "buyerId: integer|Long expected";
            if (message.sellerId != null && message.hasOwnProperty("sellerId"))
                if (!$util.isInteger(message.sellerId) && !(message.sellerId && $util.isInteger(message.sellerId.low) && $util.isInteger(message.sellerId.high)))
                    return "sellerId: integer|Long expected";
            return null;
        };

        /**
         * Creates a Trade message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Trade
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Trade} Trade
         */
        Trade.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Trade)
                return object;
            var message = new $root.websocket_api.Trade();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = false;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
            if (object.marketId != null)
                if ($util.Long)
                    (message.marketId = $util.Long.fromValue(object.marketId)).unsigned = false;
                else if (typeof object.marketId === "string")
                    message.marketId = parseInt(object.marketId, 10);
                else if (typeof object.marketId === "number")
                    message.marketId = object.marketId;
                else if (typeof object.marketId === "object")
                    message.marketId = new $util.LongBits(object.marketId.low >>> 0, object.marketId.high >>> 0).toNumber();
            if (object.transactionId != null)
                if ($util.Long)
                    (message.transactionId = $util.Long.fromValue(object.transactionId)).unsigned = false;
                else if (typeof object.transactionId === "string")
                    message.transactionId = parseInt(object.transactionId, 10);
                else if (typeof object.transactionId === "number")
                    message.transactionId = object.transactionId;
                else if (typeof object.transactionId === "object")
                    message.transactionId = new $util.LongBits(object.transactionId.low >>> 0, object.transactionId.high >>> 0).toNumber();
            if (object.price != null)
                message.price = Number(object.price);
            if (object.size != null)
                message.size = Number(object.size);
            if (object.buyerId != null)
                if ($util.Long)
                    (message.buyerId = $util.Long.fromValue(object.buyerId)).unsigned = false;
                else if (typeof object.buyerId === "string")
                    message.buyerId = parseInt(object.buyerId, 10);
                else if (typeof object.buyerId === "number")
                    message.buyerId = object.buyerId;
                else if (typeof object.buyerId === "object")
                    message.buyerId = new $util.LongBits(object.buyerId.low >>> 0, object.buyerId.high >>> 0).toNumber();
            if (object.sellerId != null)
                if ($util.Long)
                    (message.sellerId = $util.Long.fromValue(object.sellerId)).unsigned = false;
                else if (typeof object.sellerId === "string")
                    message.sellerId = parseInt(object.sellerId, 10);
                else if (typeof object.sellerId === "number")
                    message.sellerId = object.sellerId;
                else if (typeof object.sellerId === "object")
                    message.sellerId = new $util.LongBits(object.sellerId.low >>> 0, object.sellerId.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a Trade message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Trade
         * @static
         * @param {websocket_api.Trade} message Trade
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Trade.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.marketId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.marketId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.transactionId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.transactionId = options.longs === String ? "0" : 0;
                object.price = 0;
                object.size = 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.buyerId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.buyerId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.sellerId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.sellerId = options.longs === String ? "0" : 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (typeof message.marketId === "number")
                    object.marketId = options.longs === String ? String(message.marketId) : message.marketId;
                else
                    object.marketId = options.longs === String ? $util.Long.prototype.toString.call(message.marketId) : options.longs === Number ? new $util.LongBits(message.marketId.low >>> 0, message.marketId.high >>> 0).toNumber() : message.marketId;
            if (message.transactionId != null && message.hasOwnProperty("transactionId"))
                if (typeof message.transactionId === "number")
                    object.transactionId = options.longs === String ? String(message.transactionId) : message.transactionId;
                else
                    object.transactionId = options.longs === String ? $util.Long.prototype.toString.call(message.transactionId) : options.longs === Number ? new $util.LongBits(message.transactionId.low >>> 0, message.transactionId.high >>> 0).toNumber() : message.transactionId;
            if (message.price != null && message.hasOwnProperty("price"))
                object.price = options.json && !isFinite(message.price) ? String(message.price) : message.price;
            if (message.size != null && message.hasOwnProperty("size"))
                object.size = options.json && !isFinite(message.size) ? String(message.size) : message.size;
            if (message.buyerId != null && message.hasOwnProperty("buyerId"))
                if (typeof message.buyerId === "number")
                    object.buyerId = options.longs === String ? String(message.buyerId) : message.buyerId;
                else
                    object.buyerId = options.longs === String ? $util.Long.prototype.toString.call(message.buyerId) : options.longs === Number ? new $util.LongBits(message.buyerId.low >>> 0, message.buyerId.high >>> 0).toNumber() : message.buyerId;
            if (message.sellerId != null && message.hasOwnProperty("sellerId"))
                if (typeof message.sellerId === "number")
                    object.sellerId = options.longs === String ? String(message.sellerId) : message.sellerId;
                else
                    object.sellerId = options.longs === String ? $util.Long.prototype.toString.call(message.sellerId) : options.longs === Number ? new $util.LongBits(message.sellerId.low >>> 0, message.sellerId.high >>> 0).toNumber() : message.sellerId;
            return object;
        };

        /**
         * Converts this Trade to JSON.
         * @function toJSON
         * @memberof websocket_api.Trade
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Trade.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Trade
         * @function getTypeUrl
         * @memberof websocket_api.Trade
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Trade.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Trade";
        };

        return Trade;
    })();

    websocket_api.Transfer = (function() {

        /**
         * Properties of a Transfer.
         * @memberof websocket_api
         * @interface ITransfer
         * @property {number|Long|null} [id] Transfer id
         * @property {number|Long|null} [initiatorId] Transfer initiatorId
         * @property {number|Long|null} [fromAccountId] Transfer fromAccountId
         * @property {number|Long|null} [toAccountId] Transfer toAccountId
         * @property {websocket_api.ITransaction|null} [transaction] Transfer transaction
         * @property {number|null} [amount] Transfer amount
         * @property {string|null} [note] Transfer note
         */

        /**
         * Constructs a new Transfer.
         * @memberof websocket_api
         * @classdesc Represents a Transfer.
         * @implements ITransfer
         * @constructor
         * @param {websocket_api.ITransfer=} [properties] Properties to set
         */
        function Transfer(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Transfer id.
         * @member {number|Long} id
         * @memberof websocket_api.Transfer
         * @instance
         */
        Transfer.prototype.id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Transfer initiatorId.
         * @member {number|Long} initiatorId
         * @memberof websocket_api.Transfer
         * @instance
         */
        Transfer.prototype.initiatorId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Transfer fromAccountId.
         * @member {number|Long} fromAccountId
         * @memberof websocket_api.Transfer
         * @instance
         */
        Transfer.prototype.fromAccountId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Transfer toAccountId.
         * @member {number|Long} toAccountId
         * @memberof websocket_api.Transfer
         * @instance
         */
        Transfer.prototype.toAccountId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Transfer transaction.
         * @member {websocket_api.ITransaction|null|undefined} transaction
         * @memberof websocket_api.Transfer
         * @instance
         */
        Transfer.prototype.transaction = null;

        /**
         * Transfer amount.
         * @member {number} amount
         * @memberof websocket_api.Transfer
         * @instance
         */
        Transfer.prototype.amount = 0;

        /**
         * Transfer note.
         * @member {string} note
         * @memberof websocket_api.Transfer
         * @instance
         */
        Transfer.prototype.note = "";

        /**
         * Creates a new Transfer instance using the specified properties.
         * @function create
         * @memberof websocket_api.Transfer
         * @static
         * @param {websocket_api.ITransfer=} [properties] Properties to set
         * @returns {websocket_api.Transfer} Transfer instance
         */
        Transfer.create = function create(properties) {
            return new Transfer(properties);
        };

        /**
         * Encodes the specified Transfer message. Does not implicitly {@link websocket_api.Transfer.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Transfer
         * @static
         * @param {websocket_api.ITransfer} message Transfer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transfer.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.id);
            if (message.initiatorId != null && Object.hasOwnProperty.call(message, "initiatorId"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.initiatorId);
            if (message.fromAccountId != null && Object.hasOwnProperty.call(message, "fromAccountId"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.fromAccountId);
            if (message.toAccountId != null && Object.hasOwnProperty.call(message, "toAccountId"))
                writer.uint32(/* id 4, wireType 0 =*/32).int64(message.toAccountId);
            if (message.transaction != null && Object.hasOwnProperty.call(message, "transaction"))
                $root.websocket_api.Transaction.encode(message.transaction, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 6, wireType 1 =*/49).double(message.amount);
            if (message.note != null && Object.hasOwnProperty.call(message, "note"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.note);
            return writer;
        };

        /**
         * Encodes the specified Transfer message, length delimited. Does not implicitly {@link websocket_api.Transfer.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Transfer
         * @static
         * @param {websocket_api.ITransfer} message Transfer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transfer.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Transfer message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Transfer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Transfer} Transfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transfer.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Transfer();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.int64();
                        break;
                    }
                case 2: {
                        message.initiatorId = reader.int64();
                        break;
                    }
                case 3: {
                        message.fromAccountId = reader.int64();
                        break;
                    }
                case 4: {
                        message.toAccountId = reader.int64();
                        break;
                    }
                case 5: {
                        message.transaction = $root.websocket_api.Transaction.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.amount = reader.double();
                        break;
                    }
                case 7: {
                        message.note = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Transfer message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Transfer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Transfer} Transfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transfer.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Transfer message.
         * @function verify
         * @memberof websocket_api.Transfer
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Transfer.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.initiatorId != null && message.hasOwnProperty("initiatorId"))
                if (!$util.isInteger(message.initiatorId) && !(message.initiatorId && $util.isInteger(message.initiatorId.low) && $util.isInteger(message.initiatorId.high)))
                    return "initiatorId: integer|Long expected";
            if (message.fromAccountId != null && message.hasOwnProperty("fromAccountId"))
                if (!$util.isInteger(message.fromAccountId) && !(message.fromAccountId && $util.isInteger(message.fromAccountId.low) && $util.isInteger(message.fromAccountId.high)))
                    return "fromAccountId: integer|Long expected";
            if (message.toAccountId != null && message.hasOwnProperty("toAccountId"))
                if (!$util.isInteger(message.toAccountId) && !(message.toAccountId && $util.isInteger(message.toAccountId.low) && $util.isInteger(message.toAccountId.high)))
                    return "toAccountId: integer|Long expected";
            if (message.transaction != null && message.hasOwnProperty("transaction")) {
                var error = $root.websocket_api.Transaction.verify(message.transaction);
                if (error)
                    return "transaction." + error;
            }
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (typeof message.amount !== "number")
                    return "amount: number expected";
            if (message.note != null && message.hasOwnProperty("note"))
                if (!$util.isString(message.note))
                    return "note: string expected";
            return null;
        };

        /**
         * Creates a Transfer message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Transfer
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Transfer} Transfer
         */
        Transfer.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Transfer)
                return object;
            var message = new $root.websocket_api.Transfer();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = false;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
            if (object.initiatorId != null)
                if ($util.Long)
                    (message.initiatorId = $util.Long.fromValue(object.initiatorId)).unsigned = false;
                else if (typeof object.initiatorId === "string")
                    message.initiatorId = parseInt(object.initiatorId, 10);
                else if (typeof object.initiatorId === "number")
                    message.initiatorId = object.initiatorId;
                else if (typeof object.initiatorId === "object")
                    message.initiatorId = new $util.LongBits(object.initiatorId.low >>> 0, object.initiatorId.high >>> 0).toNumber();
            if (object.fromAccountId != null)
                if ($util.Long)
                    (message.fromAccountId = $util.Long.fromValue(object.fromAccountId)).unsigned = false;
                else if (typeof object.fromAccountId === "string")
                    message.fromAccountId = parseInt(object.fromAccountId, 10);
                else if (typeof object.fromAccountId === "number")
                    message.fromAccountId = object.fromAccountId;
                else if (typeof object.fromAccountId === "object")
                    message.fromAccountId = new $util.LongBits(object.fromAccountId.low >>> 0, object.fromAccountId.high >>> 0).toNumber();
            if (object.toAccountId != null)
                if ($util.Long)
                    (message.toAccountId = $util.Long.fromValue(object.toAccountId)).unsigned = false;
                else if (typeof object.toAccountId === "string")
                    message.toAccountId = parseInt(object.toAccountId, 10);
                else if (typeof object.toAccountId === "number")
                    message.toAccountId = object.toAccountId;
                else if (typeof object.toAccountId === "object")
                    message.toAccountId = new $util.LongBits(object.toAccountId.low >>> 0, object.toAccountId.high >>> 0).toNumber();
            if (object.transaction != null) {
                if (typeof object.transaction !== "object")
                    throw TypeError(".websocket_api.Transfer.transaction: object expected");
                message.transaction = $root.websocket_api.Transaction.fromObject(object.transaction);
            }
            if (object.amount != null)
                message.amount = Number(object.amount);
            if (object.note != null)
                message.note = String(object.note);
            return message;
        };

        /**
         * Creates a plain object from a Transfer message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Transfer
         * @static
         * @param {websocket_api.Transfer} message Transfer
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Transfer.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.initiatorId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.initiatorId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.fromAccountId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.fromAccountId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.toAccountId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.toAccountId = options.longs === String ? "0" : 0;
                object.transaction = null;
                object.amount = 0;
                object.note = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
            if (message.initiatorId != null && message.hasOwnProperty("initiatorId"))
                if (typeof message.initiatorId === "number")
                    object.initiatorId = options.longs === String ? String(message.initiatorId) : message.initiatorId;
                else
                    object.initiatorId = options.longs === String ? $util.Long.prototype.toString.call(message.initiatorId) : options.longs === Number ? new $util.LongBits(message.initiatorId.low >>> 0, message.initiatorId.high >>> 0).toNumber() : message.initiatorId;
            if (message.fromAccountId != null && message.hasOwnProperty("fromAccountId"))
                if (typeof message.fromAccountId === "number")
                    object.fromAccountId = options.longs === String ? String(message.fromAccountId) : message.fromAccountId;
                else
                    object.fromAccountId = options.longs === String ? $util.Long.prototype.toString.call(message.fromAccountId) : options.longs === Number ? new $util.LongBits(message.fromAccountId.low >>> 0, message.fromAccountId.high >>> 0).toNumber() : message.fromAccountId;
            if (message.toAccountId != null && message.hasOwnProperty("toAccountId"))
                if (typeof message.toAccountId === "number")
                    object.toAccountId = options.longs === String ? String(message.toAccountId) : message.toAccountId;
                else
                    object.toAccountId = options.longs === String ? $util.Long.prototype.toString.call(message.toAccountId) : options.longs === Number ? new $util.LongBits(message.toAccountId.low >>> 0, message.toAccountId.high >>> 0).toNumber() : message.toAccountId;
            if (message.transaction != null && message.hasOwnProperty("transaction"))
                object.transaction = $root.websocket_api.Transaction.toObject(message.transaction, options);
            if (message.amount != null && message.hasOwnProperty("amount"))
                object.amount = options.json && !isFinite(message.amount) ? String(message.amount) : message.amount;
            if (message.note != null && message.hasOwnProperty("note"))
                object.note = message.note;
            return object;
        };

        /**
         * Converts this Transfer to JSON.
         * @function toJSON
         * @memberof websocket_api.Transfer
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Transfer.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Transfer
         * @function getTypeUrl
         * @memberof websocket_api.Transfer
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Transfer.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Transfer";
        };

        return Transfer;
    })();

    websocket_api.RequestFailed = (function() {

        /**
         * Properties of a RequestFailed.
         * @memberof websocket_api
         * @interface IRequestFailed
         * @property {websocket_api.RequestFailed.IRequestDetails|null} [requestDetails] RequestFailed requestDetails
         * @property {websocket_api.RequestFailed.IErrorDetails|null} [errorDetails] RequestFailed errorDetails
         */

        /**
         * Constructs a new RequestFailed.
         * @memberof websocket_api
         * @classdesc Represents a RequestFailed.
         * @implements IRequestFailed
         * @constructor
         * @param {websocket_api.IRequestFailed=} [properties] Properties to set
         */
        function RequestFailed(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * RequestFailed requestDetails.
         * @member {websocket_api.RequestFailed.IRequestDetails|null|undefined} requestDetails
         * @memberof websocket_api.RequestFailed
         * @instance
         */
        RequestFailed.prototype.requestDetails = null;

        /**
         * RequestFailed errorDetails.
         * @member {websocket_api.RequestFailed.IErrorDetails|null|undefined} errorDetails
         * @memberof websocket_api.RequestFailed
         * @instance
         */
        RequestFailed.prototype.errorDetails = null;

        /**
         * Creates a new RequestFailed instance using the specified properties.
         * @function create
         * @memberof websocket_api.RequestFailed
         * @static
         * @param {websocket_api.IRequestFailed=} [properties] Properties to set
         * @returns {websocket_api.RequestFailed} RequestFailed instance
         */
        RequestFailed.create = function create(properties) {
            return new RequestFailed(properties);
        };

        /**
         * Encodes the specified RequestFailed message. Does not implicitly {@link websocket_api.RequestFailed.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.RequestFailed
         * @static
         * @param {websocket_api.IRequestFailed} message RequestFailed message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RequestFailed.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.requestDetails != null && Object.hasOwnProperty.call(message, "requestDetails"))
                $root.websocket_api.RequestFailed.RequestDetails.encode(message.requestDetails, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.errorDetails != null && Object.hasOwnProperty.call(message, "errorDetails"))
                $root.websocket_api.RequestFailed.ErrorDetails.encode(message.errorDetails, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified RequestFailed message, length delimited. Does not implicitly {@link websocket_api.RequestFailed.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.RequestFailed
         * @static
         * @param {websocket_api.IRequestFailed} message RequestFailed message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        RequestFailed.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a RequestFailed message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.RequestFailed
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.RequestFailed} RequestFailed
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RequestFailed.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.RequestFailed();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.requestDetails = $root.websocket_api.RequestFailed.RequestDetails.decode(reader, reader.uint32());
                        break;
                    }
                case 2: {
                        message.errorDetails = $root.websocket_api.RequestFailed.ErrorDetails.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a RequestFailed message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.RequestFailed
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.RequestFailed} RequestFailed
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        RequestFailed.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a RequestFailed message.
         * @function verify
         * @memberof websocket_api.RequestFailed
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        RequestFailed.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.requestDetails != null && message.hasOwnProperty("requestDetails")) {
                var error = $root.websocket_api.RequestFailed.RequestDetails.verify(message.requestDetails);
                if (error)
                    return "requestDetails." + error;
            }
            if (message.errorDetails != null && message.hasOwnProperty("errorDetails")) {
                var error = $root.websocket_api.RequestFailed.ErrorDetails.verify(message.errorDetails);
                if (error)
                    return "errorDetails." + error;
            }
            return null;
        };

        /**
         * Creates a RequestFailed message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.RequestFailed
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.RequestFailed} RequestFailed
         */
        RequestFailed.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.RequestFailed)
                return object;
            var message = new $root.websocket_api.RequestFailed();
            if (object.requestDetails != null) {
                if (typeof object.requestDetails !== "object")
                    throw TypeError(".websocket_api.RequestFailed.requestDetails: object expected");
                message.requestDetails = $root.websocket_api.RequestFailed.RequestDetails.fromObject(object.requestDetails);
            }
            if (object.errorDetails != null) {
                if (typeof object.errorDetails !== "object")
                    throw TypeError(".websocket_api.RequestFailed.errorDetails: object expected");
                message.errorDetails = $root.websocket_api.RequestFailed.ErrorDetails.fromObject(object.errorDetails);
            }
            return message;
        };

        /**
         * Creates a plain object from a RequestFailed message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.RequestFailed
         * @static
         * @param {websocket_api.RequestFailed} message RequestFailed
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        RequestFailed.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.requestDetails = null;
                object.errorDetails = null;
            }
            if (message.requestDetails != null && message.hasOwnProperty("requestDetails"))
                object.requestDetails = $root.websocket_api.RequestFailed.RequestDetails.toObject(message.requestDetails, options);
            if (message.errorDetails != null && message.hasOwnProperty("errorDetails"))
                object.errorDetails = $root.websocket_api.RequestFailed.ErrorDetails.toObject(message.errorDetails, options);
            return object;
        };

        /**
         * Converts this RequestFailed to JSON.
         * @function toJSON
         * @memberof websocket_api.RequestFailed
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        RequestFailed.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for RequestFailed
         * @function getTypeUrl
         * @memberof websocket_api.RequestFailed
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        RequestFailed.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.RequestFailed";
        };

        RequestFailed.RequestDetails = (function() {

            /**
             * Properties of a RequestDetails.
             * @memberof websocket_api.RequestFailed
             * @interface IRequestDetails
             * @property {string|null} [kind] RequestDetails kind
             */

            /**
             * Constructs a new RequestDetails.
             * @memberof websocket_api.RequestFailed
             * @classdesc Represents a RequestDetails.
             * @implements IRequestDetails
             * @constructor
             * @param {websocket_api.RequestFailed.IRequestDetails=} [properties] Properties to set
             */
            function RequestDetails(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * RequestDetails kind.
             * @member {string} kind
             * @memberof websocket_api.RequestFailed.RequestDetails
             * @instance
             */
            RequestDetails.prototype.kind = "";

            /**
             * Creates a new RequestDetails instance using the specified properties.
             * @function create
             * @memberof websocket_api.RequestFailed.RequestDetails
             * @static
             * @param {websocket_api.RequestFailed.IRequestDetails=} [properties] Properties to set
             * @returns {websocket_api.RequestFailed.RequestDetails} RequestDetails instance
             */
            RequestDetails.create = function create(properties) {
                return new RequestDetails(properties);
            };

            /**
             * Encodes the specified RequestDetails message. Does not implicitly {@link websocket_api.RequestFailed.RequestDetails.verify|verify} messages.
             * @function encode
             * @memberof websocket_api.RequestFailed.RequestDetails
             * @static
             * @param {websocket_api.RequestFailed.IRequestDetails} message RequestDetails message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RequestDetails.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.kind != null && Object.hasOwnProperty.call(message, "kind"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.kind);
                return writer;
            };

            /**
             * Encodes the specified RequestDetails message, length delimited. Does not implicitly {@link websocket_api.RequestFailed.RequestDetails.verify|verify} messages.
             * @function encodeDelimited
             * @memberof websocket_api.RequestFailed.RequestDetails
             * @static
             * @param {websocket_api.RequestFailed.IRequestDetails} message RequestDetails message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RequestDetails.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a RequestDetails message from the specified reader or buffer.
             * @function decode
             * @memberof websocket_api.RequestFailed.RequestDetails
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {websocket_api.RequestFailed.RequestDetails} RequestDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RequestDetails.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.RequestFailed.RequestDetails();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.kind = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a RequestDetails message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof websocket_api.RequestFailed.RequestDetails
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {websocket_api.RequestFailed.RequestDetails} RequestDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RequestDetails.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a RequestDetails message.
             * @function verify
             * @memberof websocket_api.RequestFailed.RequestDetails
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            RequestDetails.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.kind != null && message.hasOwnProperty("kind"))
                    if (!$util.isString(message.kind))
                        return "kind: string expected";
                return null;
            };

            /**
             * Creates a RequestDetails message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof websocket_api.RequestFailed.RequestDetails
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {websocket_api.RequestFailed.RequestDetails} RequestDetails
             */
            RequestDetails.fromObject = function fromObject(object) {
                if (object instanceof $root.websocket_api.RequestFailed.RequestDetails)
                    return object;
                var message = new $root.websocket_api.RequestFailed.RequestDetails();
                if (object.kind != null)
                    message.kind = String(object.kind);
                return message;
            };

            /**
             * Creates a plain object from a RequestDetails message. Also converts values to other types if specified.
             * @function toObject
             * @memberof websocket_api.RequestFailed.RequestDetails
             * @static
             * @param {websocket_api.RequestFailed.RequestDetails} message RequestDetails
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            RequestDetails.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.kind = "";
                if (message.kind != null && message.hasOwnProperty("kind"))
                    object.kind = message.kind;
                return object;
            };

            /**
             * Converts this RequestDetails to JSON.
             * @function toJSON
             * @memberof websocket_api.RequestFailed.RequestDetails
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            RequestDetails.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for RequestDetails
             * @function getTypeUrl
             * @memberof websocket_api.RequestFailed.RequestDetails
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            RequestDetails.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/websocket_api.RequestFailed.RequestDetails";
            };

            return RequestDetails;
        })();

        RequestFailed.ErrorDetails = (function() {

            /**
             * Properties of an ErrorDetails.
             * @memberof websocket_api.RequestFailed
             * @interface IErrorDetails
             * @property {string|null} [message] ErrorDetails message
             */

            /**
             * Constructs a new ErrorDetails.
             * @memberof websocket_api.RequestFailed
             * @classdesc Represents an ErrorDetails.
             * @implements IErrorDetails
             * @constructor
             * @param {websocket_api.RequestFailed.IErrorDetails=} [properties] Properties to set
             */
            function ErrorDetails(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ErrorDetails message.
             * @member {string} message
             * @memberof websocket_api.RequestFailed.ErrorDetails
             * @instance
             */
            ErrorDetails.prototype.message = "";

            /**
             * Creates a new ErrorDetails instance using the specified properties.
             * @function create
             * @memberof websocket_api.RequestFailed.ErrorDetails
             * @static
             * @param {websocket_api.RequestFailed.IErrorDetails=} [properties] Properties to set
             * @returns {websocket_api.RequestFailed.ErrorDetails} ErrorDetails instance
             */
            ErrorDetails.create = function create(properties) {
                return new ErrorDetails(properties);
            };

            /**
             * Encodes the specified ErrorDetails message. Does not implicitly {@link websocket_api.RequestFailed.ErrorDetails.verify|verify} messages.
             * @function encode
             * @memberof websocket_api.RequestFailed.ErrorDetails
             * @static
             * @param {websocket_api.RequestFailed.IErrorDetails} message ErrorDetails message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ErrorDetails.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.message);
                return writer;
            };

            /**
             * Encodes the specified ErrorDetails message, length delimited. Does not implicitly {@link websocket_api.RequestFailed.ErrorDetails.verify|verify} messages.
             * @function encodeDelimited
             * @memberof websocket_api.RequestFailed.ErrorDetails
             * @static
             * @param {websocket_api.RequestFailed.IErrorDetails} message ErrorDetails message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ErrorDetails.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an ErrorDetails message from the specified reader or buffer.
             * @function decode
             * @memberof websocket_api.RequestFailed.ErrorDetails
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {websocket_api.RequestFailed.ErrorDetails} ErrorDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ErrorDetails.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.RequestFailed.ErrorDetails();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.message = reader.string();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an ErrorDetails message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof websocket_api.RequestFailed.ErrorDetails
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {websocket_api.RequestFailed.ErrorDetails} ErrorDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ErrorDetails.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an ErrorDetails message.
             * @function verify
             * @memberof websocket_api.RequestFailed.ErrorDetails
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ErrorDetails.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.message != null && message.hasOwnProperty("message"))
                    if (!$util.isString(message.message))
                        return "message: string expected";
                return null;
            };

            /**
             * Creates an ErrorDetails message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof websocket_api.RequestFailed.ErrorDetails
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {websocket_api.RequestFailed.ErrorDetails} ErrorDetails
             */
            ErrorDetails.fromObject = function fromObject(object) {
                if (object instanceof $root.websocket_api.RequestFailed.ErrorDetails)
                    return object;
                var message = new $root.websocket_api.RequestFailed.ErrorDetails();
                if (object.message != null)
                    message.message = String(object.message);
                return message;
            };

            /**
             * Creates a plain object from an ErrorDetails message. Also converts values to other types if specified.
             * @function toObject
             * @memberof websocket_api.RequestFailed.ErrorDetails
             * @static
             * @param {websocket_api.RequestFailed.ErrorDetails} message ErrorDetails
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ErrorDetails.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.message = "";
                if (message.message != null && message.hasOwnProperty("message"))
                    object.message = message.message;
                return object;
            };

            /**
             * Converts this ErrorDetails to JSON.
             * @function toJSON
             * @memberof websocket_api.RequestFailed.ErrorDetails
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ErrorDetails.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for ErrorDetails
             * @function getTypeUrl
             * @memberof websocket_api.RequestFailed.ErrorDetails
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            ErrorDetails.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/websocket_api.RequestFailed.ErrorDetails";
            };

            return ErrorDetails;
        })();

        return RequestFailed;
    })();

    websocket_api.Out = (function() {

        /**
         * Properties of an Out.
         * @memberof websocket_api
         * @interface IOut
         * @property {number|Long|null} [marketId] Out marketId
         */

        /**
         * Constructs a new Out.
         * @memberof websocket_api
         * @classdesc Represents an Out.
         * @implements IOut
         * @constructor
         * @param {websocket_api.IOut=} [properties] Properties to set
         */
        function Out(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Out marketId.
         * @member {number|Long} marketId
         * @memberof websocket_api.Out
         * @instance
         */
        Out.prototype.marketId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new Out instance using the specified properties.
         * @function create
         * @memberof websocket_api.Out
         * @static
         * @param {websocket_api.IOut=} [properties] Properties to set
         * @returns {websocket_api.Out} Out instance
         */
        Out.create = function create(properties) {
            return new Out(properties);
        };

        /**
         * Encodes the specified Out message. Does not implicitly {@link websocket_api.Out.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Out
         * @static
         * @param {websocket_api.IOut} message Out message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Out.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.marketId != null && Object.hasOwnProperty.call(message, "marketId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.marketId);
            return writer;
        };

        /**
         * Encodes the specified Out message, length delimited. Does not implicitly {@link websocket_api.Out.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Out
         * @static
         * @param {websocket_api.IOut} message Out message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Out.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Out message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Out
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Out} Out
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Out.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Out();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.marketId = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Out message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Out
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Out} Out
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Out.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Out message.
         * @function verify
         * @memberof websocket_api.Out
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Out.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (!$util.isInteger(message.marketId) && !(message.marketId && $util.isInteger(message.marketId.low) && $util.isInteger(message.marketId.high)))
                    return "marketId: integer|Long expected";
            return null;
        };

        /**
         * Creates an Out message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Out
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Out} Out
         */
        Out.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Out)
                return object;
            var message = new $root.websocket_api.Out();
            if (object.marketId != null)
                if ($util.Long)
                    (message.marketId = $util.Long.fromValue(object.marketId)).unsigned = false;
                else if (typeof object.marketId === "string")
                    message.marketId = parseInt(object.marketId, 10);
                else if (typeof object.marketId === "number")
                    message.marketId = object.marketId;
                else if (typeof object.marketId === "object")
                    message.marketId = new $util.LongBits(object.marketId.low >>> 0, object.marketId.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from an Out message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Out
         * @static
         * @param {websocket_api.Out} message Out
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Out.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.marketId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.marketId = options.longs === String ? "0" : 0;
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (typeof message.marketId === "number")
                    object.marketId = options.longs === String ? String(message.marketId) : message.marketId;
                else
                    object.marketId = options.longs === String ? $util.Long.prototype.toString.call(message.marketId) : options.longs === Number ? new $util.LongBits(message.marketId.low >>> 0, message.marketId.high >>> 0).toNumber() : message.marketId;
            return object;
        };

        /**
         * Converts this Out to JSON.
         * @function toJSON
         * @memberof websocket_api.Out
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Out.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Out
         * @function getTypeUrl
         * @memberof websocket_api.Out
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Out.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Out";
        };

        return Out;
    })();

    websocket_api.Account = (function() {

        /**
         * Properties of an Account.
         * @memberof websocket_api
         * @interface IAccount
         * @property {number|Long|null} [id] Account id
         * @property {string|null} [name] Account name
         * @property {boolean|null} [isUser] Account isUser
         */

        /**
         * Constructs a new Account.
         * @memberof websocket_api
         * @classdesc Represents an Account.
         * @implements IAccount
         * @constructor
         * @param {websocket_api.IAccount=} [properties] Properties to set
         */
        function Account(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Account id.
         * @member {number|Long} id
         * @memberof websocket_api.Account
         * @instance
         */
        Account.prototype.id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Account name.
         * @member {string} name
         * @memberof websocket_api.Account
         * @instance
         */
        Account.prototype.name = "";

        /**
         * Account isUser.
         * @member {boolean} isUser
         * @memberof websocket_api.Account
         * @instance
         */
        Account.prototype.isUser = false;

        /**
         * Creates a new Account instance using the specified properties.
         * @function create
         * @memberof websocket_api.Account
         * @static
         * @param {websocket_api.IAccount=} [properties] Properties to set
         * @returns {websocket_api.Account} Account instance
         */
        Account.create = function create(properties) {
            return new Account(properties);
        };

        /**
         * Encodes the specified Account message. Does not implicitly {@link websocket_api.Account.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Account
         * @static
         * @param {websocket_api.IAccount} message Account message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Account.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.id);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.isUser != null && Object.hasOwnProperty.call(message, "isUser"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.isUser);
            return writer;
        };

        /**
         * Encodes the specified Account message, length delimited. Does not implicitly {@link websocket_api.Account.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Account
         * @static
         * @param {websocket_api.IAccount} message Account message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Account.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Account message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Account
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Account} Account
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Account.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Account();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.int64();
                        break;
                    }
                case 2: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.isUser = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Account message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Account
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Account} Account
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Account.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Account message.
         * @function verify
         * @memberof websocket_api.Account
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Account.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.isUser != null && message.hasOwnProperty("isUser"))
                if (typeof message.isUser !== "boolean")
                    return "isUser: boolean expected";
            return null;
        };

        /**
         * Creates an Account message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Account
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Account} Account
         */
        Account.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Account)
                return object;
            var message = new $root.websocket_api.Account();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = false;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
            if (object.name != null)
                message.name = String(object.name);
            if (object.isUser != null)
                message.isUser = Boolean(object.isUser);
            return message;
        };

        /**
         * Creates a plain object from an Account message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Account
         * @static
         * @param {websocket_api.Account} message Account
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Account.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                object.name = "";
                object.isUser = false;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.isUser != null && message.hasOwnProperty("isUser"))
                object.isUser = message.isUser;
            return object;
        };

        /**
         * Converts this Account to JSON.
         * @function toJSON
         * @memberof websocket_api.Account
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Account.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Account
         * @function getTypeUrl
         * @memberof websocket_api.Account
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Account.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Account";
        };

        return Account;
    })();

    websocket_api.Redeem = (function() {

        /**
         * Properties of a Redeem.
         * @memberof websocket_api
         * @interface IRedeem
         * @property {number|Long|null} [fundId] Redeem fundId
         * @property {number|null} [amount] Redeem amount
         */

        /**
         * Constructs a new Redeem.
         * @memberof websocket_api
         * @classdesc Represents a Redeem.
         * @implements IRedeem
         * @constructor
         * @param {websocket_api.IRedeem=} [properties] Properties to set
         */
        function Redeem(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Redeem fundId.
         * @member {number|Long} fundId
         * @memberof websocket_api.Redeem
         * @instance
         */
        Redeem.prototype.fundId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Redeem amount.
         * @member {number} amount
         * @memberof websocket_api.Redeem
         * @instance
         */
        Redeem.prototype.amount = 0;

        /**
         * Creates a new Redeem instance using the specified properties.
         * @function create
         * @memberof websocket_api.Redeem
         * @static
         * @param {websocket_api.IRedeem=} [properties] Properties to set
         * @returns {websocket_api.Redeem} Redeem instance
         */
        Redeem.create = function create(properties) {
            return new Redeem(properties);
        };

        /**
         * Encodes the specified Redeem message. Does not implicitly {@link websocket_api.Redeem.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Redeem
         * @static
         * @param {websocket_api.IRedeem} message Redeem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Redeem.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.fundId != null && Object.hasOwnProperty.call(message, "fundId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.fundId);
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.amount);
            return writer;
        };

        /**
         * Encodes the specified Redeem message, length delimited. Does not implicitly {@link websocket_api.Redeem.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Redeem
         * @static
         * @param {websocket_api.IRedeem} message Redeem message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Redeem.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Redeem message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Redeem
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Redeem} Redeem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Redeem.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Redeem();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.fundId = reader.int64();
                        break;
                    }
                case 2: {
                        message.amount = reader.double();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Redeem message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Redeem
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Redeem} Redeem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Redeem.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Redeem message.
         * @function verify
         * @memberof websocket_api.Redeem
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Redeem.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.fundId != null && message.hasOwnProperty("fundId"))
                if (!$util.isInteger(message.fundId) && !(message.fundId && $util.isInteger(message.fundId.low) && $util.isInteger(message.fundId.high)))
                    return "fundId: integer|Long expected";
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (typeof message.amount !== "number")
                    return "amount: number expected";
            return null;
        };

        /**
         * Creates a Redeem message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Redeem
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Redeem} Redeem
         */
        Redeem.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Redeem)
                return object;
            var message = new $root.websocket_api.Redeem();
            if (object.fundId != null)
                if ($util.Long)
                    (message.fundId = $util.Long.fromValue(object.fundId)).unsigned = false;
                else if (typeof object.fundId === "string")
                    message.fundId = parseInt(object.fundId, 10);
                else if (typeof object.fundId === "number")
                    message.fundId = object.fundId;
                else if (typeof object.fundId === "object")
                    message.fundId = new $util.LongBits(object.fundId.low >>> 0, object.fundId.high >>> 0).toNumber();
            if (object.amount != null)
                message.amount = Number(object.amount);
            return message;
        };

        /**
         * Creates a plain object from a Redeem message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Redeem
         * @static
         * @param {websocket_api.Redeem} message Redeem
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Redeem.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.fundId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.fundId = options.longs === String ? "0" : 0;
                object.amount = 0;
            }
            if (message.fundId != null && message.hasOwnProperty("fundId"))
                if (typeof message.fundId === "number")
                    object.fundId = options.longs === String ? String(message.fundId) : message.fundId;
                else
                    object.fundId = options.longs === String ? $util.Long.prototype.toString.call(message.fundId) : options.longs === Number ? new $util.LongBits(message.fundId.low >>> 0, message.fundId.high >>> 0).toNumber() : message.fundId;
            if (message.amount != null && message.hasOwnProperty("amount"))
                object.amount = options.json && !isFinite(message.amount) ? String(message.amount) : message.amount;
            return object;
        };

        /**
         * Converts this Redeem to JSON.
         * @function toJSON
         * @memberof websocket_api.Redeem
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Redeem.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Redeem
         * @function getTypeUrl
         * @memberof websocket_api.Redeem
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Redeem.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Redeem";
        };

        return Redeem;
    })();

    websocket_api.Redeemed = (function() {

        /**
         * Properties of a Redeemed.
         * @memberof websocket_api
         * @interface IRedeemed
         * @property {websocket_api.ITransaction|null} [transaction] Redeemed transaction
         * @property {number|Long|null} [accountId] Redeemed accountId
         * @property {number|Long|null} [fundId] Redeemed fundId
         * @property {number|null} [amount] Redeemed amount
         */

        /**
         * Constructs a new Redeemed.
         * @memberof websocket_api
         * @classdesc Represents a Redeemed.
         * @implements IRedeemed
         * @constructor
         * @param {websocket_api.IRedeemed=} [properties] Properties to set
         */
        function Redeemed(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Redeemed transaction.
         * @member {websocket_api.ITransaction|null|undefined} transaction
         * @memberof websocket_api.Redeemed
         * @instance
         */
        Redeemed.prototype.transaction = null;

        /**
         * Redeemed accountId.
         * @member {number|Long} accountId
         * @memberof websocket_api.Redeemed
         * @instance
         */
        Redeemed.prototype.accountId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Redeemed fundId.
         * @member {number|Long} fundId
         * @memberof websocket_api.Redeemed
         * @instance
         */
        Redeemed.prototype.fundId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Redeemed amount.
         * @member {number} amount
         * @memberof websocket_api.Redeemed
         * @instance
         */
        Redeemed.prototype.amount = 0;

        /**
         * Creates a new Redeemed instance using the specified properties.
         * @function create
         * @memberof websocket_api.Redeemed
         * @static
         * @param {websocket_api.IRedeemed=} [properties] Properties to set
         * @returns {websocket_api.Redeemed} Redeemed instance
         */
        Redeemed.create = function create(properties) {
            return new Redeemed(properties);
        };

        /**
         * Encodes the specified Redeemed message. Does not implicitly {@link websocket_api.Redeemed.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Redeemed
         * @static
         * @param {websocket_api.IRedeemed} message Redeemed message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Redeemed.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.transaction != null && Object.hasOwnProperty.call(message, "transaction"))
                $root.websocket_api.Transaction.encode(message.transaction, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.accountId != null && Object.hasOwnProperty.call(message, "accountId"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.accountId);
            if (message.fundId != null && Object.hasOwnProperty.call(message, "fundId"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.fundId);
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 4, wireType 1 =*/33).double(message.amount);
            return writer;
        };

        /**
         * Encodes the specified Redeemed message, length delimited. Does not implicitly {@link websocket_api.Redeemed.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Redeemed
         * @static
         * @param {websocket_api.IRedeemed} message Redeemed message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Redeemed.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Redeemed message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Redeemed
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Redeemed} Redeemed
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Redeemed.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Redeemed();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.transaction = $root.websocket_api.Transaction.decode(reader, reader.uint32());
                        break;
                    }
                case 2: {
                        message.accountId = reader.int64();
                        break;
                    }
                case 3: {
                        message.fundId = reader.int64();
                        break;
                    }
                case 4: {
                        message.amount = reader.double();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Redeemed message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Redeemed
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Redeemed} Redeemed
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Redeemed.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Redeemed message.
         * @function verify
         * @memberof websocket_api.Redeemed
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Redeemed.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.transaction != null && message.hasOwnProperty("transaction")) {
                var error = $root.websocket_api.Transaction.verify(message.transaction);
                if (error)
                    return "transaction." + error;
            }
            if (message.accountId != null && message.hasOwnProperty("accountId"))
                if (!$util.isInteger(message.accountId) && !(message.accountId && $util.isInteger(message.accountId.low) && $util.isInteger(message.accountId.high)))
                    return "accountId: integer|Long expected";
            if (message.fundId != null && message.hasOwnProperty("fundId"))
                if (!$util.isInteger(message.fundId) && !(message.fundId && $util.isInteger(message.fundId.low) && $util.isInteger(message.fundId.high)))
                    return "fundId: integer|Long expected";
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (typeof message.amount !== "number")
                    return "amount: number expected";
            return null;
        };

        /**
         * Creates a Redeemed message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Redeemed
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Redeemed} Redeemed
         */
        Redeemed.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Redeemed)
                return object;
            var message = new $root.websocket_api.Redeemed();
            if (object.transaction != null) {
                if (typeof object.transaction !== "object")
                    throw TypeError(".websocket_api.Redeemed.transaction: object expected");
                message.transaction = $root.websocket_api.Transaction.fromObject(object.transaction);
            }
            if (object.accountId != null)
                if ($util.Long)
                    (message.accountId = $util.Long.fromValue(object.accountId)).unsigned = false;
                else if (typeof object.accountId === "string")
                    message.accountId = parseInt(object.accountId, 10);
                else if (typeof object.accountId === "number")
                    message.accountId = object.accountId;
                else if (typeof object.accountId === "object")
                    message.accountId = new $util.LongBits(object.accountId.low >>> 0, object.accountId.high >>> 0).toNumber();
            if (object.fundId != null)
                if ($util.Long)
                    (message.fundId = $util.Long.fromValue(object.fundId)).unsigned = false;
                else if (typeof object.fundId === "string")
                    message.fundId = parseInt(object.fundId, 10);
                else if (typeof object.fundId === "number")
                    message.fundId = object.fundId;
                else if (typeof object.fundId === "object")
                    message.fundId = new $util.LongBits(object.fundId.low >>> 0, object.fundId.high >>> 0).toNumber();
            if (object.amount != null)
                message.amount = Number(object.amount);
            return message;
        };

        /**
         * Creates a plain object from a Redeemed message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Redeemed
         * @static
         * @param {websocket_api.Redeemed} message Redeemed
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Redeemed.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.transaction = null;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.accountId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.accountId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.fundId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.fundId = options.longs === String ? "0" : 0;
                object.amount = 0;
            }
            if (message.transaction != null && message.hasOwnProperty("transaction"))
                object.transaction = $root.websocket_api.Transaction.toObject(message.transaction, options);
            if (message.accountId != null && message.hasOwnProperty("accountId"))
                if (typeof message.accountId === "number")
                    object.accountId = options.longs === String ? String(message.accountId) : message.accountId;
                else
                    object.accountId = options.longs === String ? $util.Long.prototype.toString.call(message.accountId) : options.longs === Number ? new $util.LongBits(message.accountId.low >>> 0, message.accountId.high >>> 0).toNumber() : message.accountId;
            if (message.fundId != null && message.hasOwnProperty("fundId"))
                if (typeof message.fundId === "number")
                    object.fundId = options.longs === String ? String(message.fundId) : message.fundId;
                else
                    object.fundId = options.longs === String ? $util.Long.prototype.toString.call(message.fundId) : options.longs === Number ? new $util.LongBits(message.fundId.low >>> 0, message.fundId.high >>> 0).toNumber() : message.fundId;
            if (message.amount != null && message.hasOwnProperty("amount"))
                object.amount = options.json && !isFinite(message.amount) ? String(message.amount) : message.amount;
            return object;
        };

        /**
         * Converts this Redeemed to JSON.
         * @function toJSON
         * @memberof websocket_api.Redeemed
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Redeemed.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Redeemed
         * @function getTypeUrl
         * @memberof websocket_api.Redeemed
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Redeemed.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Redeemed";
        };

        return Redeemed;
    })();

    websocket_api.Orders = (function() {

        /**
         * Properties of an Orders.
         * @memberof websocket_api
         * @interface IOrders
         * @property {number|Long|null} [marketId] Orders marketId
         * @property {Array.<websocket_api.IOrder>|null} [orders] Orders orders
         * @property {boolean|null} [hasFullHistory] Orders hasFullHistory
         */

        /**
         * Constructs a new Orders.
         * @memberof websocket_api
         * @classdesc Represents an Orders.
         * @implements IOrders
         * @constructor
         * @param {websocket_api.IOrders=} [properties] Properties to set
         */
        function Orders(properties) {
            this.orders = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Orders marketId.
         * @member {number|Long} marketId
         * @memberof websocket_api.Orders
         * @instance
         */
        Orders.prototype.marketId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Orders orders.
         * @member {Array.<websocket_api.IOrder>} orders
         * @memberof websocket_api.Orders
         * @instance
         */
        Orders.prototype.orders = $util.emptyArray;

        /**
         * Orders hasFullHistory.
         * @member {boolean} hasFullHistory
         * @memberof websocket_api.Orders
         * @instance
         */
        Orders.prototype.hasFullHistory = false;

        /**
         * Creates a new Orders instance using the specified properties.
         * @function create
         * @memberof websocket_api.Orders
         * @static
         * @param {websocket_api.IOrders=} [properties] Properties to set
         * @returns {websocket_api.Orders} Orders instance
         */
        Orders.create = function create(properties) {
            return new Orders(properties);
        };

        /**
         * Encodes the specified Orders message. Does not implicitly {@link websocket_api.Orders.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Orders
         * @static
         * @param {websocket_api.IOrders} message Orders message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Orders.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.marketId != null && Object.hasOwnProperty.call(message, "marketId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.marketId);
            if (message.orders != null && message.orders.length)
                for (var i = 0; i < message.orders.length; ++i)
                    $root.websocket_api.Order.encode(message.orders[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.hasFullHistory != null && Object.hasOwnProperty.call(message, "hasFullHistory"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.hasFullHistory);
            return writer;
        };

        /**
         * Encodes the specified Orders message, length delimited. Does not implicitly {@link websocket_api.Orders.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Orders
         * @static
         * @param {websocket_api.IOrders} message Orders message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Orders.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Orders message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Orders
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Orders} Orders
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Orders.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Orders();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.marketId = reader.int64();
                        break;
                    }
                case 2: {
                        if (!(message.orders && message.orders.length))
                            message.orders = [];
                        message.orders.push($root.websocket_api.Order.decode(reader, reader.uint32()));
                        break;
                    }
                case 3: {
                        message.hasFullHistory = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Orders message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Orders
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Orders} Orders
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Orders.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Orders message.
         * @function verify
         * @memberof websocket_api.Orders
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Orders.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (!$util.isInteger(message.marketId) && !(message.marketId && $util.isInteger(message.marketId.low) && $util.isInteger(message.marketId.high)))
                    return "marketId: integer|Long expected";
            if (message.orders != null && message.hasOwnProperty("orders")) {
                if (!Array.isArray(message.orders))
                    return "orders: array expected";
                for (var i = 0; i < message.orders.length; ++i) {
                    var error = $root.websocket_api.Order.verify(message.orders[i]);
                    if (error)
                        return "orders." + error;
                }
            }
            if (message.hasFullHistory != null && message.hasOwnProperty("hasFullHistory"))
                if (typeof message.hasFullHistory !== "boolean")
                    return "hasFullHistory: boolean expected";
            return null;
        };

        /**
         * Creates an Orders message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Orders
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Orders} Orders
         */
        Orders.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Orders)
                return object;
            var message = new $root.websocket_api.Orders();
            if (object.marketId != null)
                if ($util.Long)
                    (message.marketId = $util.Long.fromValue(object.marketId)).unsigned = false;
                else if (typeof object.marketId === "string")
                    message.marketId = parseInt(object.marketId, 10);
                else if (typeof object.marketId === "number")
                    message.marketId = object.marketId;
                else if (typeof object.marketId === "object")
                    message.marketId = new $util.LongBits(object.marketId.low >>> 0, object.marketId.high >>> 0).toNumber();
            if (object.orders) {
                if (!Array.isArray(object.orders))
                    throw TypeError(".websocket_api.Orders.orders: array expected");
                message.orders = [];
                for (var i = 0; i < object.orders.length; ++i) {
                    if (typeof object.orders[i] !== "object")
                        throw TypeError(".websocket_api.Orders.orders: object expected");
                    message.orders[i] = $root.websocket_api.Order.fromObject(object.orders[i]);
                }
            }
            if (object.hasFullHistory != null)
                message.hasFullHistory = Boolean(object.hasFullHistory);
            return message;
        };

        /**
         * Creates a plain object from an Orders message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Orders
         * @static
         * @param {websocket_api.Orders} message Orders
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Orders.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.orders = [];
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.marketId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.marketId = options.longs === String ? "0" : 0;
                object.hasFullHistory = false;
            }
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (typeof message.marketId === "number")
                    object.marketId = options.longs === String ? String(message.marketId) : message.marketId;
                else
                    object.marketId = options.longs === String ? $util.Long.prototype.toString.call(message.marketId) : options.longs === Number ? new $util.LongBits(message.marketId.low >>> 0, message.marketId.high >>> 0).toNumber() : message.marketId;
            if (message.orders && message.orders.length) {
                object.orders = [];
                for (var j = 0; j < message.orders.length; ++j)
                    object.orders[j] = $root.websocket_api.Order.toObject(message.orders[j], options);
            }
            if (message.hasFullHistory != null && message.hasOwnProperty("hasFullHistory"))
                object.hasFullHistory = message.hasFullHistory;
            return object;
        };

        /**
         * Converts this Orders to JSON.
         * @function toJSON
         * @memberof websocket_api.Orders
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Orders.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Orders
         * @function getTypeUrl
         * @memberof websocket_api.Orders
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Orders.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Orders";
        };

        return Orders;
    })();

    websocket_api.Trades = (function() {

        /**
         * Properties of a Trades.
         * @memberof websocket_api
         * @interface ITrades
         * @property {number|Long|null} [marketId] Trades marketId
         * @property {Array.<websocket_api.ITrade>|null} [trades] Trades trades
         * @property {boolean|null} [hasFullHistory] Trades hasFullHistory
         */

        /**
         * Constructs a new Trades.
         * @memberof websocket_api
         * @classdesc Represents a Trades.
         * @implements ITrades
         * @constructor
         * @param {websocket_api.ITrades=} [properties] Properties to set
         */
        function Trades(properties) {
            this.trades = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Trades marketId.
         * @member {number|Long} marketId
         * @memberof websocket_api.Trades
         * @instance
         */
        Trades.prototype.marketId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Trades trades.
         * @member {Array.<websocket_api.ITrade>} trades
         * @memberof websocket_api.Trades
         * @instance
         */
        Trades.prototype.trades = $util.emptyArray;

        /**
         * Trades hasFullHistory.
         * @member {boolean} hasFullHistory
         * @memberof websocket_api.Trades
         * @instance
         */
        Trades.prototype.hasFullHistory = false;

        /**
         * Creates a new Trades instance using the specified properties.
         * @function create
         * @memberof websocket_api.Trades
         * @static
         * @param {websocket_api.ITrades=} [properties] Properties to set
         * @returns {websocket_api.Trades} Trades instance
         */
        Trades.create = function create(properties) {
            return new Trades(properties);
        };

        /**
         * Encodes the specified Trades message. Does not implicitly {@link websocket_api.Trades.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Trades
         * @static
         * @param {websocket_api.ITrades} message Trades message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Trades.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.marketId != null && Object.hasOwnProperty.call(message, "marketId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.marketId);
            if (message.trades != null && message.trades.length)
                for (var i = 0; i < message.trades.length; ++i)
                    $root.websocket_api.Trade.encode(message.trades[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.hasFullHistory != null && Object.hasOwnProperty.call(message, "hasFullHistory"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.hasFullHistory);
            return writer;
        };

        /**
         * Encodes the specified Trades message, length delimited. Does not implicitly {@link websocket_api.Trades.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Trades
         * @static
         * @param {websocket_api.ITrades} message Trades message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Trades.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Trades message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Trades
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Trades} Trades
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Trades.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Trades();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.marketId = reader.int64();
                        break;
                    }
                case 2: {
                        if (!(message.trades && message.trades.length))
                            message.trades = [];
                        message.trades.push($root.websocket_api.Trade.decode(reader, reader.uint32()));
                        break;
                    }
                case 3: {
                        message.hasFullHistory = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Trades message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Trades
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Trades} Trades
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Trades.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Trades message.
         * @function verify
         * @memberof websocket_api.Trades
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Trades.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (!$util.isInteger(message.marketId) && !(message.marketId && $util.isInteger(message.marketId.low) && $util.isInteger(message.marketId.high)))
                    return "marketId: integer|Long expected";
            if (message.trades != null && message.hasOwnProperty("trades")) {
                if (!Array.isArray(message.trades))
                    return "trades: array expected";
                for (var i = 0; i < message.trades.length; ++i) {
                    var error = $root.websocket_api.Trade.verify(message.trades[i]);
                    if (error)
                        return "trades." + error;
                }
            }
            if (message.hasFullHistory != null && message.hasOwnProperty("hasFullHistory"))
                if (typeof message.hasFullHistory !== "boolean")
                    return "hasFullHistory: boolean expected";
            return null;
        };

        /**
         * Creates a Trades message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Trades
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Trades} Trades
         */
        Trades.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Trades)
                return object;
            var message = new $root.websocket_api.Trades();
            if (object.marketId != null)
                if ($util.Long)
                    (message.marketId = $util.Long.fromValue(object.marketId)).unsigned = false;
                else if (typeof object.marketId === "string")
                    message.marketId = parseInt(object.marketId, 10);
                else if (typeof object.marketId === "number")
                    message.marketId = object.marketId;
                else if (typeof object.marketId === "object")
                    message.marketId = new $util.LongBits(object.marketId.low >>> 0, object.marketId.high >>> 0).toNumber();
            if (object.trades) {
                if (!Array.isArray(object.trades))
                    throw TypeError(".websocket_api.Trades.trades: array expected");
                message.trades = [];
                for (var i = 0; i < object.trades.length; ++i) {
                    if (typeof object.trades[i] !== "object")
                        throw TypeError(".websocket_api.Trades.trades: object expected");
                    message.trades[i] = $root.websocket_api.Trade.fromObject(object.trades[i]);
                }
            }
            if (object.hasFullHistory != null)
                message.hasFullHistory = Boolean(object.hasFullHistory);
            return message;
        };

        /**
         * Creates a plain object from a Trades message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Trades
         * @static
         * @param {websocket_api.Trades} message Trades
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Trades.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.trades = [];
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.marketId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.marketId = options.longs === String ? "0" : 0;
                object.hasFullHistory = false;
            }
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (typeof message.marketId === "number")
                    object.marketId = options.longs === String ? String(message.marketId) : message.marketId;
                else
                    object.marketId = options.longs === String ? $util.Long.prototype.toString.call(message.marketId) : options.longs === Number ? new $util.LongBits(message.marketId.low >>> 0, message.marketId.high >>> 0).toNumber() : message.marketId;
            if (message.trades && message.trades.length) {
                object.trades = [];
                for (var j = 0; j < message.trades.length; ++j)
                    object.trades[j] = $root.websocket_api.Trade.toObject(message.trades[j], options);
            }
            if (message.hasFullHistory != null && message.hasOwnProperty("hasFullHistory"))
                object.hasFullHistory = message.hasFullHistory;
            return object;
        };

        /**
         * Converts this Trades to JSON.
         * @function toJSON
         * @memberof websocket_api.Trades
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Trades.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Trades
         * @function getTypeUrl
         * @memberof websocket_api.Trades
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Trades.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Trades";
        };

        return Trades;
    })();

    websocket_api.ClientMessage = (function() {

        /**
         * Properties of a ClientMessage.
         * @memberof websocket_api
         * @interface IClientMessage
         * @property {string|null} [requestId] ClientMessage requestId
         * @property {websocket_api.ICreateMarket|null} [createMarket] ClientMessage createMarket
         * @property {websocket_api.ISettleMarket|null} [settleMarket] ClientMessage settleMarket
         * @property {websocket_api.ICreateOrder|null} [createOrder] ClientMessage createOrder
         * @property {websocket_api.ICancelOrder|null} [cancelOrder] ClientMessage cancelOrder
         * @property {websocket_api.IOut|null} [out] ClientMessage out
         * @property {websocket_api.IMakeTransfer|null} [makeTransfer] ClientMessage makeTransfer
         * @property {websocket_api.IAuthenticate|null} [authenticate] ClientMessage authenticate
         * @property {websocket_api.IActAs|null} [actAs] ClientMessage actAs
         * @property {websocket_api.ICreateAccount|null} [createAccount] ClientMessage createAccount
         * @property {websocket_api.IShareOwnership|null} [shareOwnership] ClientMessage shareOwnership
         * @property {websocket_api.IGetFullOrderHistory|null} [getFullOrderHistory] ClientMessage getFullOrderHistory
         * @property {websocket_api.IGetFullTradeHistory|null} [getFullTradeHistory] ClientMessage getFullTradeHistory
         * @property {websocket_api.IRedeem|null} [redeem] ClientMessage redeem
         */

        /**
         * Constructs a new ClientMessage.
         * @memberof websocket_api
         * @classdesc Represents a ClientMessage.
         * @implements IClientMessage
         * @constructor
         * @param {websocket_api.IClientMessage=} [properties] Properties to set
         */
        function ClientMessage(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ClientMessage requestId.
         * @member {string} requestId
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.requestId = "";

        /**
         * ClientMessage createMarket.
         * @member {websocket_api.ICreateMarket|null|undefined} createMarket
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.createMarket = null;

        /**
         * ClientMessage settleMarket.
         * @member {websocket_api.ISettleMarket|null|undefined} settleMarket
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.settleMarket = null;

        /**
         * ClientMessage createOrder.
         * @member {websocket_api.ICreateOrder|null|undefined} createOrder
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.createOrder = null;

        /**
         * ClientMessage cancelOrder.
         * @member {websocket_api.ICancelOrder|null|undefined} cancelOrder
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.cancelOrder = null;

        /**
         * ClientMessage out.
         * @member {websocket_api.IOut|null|undefined} out
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.out = null;

        /**
         * ClientMessage makeTransfer.
         * @member {websocket_api.IMakeTransfer|null|undefined} makeTransfer
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.makeTransfer = null;

        /**
         * ClientMessage authenticate.
         * @member {websocket_api.IAuthenticate|null|undefined} authenticate
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.authenticate = null;

        /**
         * ClientMessage actAs.
         * @member {websocket_api.IActAs|null|undefined} actAs
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.actAs = null;

        /**
         * ClientMessage createAccount.
         * @member {websocket_api.ICreateAccount|null|undefined} createAccount
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.createAccount = null;

        /**
         * ClientMessage shareOwnership.
         * @member {websocket_api.IShareOwnership|null|undefined} shareOwnership
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.shareOwnership = null;

        /**
         * ClientMessage getFullOrderHistory.
         * @member {websocket_api.IGetFullOrderHistory|null|undefined} getFullOrderHistory
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.getFullOrderHistory = null;

        /**
         * ClientMessage getFullTradeHistory.
         * @member {websocket_api.IGetFullTradeHistory|null|undefined} getFullTradeHistory
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.getFullTradeHistory = null;

        /**
         * ClientMessage redeem.
         * @member {websocket_api.IRedeem|null|undefined} redeem
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.redeem = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * ClientMessage message.
         * @member {"createMarket"|"settleMarket"|"createOrder"|"cancelOrder"|"out"|"makeTransfer"|"authenticate"|"actAs"|"createAccount"|"shareOwnership"|"getFullOrderHistory"|"getFullTradeHistory"|"redeem"|undefined} message
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        Object.defineProperty(ClientMessage.prototype, "message", {
            get: $util.oneOfGetter($oneOfFields = ["createMarket", "settleMarket", "createOrder", "cancelOrder", "out", "makeTransfer", "authenticate", "actAs", "createAccount", "shareOwnership", "getFullOrderHistory", "getFullTradeHistory", "redeem"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new ClientMessage instance using the specified properties.
         * @function create
         * @memberof websocket_api.ClientMessage
         * @static
         * @param {websocket_api.IClientMessage=} [properties] Properties to set
         * @returns {websocket_api.ClientMessage} ClientMessage instance
         */
        ClientMessage.create = function create(properties) {
            return new ClientMessage(properties);
        };

        /**
         * Encodes the specified ClientMessage message. Does not implicitly {@link websocket_api.ClientMessage.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.ClientMessage
         * @static
         * @param {websocket_api.IClientMessage} message ClientMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ClientMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.createMarket != null && Object.hasOwnProperty.call(message, "createMarket"))
                $root.websocket_api.CreateMarket.encode(message.createMarket, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.settleMarket != null && Object.hasOwnProperty.call(message, "settleMarket"))
                $root.websocket_api.SettleMarket.encode(message.settleMarket, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.createOrder != null && Object.hasOwnProperty.call(message, "createOrder"))
                $root.websocket_api.CreateOrder.encode(message.createOrder, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.cancelOrder != null && Object.hasOwnProperty.call(message, "cancelOrder"))
                $root.websocket_api.CancelOrder.encode(message.cancelOrder, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.out != null && Object.hasOwnProperty.call(message, "out"))
                $root.websocket_api.Out.encode(message.out, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.makeTransfer != null && Object.hasOwnProperty.call(message, "makeTransfer"))
                $root.websocket_api.MakeTransfer.encode(message.makeTransfer, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.authenticate != null && Object.hasOwnProperty.call(message, "authenticate"))
                $root.websocket_api.Authenticate.encode(message.authenticate, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.actAs != null && Object.hasOwnProperty.call(message, "actAs"))
                $root.websocket_api.ActAs.encode(message.actAs, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.createAccount != null && Object.hasOwnProperty.call(message, "createAccount"))
                $root.websocket_api.CreateAccount.encode(message.createAccount, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.shareOwnership != null && Object.hasOwnProperty.call(message, "shareOwnership"))
                $root.websocket_api.ShareOwnership.encode(message.shareOwnership, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            if (message.getFullOrderHistory != null && Object.hasOwnProperty.call(message, "getFullOrderHistory"))
                $root.websocket_api.GetFullOrderHistory.encode(message.getFullOrderHistory, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
            if (message.getFullTradeHistory != null && Object.hasOwnProperty.call(message, "getFullTradeHistory"))
                $root.websocket_api.GetFullTradeHistory.encode(message.getFullTradeHistory, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
            if (message.redeem != null && Object.hasOwnProperty.call(message, "redeem"))
                $root.websocket_api.Redeem.encode(message.redeem, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
            if (message.requestId != null && Object.hasOwnProperty.call(message, "requestId"))
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.requestId);
            return writer;
        };

        /**
         * Encodes the specified ClientMessage message, length delimited. Does not implicitly {@link websocket_api.ClientMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.ClientMessage
         * @static
         * @param {websocket_api.IClientMessage} message ClientMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ClientMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ClientMessage message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.ClientMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.ClientMessage} ClientMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ClientMessage.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.ClientMessage();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 14: {
                        message.requestId = reader.string();
                        break;
                    }
                case 1: {
                        message.createMarket = $root.websocket_api.CreateMarket.decode(reader, reader.uint32());
                        break;
                    }
                case 2: {
                        message.settleMarket = $root.websocket_api.SettleMarket.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.createOrder = $root.websocket_api.CreateOrder.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.cancelOrder = $root.websocket_api.CancelOrder.decode(reader, reader.uint32());
                        break;
                    }
                case 5: {
                        message.out = $root.websocket_api.Out.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.makeTransfer = $root.websocket_api.MakeTransfer.decode(reader, reader.uint32());
                        break;
                    }
                case 7: {
                        message.authenticate = $root.websocket_api.Authenticate.decode(reader, reader.uint32());
                        break;
                    }
                case 8: {
                        message.actAs = $root.websocket_api.ActAs.decode(reader, reader.uint32());
                        break;
                    }
                case 9: {
                        message.createAccount = $root.websocket_api.CreateAccount.decode(reader, reader.uint32());
                        break;
                    }
                case 10: {
                        message.shareOwnership = $root.websocket_api.ShareOwnership.decode(reader, reader.uint32());
                        break;
                    }
                case 11: {
                        message.getFullOrderHistory = $root.websocket_api.GetFullOrderHistory.decode(reader, reader.uint32());
                        break;
                    }
                case 12: {
                        message.getFullTradeHistory = $root.websocket_api.GetFullTradeHistory.decode(reader, reader.uint32());
                        break;
                    }
                case 13: {
                        message.redeem = $root.websocket_api.Redeem.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ClientMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.ClientMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.ClientMessage} ClientMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ClientMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ClientMessage message.
         * @function verify
         * @memberof websocket_api.ClientMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ClientMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.requestId != null && message.hasOwnProperty("requestId"))
                if (!$util.isString(message.requestId))
                    return "requestId: string expected";
            if (message.createMarket != null && message.hasOwnProperty("createMarket")) {
                properties.message = 1;
                {
                    var error = $root.websocket_api.CreateMarket.verify(message.createMarket);
                    if (error)
                        return "createMarket." + error;
                }
            }
            if (message.settleMarket != null && message.hasOwnProperty("settleMarket")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.SettleMarket.verify(message.settleMarket);
                    if (error)
                        return "settleMarket." + error;
                }
            }
            if (message.createOrder != null && message.hasOwnProperty("createOrder")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.CreateOrder.verify(message.createOrder);
                    if (error)
                        return "createOrder." + error;
                }
            }
            if (message.cancelOrder != null && message.hasOwnProperty("cancelOrder")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.CancelOrder.verify(message.cancelOrder);
                    if (error)
                        return "cancelOrder." + error;
                }
            }
            if (message.out != null && message.hasOwnProperty("out")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Out.verify(message.out);
                    if (error)
                        return "out." + error;
                }
            }
            if (message.makeTransfer != null && message.hasOwnProperty("makeTransfer")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.MakeTransfer.verify(message.makeTransfer);
                    if (error)
                        return "makeTransfer." + error;
                }
            }
            if (message.authenticate != null && message.hasOwnProperty("authenticate")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Authenticate.verify(message.authenticate);
                    if (error)
                        return "authenticate." + error;
                }
            }
            if (message.actAs != null && message.hasOwnProperty("actAs")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.ActAs.verify(message.actAs);
                    if (error)
                        return "actAs." + error;
                }
            }
            if (message.createAccount != null && message.hasOwnProperty("createAccount")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.CreateAccount.verify(message.createAccount);
                    if (error)
                        return "createAccount." + error;
                }
            }
            if (message.shareOwnership != null && message.hasOwnProperty("shareOwnership")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.ShareOwnership.verify(message.shareOwnership);
                    if (error)
                        return "shareOwnership." + error;
                }
            }
            if (message.getFullOrderHistory != null && message.hasOwnProperty("getFullOrderHistory")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.GetFullOrderHistory.verify(message.getFullOrderHistory);
                    if (error)
                        return "getFullOrderHistory." + error;
                }
            }
            if (message.getFullTradeHistory != null && message.hasOwnProperty("getFullTradeHistory")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.GetFullTradeHistory.verify(message.getFullTradeHistory);
                    if (error)
                        return "getFullTradeHistory." + error;
                }
            }
            if (message.redeem != null && message.hasOwnProperty("redeem")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Redeem.verify(message.redeem);
                    if (error)
                        return "redeem." + error;
                }
            }
            return null;
        };

        /**
         * Creates a ClientMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.ClientMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.ClientMessage} ClientMessage
         */
        ClientMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.ClientMessage)
                return object;
            var message = new $root.websocket_api.ClientMessage();
            if (object.requestId != null)
                message.requestId = String(object.requestId);
            if (object.createMarket != null) {
                if (typeof object.createMarket !== "object")
                    throw TypeError(".websocket_api.ClientMessage.createMarket: object expected");
                message.createMarket = $root.websocket_api.CreateMarket.fromObject(object.createMarket);
            }
            if (object.settleMarket != null) {
                if (typeof object.settleMarket !== "object")
                    throw TypeError(".websocket_api.ClientMessage.settleMarket: object expected");
                message.settleMarket = $root.websocket_api.SettleMarket.fromObject(object.settleMarket);
            }
            if (object.createOrder != null) {
                if (typeof object.createOrder !== "object")
                    throw TypeError(".websocket_api.ClientMessage.createOrder: object expected");
                message.createOrder = $root.websocket_api.CreateOrder.fromObject(object.createOrder);
            }
            if (object.cancelOrder != null) {
                if (typeof object.cancelOrder !== "object")
                    throw TypeError(".websocket_api.ClientMessage.cancelOrder: object expected");
                message.cancelOrder = $root.websocket_api.CancelOrder.fromObject(object.cancelOrder);
            }
            if (object.out != null) {
                if (typeof object.out !== "object")
                    throw TypeError(".websocket_api.ClientMessage.out: object expected");
                message.out = $root.websocket_api.Out.fromObject(object.out);
            }
            if (object.makeTransfer != null) {
                if (typeof object.makeTransfer !== "object")
                    throw TypeError(".websocket_api.ClientMessage.makeTransfer: object expected");
                message.makeTransfer = $root.websocket_api.MakeTransfer.fromObject(object.makeTransfer);
            }
            if (object.authenticate != null) {
                if (typeof object.authenticate !== "object")
                    throw TypeError(".websocket_api.ClientMessage.authenticate: object expected");
                message.authenticate = $root.websocket_api.Authenticate.fromObject(object.authenticate);
            }
            if (object.actAs != null) {
                if (typeof object.actAs !== "object")
                    throw TypeError(".websocket_api.ClientMessage.actAs: object expected");
                message.actAs = $root.websocket_api.ActAs.fromObject(object.actAs);
            }
            if (object.createAccount != null) {
                if (typeof object.createAccount !== "object")
                    throw TypeError(".websocket_api.ClientMessage.createAccount: object expected");
                message.createAccount = $root.websocket_api.CreateAccount.fromObject(object.createAccount);
            }
            if (object.shareOwnership != null) {
                if (typeof object.shareOwnership !== "object")
                    throw TypeError(".websocket_api.ClientMessage.shareOwnership: object expected");
                message.shareOwnership = $root.websocket_api.ShareOwnership.fromObject(object.shareOwnership);
            }
            if (object.getFullOrderHistory != null) {
                if (typeof object.getFullOrderHistory !== "object")
                    throw TypeError(".websocket_api.ClientMessage.getFullOrderHistory: object expected");
                message.getFullOrderHistory = $root.websocket_api.GetFullOrderHistory.fromObject(object.getFullOrderHistory);
            }
            if (object.getFullTradeHistory != null) {
                if (typeof object.getFullTradeHistory !== "object")
                    throw TypeError(".websocket_api.ClientMessage.getFullTradeHistory: object expected");
                message.getFullTradeHistory = $root.websocket_api.GetFullTradeHistory.fromObject(object.getFullTradeHistory);
            }
            if (object.redeem != null) {
                if (typeof object.redeem !== "object")
                    throw TypeError(".websocket_api.ClientMessage.redeem: object expected");
                message.redeem = $root.websocket_api.Redeem.fromObject(object.redeem);
            }
            return message;
        };

        /**
         * Creates a plain object from a ClientMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.ClientMessage
         * @static
         * @param {websocket_api.ClientMessage} message ClientMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ClientMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.requestId = "";
            if (message.createMarket != null && message.hasOwnProperty("createMarket")) {
                object.createMarket = $root.websocket_api.CreateMarket.toObject(message.createMarket, options);
                if (options.oneofs)
                    object.message = "createMarket";
            }
            if (message.settleMarket != null && message.hasOwnProperty("settleMarket")) {
                object.settleMarket = $root.websocket_api.SettleMarket.toObject(message.settleMarket, options);
                if (options.oneofs)
                    object.message = "settleMarket";
            }
            if (message.createOrder != null && message.hasOwnProperty("createOrder")) {
                object.createOrder = $root.websocket_api.CreateOrder.toObject(message.createOrder, options);
                if (options.oneofs)
                    object.message = "createOrder";
            }
            if (message.cancelOrder != null && message.hasOwnProperty("cancelOrder")) {
                object.cancelOrder = $root.websocket_api.CancelOrder.toObject(message.cancelOrder, options);
                if (options.oneofs)
                    object.message = "cancelOrder";
            }
            if (message.out != null && message.hasOwnProperty("out")) {
                object.out = $root.websocket_api.Out.toObject(message.out, options);
                if (options.oneofs)
                    object.message = "out";
            }
            if (message.makeTransfer != null && message.hasOwnProperty("makeTransfer")) {
                object.makeTransfer = $root.websocket_api.MakeTransfer.toObject(message.makeTransfer, options);
                if (options.oneofs)
                    object.message = "makeTransfer";
            }
            if (message.authenticate != null && message.hasOwnProperty("authenticate")) {
                object.authenticate = $root.websocket_api.Authenticate.toObject(message.authenticate, options);
                if (options.oneofs)
                    object.message = "authenticate";
            }
            if (message.actAs != null && message.hasOwnProperty("actAs")) {
                object.actAs = $root.websocket_api.ActAs.toObject(message.actAs, options);
                if (options.oneofs)
                    object.message = "actAs";
            }
            if (message.createAccount != null && message.hasOwnProperty("createAccount")) {
                object.createAccount = $root.websocket_api.CreateAccount.toObject(message.createAccount, options);
                if (options.oneofs)
                    object.message = "createAccount";
            }
            if (message.shareOwnership != null && message.hasOwnProperty("shareOwnership")) {
                object.shareOwnership = $root.websocket_api.ShareOwnership.toObject(message.shareOwnership, options);
                if (options.oneofs)
                    object.message = "shareOwnership";
            }
            if (message.getFullOrderHistory != null && message.hasOwnProperty("getFullOrderHistory")) {
                object.getFullOrderHistory = $root.websocket_api.GetFullOrderHistory.toObject(message.getFullOrderHistory, options);
                if (options.oneofs)
                    object.message = "getFullOrderHistory";
            }
            if (message.getFullTradeHistory != null && message.hasOwnProperty("getFullTradeHistory")) {
                object.getFullTradeHistory = $root.websocket_api.GetFullTradeHistory.toObject(message.getFullTradeHistory, options);
                if (options.oneofs)
                    object.message = "getFullTradeHistory";
            }
            if (message.redeem != null && message.hasOwnProperty("redeem")) {
                object.redeem = $root.websocket_api.Redeem.toObject(message.redeem, options);
                if (options.oneofs)
                    object.message = "redeem";
            }
            if (message.requestId != null && message.hasOwnProperty("requestId"))
                object.requestId = message.requestId;
            return object;
        };

        /**
         * Converts this ClientMessage to JSON.
         * @function toJSON
         * @memberof websocket_api.ClientMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ClientMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ClientMessage
         * @function getTypeUrl
         * @memberof websocket_api.ClientMessage
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ClientMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.ClientMessage";
        };

        return ClientMessage;
    })();

    websocket_api.GetFullOrderHistory = (function() {

        /**
         * Properties of a GetFullOrderHistory.
         * @memberof websocket_api
         * @interface IGetFullOrderHistory
         * @property {number|Long|null} [marketId] GetFullOrderHistory marketId
         */

        /**
         * Constructs a new GetFullOrderHistory.
         * @memberof websocket_api
         * @classdesc Represents a GetFullOrderHistory.
         * @implements IGetFullOrderHistory
         * @constructor
         * @param {websocket_api.IGetFullOrderHistory=} [properties] Properties to set
         */
        function GetFullOrderHistory(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GetFullOrderHistory marketId.
         * @member {number|Long} marketId
         * @memberof websocket_api.GetFullOrderHistory
         * @instance
         */
        GetFullOrderHistory.prototype.marketId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new GetFullOrderHistory instance using the specified properties.
         * @function create
         * @memberof websocket_api.GetFullOrderHistory
         * @static
         * @param {websocket_api.IGetFullOrderHistory=} [properties] Properties to set
         * @returns {websocket_api.GetFullOrderHistory} GetFullOrderHistory instance
         */
        GetFullOrderHistory.create = function create(properties) {
            return new GetFullOrderHistory(properties);
        };

        /**
         * Encodes the specified GetFullOrderHistory message. Does not implicitly {@link websocket_api.GetFullOrderHistory.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.GetFullOrderHistory
         * @static
         * @param {websocket_api.IGetFullOrderHistory} message GetFullOrderHistory message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFullOrderHistory.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.marketId != null && Object.hasOwnProperty.call(message, "marketId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.marketId);
            return writer;
        };

        /**
         * Encodes the specified GetFullOrderHistory message, length delimited. Does not implicitly {@link websocket_api.GetFullOrderHistory.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.GetFullOrderHistory
         * @static
         * @param {websocket_api.IGetFullOrderHistory} message GetFullOrderHistory message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFullOrderHistory.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GetFullOrderHistory message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.GetFullOrderHistory
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.GetFullOrderHistory} GetFullOrderHistory
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFullOrderHistory.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.GetFullOrderHistory();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.marketId = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GetFullOrderHistory message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.GetFullOrderHistory
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.GetFullOrderHistory} GetFullOrderHistory
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFullOrderHistory.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetFullOrderHistory message.
         * @function verify
         * @memberof websocket_api.GetFullOrderHistory
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetFullOrderHistory.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (!$util.isInteger(message.marketId) && !(message.marketId && $util.isInteger(message.marketId.low) && $util.isInteger(message.marketId.high)))
                    return "marketId: integer|Long expected";
            return null;
        };

        /**
         * Creates a GetFullOrderHistory message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.GetFullOrderHistory
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.GetFullOrderHistory} GetFullOrderHistory
         */
        GetFullOrderHistory.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.GetFullOrderHistory)
                return object;
            var message = new $root.websocket_api.GetFullOrderHistory();
            if (object.marketId != null)
                if ($util.Long)
                    (message.marketId = $util.Long.fromValue(object.marketId)).unsigned = false;
                else if (typeof object.marketId === "string")
                    message.marketId = parseInt(object.marketId, 10);
                else if (typeof object.marketId === "number")
                    message.marketId = object.marketId;
                else if (typeof object.marketId === "object")
                    message.marketId = new $util.LongBits(object.marketId.low >>> 0, object.marketId.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a GetFullOrderHistory message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.GetFullOrderHistory
         * @static
         * @param {websocket_api.GetFullOrderHistory} message GetFullOrderHistory
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetFullOrderHistory.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.marketId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.marketId = options.longs === String ? "0" : 0;
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (typeof message.marketId === "number")
                    object.marketId = options.longs === String ? String(message.marketId) : message.marketId;
                else
                    object.marketId = options.longs === String ? $util.Long.prototype.toString.call(message.marketId) : options.longs === Number ? new $util.LongBits(message.marketId.low >>> 0, message.marketId.high >>> 0).toNumber() : message.marketId;
            return object;
        };

        /**
         * Converts this GetFullOrderHistory to JSON.
         * @function toJSON
         * @memberof websocket_api.GetFullOrderHistory
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetFullOrderHistory.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetFullOrderHistory
         * @function getTypeUrl
         * @memberof websocket_api.GetFullOrderHistory
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetFullOrderHistory.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.GetFullOrderHistory";
        };

        return GetFullOrderHistory;
    })();

    websocket_api.GetFullTradeHistory = (function() {

        /**
         * Properties of a GetFullTradeHistory.
         * @memberof websocket_api
         * @interface IGetFullTradeHistory
         * @property {number|Long|null} [marketId] GetFullTradeHistory marketId
         */

        /**
         * Constructs a new GetFullTradeHistory.
         * @memberof websocket_api
         * @classdesc Represents a GetFullTradeHistory.
         * @implements IGetFullTradeHistory
         * @constructor
         * @param {websocket_api.IGetFullTradeHistory=} [properties] Properties to set
         */
        function GetFullTradeHistory(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GetFullTradeHistory marketId.
         * @member {number|Long} marketId
         * @memberof websocket_api.GetFullTradeHistory
         * @instance
         */
        GetFullTradeHistory.prototype.marketId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new GetFullTradeHistory instance using the specified properties.
         * @function create
         * @memberof websocket_api.GetFullTradeHistory
         * @static
         * @param {websocket_api.IGetFullTradeHistory=} [properties] Properties to set
         * @returns {websocket_api.GetFullTradeHistory} GetFullTradeHistory instance
         */
        GetFullTradeHistory.create = function create(properties) {
            return new GetFullTradeHistory(properties);
        };

        /**
         * Encodes the specified GetFullTradeHistory message. Does not implicitly {@link websocket_api.GetFullTradeHistory.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.GetFullTradeHistory
         * @static
         * @param {websocket_api.IGetFullTradeHistory} message GetFullTradeHistory message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFullTradeHistory.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.marketId != null && Object.hasOwnProperty.call(message, "marketId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.marketId);
            return writer;
        };

        /**
         * Encodes the specified GetFullTradeHistory message, length delimited. Does not implicitly {@link websocket_api.GetFullTradeHistory.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.GetFullTradeHistory
         * @static
         * @param {websocket_api.IGetFullTradeHistory} message GetFullTradeHistory message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GetFullTradeHistory.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GetFullTradeHistory message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.GetFullTradeHistory
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.GetFullTradeHistory} GetFullTradeHistory
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFullTradeHistory.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.GetFullTradeHistory();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.marketId = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GetFullTradeHistory message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.GetFullTradeHistory
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.GetFullTradeHistory} GetFullTradeHistory
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GetFullTradeHistory.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GetFullTradeHistory message.
         * @function verify
         * @memberof websocket_api.GetFullTradeHistory
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GetFullTradeHistory.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (!$util.isInteger(message.marketId) && !(message.marketId && $util.isInteger(message.marketId.low) && $util.isInteger(message.marketId.high)))
                    return "marketId: integer|Long expected";
            return null;
        };

        /**
         * Creates a GetFullTradeHistory message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.GetFullTradeHistory
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.GetFullTradeHistory} GetFullTradeHistory
         */
        GetFullTradeHistory.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.GetFullTradeHistory)
                return object;
            var message = new $root.websocket_api.GetFullTradeHistory();
            if (object.marketId != null)
                if ($util.Long)
                    (message.marketId = $util.Long.fromValue(object.marketId)).unsigned = false;
                else if (typeof object.marketId === "string")
                    message.marketId = parseInt(object.marketId, 10);
                else if (typeof object.marketId === "number")
                    message.marketId = object.marketId;
                else if (typeof object.marketId === "object")
                    message.marketId = new $util.LongBits(object.marketId.low >>> 0, object.marketId.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a GetFullTradeHistory message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.GetFullTradeHistory
         * @static
         * @param {websocket_api.GetFullTradeHistory} message GetFullTradeHistory
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GetFullTradeHistory.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.marketId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.marketId = options.longs === String ? "0" : 0;
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (typeof message.marketId === "number")
                    object.marketId = options.longs === String ? String(message.marketId) : message.marketId;
                else
                    object.marketId = options.longs === String ? $util.Long.prototype.toString.call(message.marketId) : options.longs === Number ? new $util.LongBits(message.marketId.low >>> 0, message.marketId.high >>> 0).toNumber() : message.marketId;
            return object;
        };

        /**
         * Converts this GetFullTradeHistory to JSON.
         * @function toJSON
         * @memberof websocket_api.GetFullTradeHistory
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GetFullTradeHistory.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GetFullTradeHistory
         * @function getTypeUrl
         * @memberof websocket_api.GetFullTradeHistory
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GetFullTradeHistory.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.GetFullTradeHistory";
        };

        return GetFullTradeHistory;
    })();

    websocket_api.CancelOrder = (function() {

        /**
         * Properties of a CancelOrder.
         * @memberof websocket_api
         * @interface ICancelOrder
         * @property {number|Long|null} [id] CancelOrder id
         */

        /**
         * Constructs a new CancelOrder.
         * @memberof websocket_api
         * @classdesc Represents a CancelOrder.
         * @implements ICancelOrder
         * @constructor
         * @param {websocket_api.ICancelOrder=} [properties] Properties to set
         */
        function CancelOrder(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CancelOrder id.
         * @member {number|Long} id
         * @memberof websocket_api.CancelOrder
         * @instance
         */
        CancelOrder.prototype.id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new CancelOrder instance using the specified properties.
         * @function create
         * @memberof websocket_api.CancelOrder
         * @static
         * @param {websocket_api.ICancelOrder=} [properties] Properties to set
         * @returns {websocket_api.CancelOrder} CancelOrder instance
         */
        CancelOrder.create = function create(properties) {
            return new CancelOrder(properties);
        };

        /**
         * Encodes the specified CancelOrder message. Does not implicitly {@link websocket_api.CancelOrder.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.CancelOrder
         * @static
         * @param {websocket_api.ICancelOrder} message CancelOrder message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CancelOrder.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.id);
            return writer;
        };

        /**
         * Encodes the specified CancelOrder message, length delimited. Does not implicitly {@link websocket_api.CancelOrder.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.CancelOrder
         * @static
         * @param {websocket_api.ICancelOrder} message CancelOrder message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CancelOrder.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CancelOrder message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.CancelOrder
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.CancelOrder} CancelOrder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CancelOrder.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.CancelOrder();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CancelOrder message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.CancelOrder
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.CancelOrder} CancelOrder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CancelOrder.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CancelOrder message.
         * @function verify
         * @memberof websocket_api.CancelOrder
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CancelOrder.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            return null;
        };

        /**
         * Creates a CancelOrder message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.CancelOrder
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.CancelOrder} CancelOrder
         */
        CancelOrder.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.CancelOrder)
                return object;
            var message = new $root.websocket_api.CancelOrder();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = false;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a CancelOrder message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.CancelOrder
         * @static
         * @param {websocket_api.CancelOrder} message CancelOrder
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CancelOrder.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
            return object;
        };

        /**
         * Converts this CancelOrder to JSON.
         * @function toJSON
         * @memberof websocket_api.CancelOrder
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CancelOrder.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CancelOrder
         * @function getTypeUrl
         * @memberof websocket_api.CancelOrder
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CancelOrder.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.CancelOrder";
        };

        return CancelOrder;
    })();

    websocket_api.Authenticate = (function() {

        /**
         * Properties of an Authenticate.
         * @memberof websocket_api
         * @interface IAuthenticate
         * @property {string|null} [jwt] Authenticate jwt
         * @property {string|null} [idJwt] Authenticate idJwt
         * @property {number|Long|null} [actAs] Authenticate actAs
         */

        /**
         * Constructs a new Authenticate.
         * @memberof websocket_api
         * @classdesc Represents an Authenticate.
         * @implements IAuthenticate
         * @constructor
         * @param {websocket_api.IAuthenticate=} [properties] Properties to set
         */
        function Authenticate(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Authenticate jwt.
         * @member {string} jwt
         * @memberof websocket_api.Authenticate
         * @instance
         */
        Authenticate.prototype.jwt = "";

        /**
         * Authenticate idJwt.
         * @member {string} idJwt
         * @memberof websocket_api.Authenticate
         * @instance
         */
        Authenticate.prototype.idJwt = "";

        /**
         * Authenticate actAs.
         * @member {number|Long} actAs
         * @memberof websocket_api.Authenticate
         * @instance
         */
        Authenticate.prototype.actAs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new Authenticate instance using the specified properties.
         * @function create
         * @memberof websocket_api.Authenticate
         * @static
         * @param {websocket_api.IAuthenticate=} [properties] Properties to set
         * @returns {websocket_api.Authenticate} Authenticate instance
         */
        Authenticate.create = function create(properties) {
            return new Authenticate(properties);
        };

        /**
         * Encodes the specified Authenticate message. Does not implicitly {@link websocket_api.Authenticate.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Authenticate
         * @static
         * @param {websocket_api.IAuthenticate} message Authenticate message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Authenticate.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.jwt != null && Object.hasOwnProperty.call(message, "jwt"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.jwt);
            if (message.idJwt != null && Object.hasOwnProperty.call(message, "idJwt"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.idJwt);
            if (message.actAs != null && Object.hasOwnProperty.call(message, "actAs"))
                writer.uint32(/* id 4, wireType 0 =*/32).int64(message.actAs);
            return writer;
        };

        /**
         * Encodes the specified Authenticate message, length delimited. Does not implicitly {@link websocket_api.Authenticate.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Authenticate
         * @static
         * @param {websocket_api.IAuthenticate} message Authenticate message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Authenticate.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Authenticate message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Authenticate
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Authenticate} Authenticate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Authenticate.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Authenticate();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.jwt = reader.string();
                        break;
                    }
                case 2: {
                        message.idJwt = reader.string();
                        break;
                    }
                case 4: {
                        message.actAs = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Authenticate message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Authenticate
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Authenticate} Authenticate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Authenticate.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Authenticate message.
         * @function verify
         * @memberof websocket_api.Authenticate
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Authenticate.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.jwt != null && message.hasOwnProperty("jwt"))
                if (!$util.isString(message.jwt))
                    return "jwt: string expected";
            if (message.idJwt != null && message.hasOwnProperty("idJwt"))
                if (!$util.isString(message.idJwt))
                    return "idJwt: string expected";
            if (message.actAs != null && message.hasOwnProperty("actAs"))
                if (!$util.isInteger(message.actAs) && !(message.actAs && $util.isInteger(message.actAs.low) && $util.isInteger(message.actAs.high)))
                    return "actAs: integer|Long expected";
            return null;
        };

        /**
         * Creates an Authenticate message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Authenticate
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Authenticate} Authenticate
         */
        Authenticate.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Authenticate)
                return object;
            var message = new $root.websocket_api.Authenticate();
            if (object.jwt != null)
                message.jwt = String(object.jwt);
            if (object.idJwt != null)
                message.idJwt = String(object.idJwt);
            if (object.actAs != null)
                if ($util.Long)
                    (message.actAs = $util.Long.fromValue(object.actAs)).unsigned = false;
                else if (typeof object.actAs === "string")
                    message.actAs = parseInt(object.actAs, 10);
                else if (typeof object.actAs === "number")
                    message.actAs = object.actAs;
                else if (typeof object.actAs === "object")
                    message.actAs = new $util.LongBits(object.actAs.low >>> 0, object.actAs.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from an Authenticate message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Authenticate
         * @static
         * @param {websocket_api.Authenticate} message Authenticate
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Authenticate.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.jwt = "";
                object.idJwt = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.actAs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.actAs = options.longs === String ? "0" : 0;
            }
            if (message.jwt != null && message.hasOwnProperty("jwt"))
                object.jwt = message.jwt;
            if (message.idJwt != null && message.hasOwnProperty("idJwt"))
                object.idJwt = message.idJwt;
            if (message.actAs != null && message.hasOwnProperty("actAs"))
                if (typeof message.actAs === "number")
                    object.actAs = options.longs === String ? String(message.actAs) : message.actAs;
                else
                    object.actAs = options.longs === String ? $util.Long.prototype.toString.call(message.actAs) : options.longs === Number ? new $util.LongBits(message.actAs.low >>> 0, message.actAs.high >>> 0).toNumber() : message.actAs;
            return object;
        };

        /**
         * Converts this Authenticate to JSON.
         * @function toJSON
         * @memberof websocket_api.Authenticate
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Authenticate.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Authenticate
         * @function getTypeUrl
         * @memberof websocket_api.Authenticate
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Authenticate.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Authenticate";
        };

        return Authenticate;
    })();

    websocket_api.ActAs = (function() {

        /**
         * Properties of an ActAs.
         * @memberof websocket_api
         * @interface IActAs
         * @property {number|Long|null} [accountId] ActAs accountId
         */

        /**
         * Constructs a new ActAs.
         * @memberof websocket_api
         * @classdesc Represents an ActAs.
         * @implements IActAs
         * @constructor
         * @param {websocket_api.IActAs=} [properties] Properties to set
         */
        function ActAs(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ActAs accountId.
         * @member {number|Long} accountId
         * @memberof websocket_api.ActAs
         * @instance
         */
        ActAs.prototype.accountId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new ActAs instance using the specified properties.
         * @function create
         * @memberof websocket_api.ActAs
         * @static
         * @param {websocket_api.IActAs=} [properties] Properties to set
         * @returns {websocket_api.ActAs} ActAs instance
         */
        ActAs.create = function create(properties) {
            return new ActAs(properties);
        };

        /**
         * Encodes the specified ActAs message. Does not implicitly {@link websocket_api.ActAs.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.ActAs
         * @static
         * @param {websocket_api.IActAs} message ActAs message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ActAs.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.accountId != null && Object.hasOwnProperty.call(message, "accountId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.accountId);
            return writer;
        };

        /**
         * Encodes the specified ActAs message, length delimited. Does not implicitly {@link websocket_api.ActAs.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.ActAs
         * @static
         * @param {websocket_api.IActAs} message ActAs message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ActAs.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ActAs message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.ActAs
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.ActAs} ActAs
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ActAs.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.ActAs();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.accountId = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an ActAs message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.ActAs
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.ActAs} ActAs
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ActAs.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ActAs message.
         * @function verify
         * @memberof websocket_api.ActAs
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ActAs.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.accountId != null && message.hasOwnProperty("accountId"))
                if (!$util.isInteger(message.accountId) && !(message.accountId && $util.isInteger(message.accountId.low) && $util.isInteger(message.accountId.high)))
                    return "accountId: integer|Long expected";
            return null;
        };

        /**
         * Creates an ActAs message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.ActAs
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.ActAs} ActAs
         */
        ActAs.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.ActAs)
                return object;
            var message = new $root.websocket_api.ActAs();
            if (object.accountId != null)
                if ($util.Long)
                    (message.accountId = $util.Long.fromValue(object.accountId)).unsigned = false;
                else if (typeof object.accountId === "string")
                    message.accountId = parseInt(object.accountId, 10);
                else if (typeof object.accountId === "number")
                    message.accountId = object.accountId;
                else if (typeof object.accountId === "object")
                    message.accountId = new $util.LongBits(object.accountId.low >>> 0, object.accountId.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from an ActAs message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.ActAs
         * @static
         * @param {websocket_api.ActAs} message ActAs
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ActAs.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.accountId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.accountId = options.longs === String ? "0" : 0;
            if (message.accountId != null && message.hasOwnProperty("accountId"))
                if (typeof message.accountId === "number")
                    object.accountId = options.longs === String ? String(message.accountId) : message.accountId;
                else
                    object.accountId = options.longs === String ? $util.Long.prototype.toString.call(message.accountId) : options.longs === Number ? new $util.LongBits(message.accountId.low >>> 0, message.accountId.high >>> 0).toNumber() : message.accountId;
            return object;
        };

        /**
         * Converts this ActAs to JSON.
         * @function toJSON
         * @memberof websocket_api.ActAs
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ActAs.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ActAs
         * @function getTypeUrl
         * @memberof websocket_api.ActAs
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ActAs.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.ActAs";
        };

        return ActAs;
    })();

    websocket_api.CreateAccount = (function() {

        /**
         * Properties of a CreateAccount.
         * @memberof websocket_api
         * @interface ICreateAccount
         * @property {number|Long|null} [ownerId] CreateAccount ownerId
         * @property {string|null} [name] CreateAccount name
         */

        /**
         * Constructs a new CreateAccount.
         * @memberof websocket_api
         * @classdesc Represents a CreateAccount.
         * @implements ICreateAccount
         * @constructor
         * @param {websocket_api.ICreateAccount=} [properties] Properties to set
         */
        function CreateAccount(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateAccount ownerId.
         * @member {number|Long} ownerId
         * @memberof websocket_api.CreateAccount
         * @instance
         */
        CreateAccount.prototype.ownerId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * CreateAccount name.
         * @member {string} name
         * @memberof websocket_api.CreateAccount
         * @instance
         */
        CreateAccount.prototype.name = "";

        /**
         * Creates a new CreateAccount instance using the specified properties.
         * @function create
         * @memberof websocket_api.CreateAccount
         * @static
         * @param {websocket_api.ICreateAccount=} [properties] Properties to set
         * @returns {websocket_api.CreateAccount} CreateAccount instance
         */
        CreateAccount.create = function create(properties) {
            return new CreateAccount(properties);
        };

        /**
         * Encodes the specified CreateAccount message. Does not implicitly {@link websocket_api.CreateAccount.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.CreateAccount
         * @static
         * @param {websocket_api.ICreateAccount} message CreateAccount message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateAccount.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ownerId != null && Object.hasOwnProperty.call(message, "ownerId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.ownerId);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            return writer;
        };

        /**
         * Encodes the specified CreateAccount message, length delimited. Does not implicitly {@link websocket_api.CreateAccount.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.CreateAccount
         * @static
         * @param {websocket_api.ICreateAccount} message CreateAccount message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateAccount.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateAccount message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.CreateAccount
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.CreateAccount} CreateAccount
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateAccount.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.CreateAccount();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.ownerId = reader.int64();
                        break;
                    }
                case 2: {
                        message.name = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CreateAccount message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.CreateAccount
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.CreateAccount} CreateAccount
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateAccount.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateAccount message.
         * @function verify
         * @memberof websocket_api.CreateAccount
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateAccount.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.ownerId != null && message.hasOwnProperty("ownerId"))
                if (!$util.isInteger(message.ownerId) && !(message.ownerId && $util.isInteger(message.ownerId.low) && $util.isInteger(message.ownerId.high)))
                    return "ownerId: integer|Long expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            return null;
        };

        /**
         * Creates a CreateAccount message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.CreateAccount
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.CreateAccount} CreateAccount
         */
        CreateAccount.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.CreateAccount)
                return object;
            var message = new $root.websocket_api.CreateAccount();
            if (object.ownerId != null)
                if ($util.Long)
                    (message.ownerId = $util.Long.fromValue(object.ownerId)).unsigned = false;
                else if (typeof object.ownerId === "string")
                    message.ownerId = parseInt(object.ownerId, 10);
                else if (typeof object.ownerId === "number")
                    message.ownerId = object.ownerId;
                else if (typeof object.ownerId === "object")
                    message.ownerId = new $util.LongBits(object.ownerId.low >>> 0, object.ownerId.high >>> 0).toNumber();
            if (object.name != null)
                message.name = String(object.name);
            return message;
        };

        /**
         * Creates a plain object from a CreateAccount message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.CreateAccount
         * @static
         * @param {websocket_api.CreateAccount} message CreateAccount
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateAccount.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.ownerId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.ownerId = options.longs === String ? "0" : 0;
                object.name = "";
            }
            if (message.ownerId != null && message.hasOwnProperty("ownerId"))
                if (typeof message.ownerId === "number")
                    object.ownerId = options.longs === String ? String(message.ownerId) : message.ownerId;
                else
                    object.ownerId = options.longs === String ? $util.Long.prototype.toString.call(message.ownerId) : options.longs === Number ? new $util.LongBits(message.ownerId.low >>> 0, message.ownerId.high >>> 0).toNumber() : message.ownerId;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            return object;
        };

        /**
         * Converts this CreateAccount to JSON.
         * @function toJSON
         * @memberof websocket_api.CreateAccount
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateAccount.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateAccount
         * @function getTypeUrl
         * @memberof websocket_api.CreateAccount
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateAccount.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.CreateAccount";
        };

        return CreateAccount;
    })();

    websocket_api.ShareOwnership = (function() {

        /**
         * Properties of a ShareOwnership.
         * @memberof websocket_api
         * @interface IShareOwnership
         * @property {number|Long|null} [ofAccountId] ShareOwnership ofAccountId
         * @property {number|Long|null} [toAccountId] ShareOwnership toAccountId
         */

        /**
         * Constructs a new ShareOwnership.
         * @memberof websocket_api
         * @classdesc Represents a ShareOwnership.
         * @implements IShareOwnership
         * @constructor
         * @param {websocket_api.IShareOwnership=} [properties] Properties to set
         */
        function ShareOwnership(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ShareOwnership ofAccountId.
         * @member {number|Long} ofAccountId
         * @memberof websocket_api.ShareOwnership
         * @instance
         */
        ShareOwnership.prototype.ofAccountId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * ShareOwnership toAccountId.
         * @member {number|Long} toAccountId
         * @memberof websocket_api.ShareOwnership
         * @instance
         */
        ShareOwnership.prototype.toAccountId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new ShareOwnership instance using the specified properties.
         * @function create
         * @memberof websocket_api.ShareOwnership
         * @static
         * @param {websocket_api.IShareOwnership=} [properties] Properties to set
         * @returns {websocket_api.ShareOwnership} ShareOwnership instance
         */
        ShareOwnership.create = function create(properties) {
            return new ShareOwnership(properties);
        };

        /**
         * Encodes the specified ShareOwnership message. Does not implicitly {@link websocket_api.ShareOwnership.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.ShareOwnership
         * @static
         * @param {websocket_api.IShareOwnership} message ShareOwnership message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ShareOwnership.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ofAccountId != null && Object.hasOwnProperty.call(message, "ofAccountId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.ofAccountId);
            if (message.toAccountId != null && Object.hasOwnProperty.call(message, "toAccountId"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.toAccountId);
            return writer;
        };

        /**
         * Encodes the specified ShareOwnership message, length delimited. Does not implicitly {@link websocket_api.ShareOwnership.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.ShareOwnership
         * @static
         * @param {websocket_api.IShareOwnership} message ShareOwnership message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ShareOwnership.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ShareOwnership message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.ShareOwnership
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.ShareOwnership} ShareOwnership
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ShareOwnership.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.ShareOwnership();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.ofAccountId = reader.int64();
                        break;
                    }
                case 2: {
                        message.toAccountId = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ShareOwnership message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.ShareOwnership
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.ShareOwnership} ShareOwnership
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ShareOwnership.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ShareOwnership message.
         * @function verify
         * @memberof websocket_api.ShareOwnership
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ShareOwnership.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.ofAccountId != null && message.hasOwnProperty("ofAccountId"))
                if (!$util.isInteger(message.ofAccountId) && !(message.ofAccountId && $util.isInteger(message.ofAccountId.low) && $util.isInteger(message.ofAccountId.high)))
                    return "ofAccountId: integer|Long expected";
            if (message.toAccountId != null && message.hasOwnProperty("toAccountId"))
                if (!$util.isInteger(message.toAccountId) && !(message.toAccountId && $util.isInteger(message.toAccountId.low) && $util.isInteger(message.toAccountId.high)))
                    return "toAccountId: integer|Long expected";
            return null;
        };

        /**
         * Creates a ShareOwnership message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.ShareOwnership
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.ShareOwnership} ShareOwnership
         */
        ShareOwnership.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.ShareOwnership)
                return object;
            var message = new $root.websocket_api.ShareOwnership();
            if (object.ofAccountId != null)
                if ($util.Long)
                    (message.ofAccountId = $util.Long.fromValue(object.ofAccountId)).unsigned = false;
                else if (typeof object.ofAccountId === "string")
                    message.ofAccountId = parseInt(object.ofAccountId, 10);
                else if (typeof object.ofAccountId === "number")
                    message.ofAccountId = object.ofAccountId;
                else if (typeof object.ofAccountId === "object")
                    message.ofAccountId = new $util.LongBits(object.ofAccountId.low >>> 0, object.ofAccountId.high >>> 0).toNumber();
            if (object.toAccountId != null)
                if ($util.Long)
                    (message.toAccountId = $util.Long.fromValue(object.toAccountId)).unsigned = false;
                else if (typeof object.toAccountId === "string")
                    message.toAccountId = parseInt(object.toAccountId, 10);
                else if (typeof object.toAccountId === "number")
                    message.toAccountId = object.toAccountId;
                else if (typeof object.toAccountId === "object")
                    message.toAccountId = new $util.LongBits(object.toAccountId.low >>> 0, object.toAccountId.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a ShareOwnership message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.ShareOwnership
         * @static
         * @param {websocket_api.ShareOwnership} message ShareOwnership
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ShareOwnership.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.ofAccountId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.ofAccountId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.toAccountId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.toAccountId = options.longs === String ? "0" : 0;
            }
            if (message.ofAccountId != null && message.hasOwnProperty("ofAccountId"))
                if (typeof message.ofAccountId === "number")
                    object.ofAccountId = options.longs === String ? String(message.ofAccountId) : message.ofAccountId;
                else
                    object.ofAccountId = options.longs === String ? $util.Long.prototype.toString.call(message.ofAccountId) : options.longs === Number ? new $util.LongBits(message.ofAccountId.low >>> 0, message.ofAccountId.high >>> 0).toNumber() : message.ofAccountId;
            if (message.toAccountId != null && message.hasOwnProperty("toAccountId"))
                if (typeof message.toAccountId === "number")
                    object.toAccountId = options.longs === String ? String(message.toAccountId) : message.toAccountId;
                else
                    object.toAccountId = options.longs === String ? $util.Long.prototype.toString.call(message.toAccountId) : options.longs === Number ? new $util.LongBits(message.toAccountId.low >>> 0, message.toAccountId.high >>> 0).toNumber() : message.toAccountId;
            return object;
        };

        /**
         * Converts this ShareOwnership to JSON.
         * @function toJSON
         * @memberof websocket_api.ShareOwnership
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ShareOwnership.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ShareOwnership
         * @function getTypeUrl
         * @memberof websocket_api.ShareOwnership
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ShareOwnership.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.ShareOwnership";
        };

        return ShareOwnership;
    })();

    websocket_api.MakeTransfer = (function() {

        /**
         * Properties of a MakeTransfer.
         * @memberof websocket_api
         * @interface IMakeTransfer
         * @property {number|Long|null} [fromAccountId] MakeTransfer fromAccountId
         * @property {number|Long|null} [toAccountId] MakeTransfer toAccountId
         * @property {number|null} [amount] MakeTransfer amount
         * @property {string|null} [note] MakeTransfer note
         */

        /**
         * Constructs a new MakeTransfer.
         * @memberof websocket_api
         * @classdesc Represents a MakeTransfer.
         * @implements IMakeTransfer
         * @constructor
         * @param {websocket_api.IMakeTransfer=} [properties] Properties to set
         */
        function MakeTransfer(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MakeTransfer fromAccountId.
         * @member {number|Long} fromAccountId
         * @memberof websocket_api.MakeTransfer
         * @instance
         */
        MakeTransfer.prototype.fromAccountId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * MakeTransfer toAccountId.
         * @member {number|Long} toAccountId
         * @memberof websocket_api.MakeTransfer
         * @instance
         */
        MakeTransfer.prototype.toAccountId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * MakeTransfer amount.
         * @member {number} amount
         * @memberof websocket_api.MakeTransfer
         * @instance
         */
        MakeTransfer.prototype.amount = 0;

        /**
         * MakeTransfer note.
         * @member {string} note
         * @memberof websocket_api.MakeTransfer
         * @instance
         */
        MakeTransfer.prototype.note = "";

        /**
         * Creates a new MakeTransfer instance using the specified properties.
         * @function create
         * @memberof websocket_api.MakeTransfer
         * @static
         * @param {websocket_api.IMakeTransfer=} [properties] Properties to set
         * @returns {websocket_api.MakeTransfer} MakeTransfer instance
         */
        MakeTransfer.create = function create(properties) {
            return new MakeTransfer(properties);
        };

        /**
         * Encodes the specified MakeTransfer message. Does not implicitly {@link websocket_api.MakeTransfer.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.MakeTransfer
         * @static
         * @param {websocket_api.IMakeTransfer} message MakeTransfer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MakeTransfer.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.fromAccountId != null && Object.hasOwnProperty.call(message, "fromAccountId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.fromAccountId);
            if (message.toAccountId != null && Object.hasOwnProperty.call(message, "toAccountId"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.toAccountId);
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 3, wireType 1 =*/25).double(message.amount);
            if (message.note != null && Object.hasOwnProperty.call(message, "note"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.note);
            return writer;
        };

        /**
         * Encodes the specified MakeTransfer message, length delimited. Does not implicitly {@link websocket_api.MakeTransfer.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.MakeTransfer
         * @static
         * @param {websocket_api.IMakeTransfer} message MakeTransfer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MakeTransfer.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MakeTransfer message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.MakeTransfer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.MakeTransfer} MakeTransfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MakeTransfer.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.MakeTransfer();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.fromAccountId = reader.int64();
                        break;
                    }
                case 2: {
                        message.toAccountId = reader.int64();
                        break;
                    }
                case 3: {
                        message.amount = reader.double();
                        break;
                    }
                case 4: {
                        message.note = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MakeTransfer message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.MakeTransfer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.MakeTransfer} MakeTransfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MakeTransfer.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MakeTransfer message.
         * @function verify
         * @memberof websocket_api.MakeTransfer
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MakeTransfer.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.fromAccountId != null && message.hasOwnProperty("fromAccountId"))
                if (!$util.isInteger(message.fromAccountId) && !(message.fromAccountId && $util.isInteger(message.fromAccountId.low) && $util.isInteger(message.fromAccountId.high)))
                    return "fromAccountId: integer|Long expected";
            if (message.toAccountId != null && message.hasOwnProperty("toAccountId"))
                if (!$util.isInteger(message.toAccountId) && !(message.toAccountId && $util.isInteger(message.toAccountId.low) && $util.isInteger(message.toAccountId.high)))
                    return "toAccountId: integer|Long expected";
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (typeof message.amount !== "number")
                    return "amount: number expected";
            if (message.note != null && message.hasOwnProperty("note"))
                if (!$util.isString(message.note))
                    return "note: string expected";
            return null;
        };

        /**
         * Creates a MakeTransfer message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.MakeTransfer
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.MakeTransfer} MakeTransfer
         */
        MakeTransfer.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.MakeTransfer)
                return object;
            var message = new $root.websocket_api.MakeTransfer();
            if (object.fromAccountId != null)
                if ($util.Long)
                    (message.fromAccountId = $util.Long.fromValue(object.fromAccountId)).unsigned = false;
                else if (typeof object.fromAccountId === "string")
                    message.fromAccountId = parseInt(object.fromAccountId, 10);
                else if (typeof object.fromAccountId === "number")
                    message.fromAccountId = object.fromAccountId;
                else if (typeof object.fromAccountId === "object")
                    message.fromAccountId = new $util.LongBits(object.fromAccountId.low >>> 0, object.fromAccountId.high >>> 0).toNumber();
            if (object.toAccountId != null)
                if ($util.Long)
                    (message.toAccountId = $util.Long.fromValue(object.toAccountId)).unsigned = false;
                else if (typeof object.toAccountId === "string")
                    message.toAccountId = parseInt(object.toAccountId, 10);
                else if (typeof object.toAccountId === "number")
                    message.toAccountId = object.toAccountId;
                else if (typeof object.toAccountId === "object")
                    message.toAccountId = new $util.LongBits(object.toAccountId.low >>> 0, object.toAccountId.high >>> 0).toNumber();
            if (object.amount != null)
                message.amount = Number(object.amount);
            if (object.note != null)
                message.note = String(object.note);
            return message;
        };

        /**
         * Creates a plain object from a MakeTransfer message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.MakeTransfer
         * @static
         * @param {websocket_api.MakeTransfer} message MakeTransfer
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MakeTransfer.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.fromAccountId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.fromAccountId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.toAccountId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.toAccountId = options.longs === String ? "0" : 0;
                object.amount = 0;
                object.note = "";
            }
            if (message.fromAccountId != null && message.hasOwnProperty("fromAccountId"))
                if (typeof message.fromAccountId === "number")
                    object.fromAccountId = options.longs === String ? String(message.fromAccountId) : message.fromAccountId;
                else
                    object.fromAccountId = options.longs === String ? $util.Long.prototype.toString.call(message.fromAccountId) : options.longs === Number ? new $util.LongBits(message.fromAccountId.low >>> 0, message.fromAccountId.high >>> 0).toNumber() : message.fromAccountId;
            if (message.toAccountId != null && message.hasOwnProperty("toAccountId"))
                if (typeof message.toAccountId === "number")
                    object.toAccountId = options.longs === String ? String(message.toAccountId) : message.toAccountId;
                else
                    object.toAccountId = options.longs === String ? $util.Long.prototype.toString.call(message.toAccountId) : options.longs === Number ? new $util.LongBits(message.toAccountId.low >>> 0, message.toAccountId.high >>> 0).toNumber() : message.toAccountId;
            if (message.amount != null && message.hasOwnProperty("amount"))
                object.amount = options.json && !isFinite(message.amount) ? String(message.amount) : message.amount;
            if (message.note != null && message.hasOwnProperty("note"))
                object.note = message.note;
            return object;
        };

        /**
         * Converts this MakeTransfer to JSON.
         * @function toJSON
         * @memberof websocket_api.MakeTransfer
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MakeTransfer.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MakeTransfer
         * @function getTypeUrl
         * @memberof websocket_api.MakeTransfer
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MakeTransfer.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.MakeTransfer";
        };

        return MakeTransfer;
    })();

    websocket_api.CreateMarket = (function() {

        /**
         * Properties of a CreateMarket.
         * @memberof websocket_api
         * @interface ICreateMarket
         * @property {string|null} [name] CreateMarket name
         * @property {string|null} [description] CreateMarket description
         * @property {number|null} [minSettlement] CreateMarket minSettlement
         * @property {number|null} [maxSettlement] CreateMarket maxSettlement
         * @property {Array.<number|Long>|null} [redeemableFor] CreateMarket redeemableFor
         */

        /**
         * Constructs a new CreateMarket.
         * @memberof websocket_api
         * @classdesc Represents a CreateMarket.
         * @implements ICreateMarket
         * @constructor
         * @param {websocket_api.ICreateMarket=} [properties] Properties to set
         */
        function CreateMarket(properties) {
            this.redeemableFor = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateMarket name.
         * @member {string} name
         * @memberof websocket_api.CreateMarket
         * @instance
         */
        CreateMarket.prototype.name = "";

        /**
         * CreateMarket description.
         * @member {string} description
         * @memberof websocket_api.CreateMarket
         * @instance
         */
        CreateMarket.prototype.description = "";

        /**
         * CreateMarket minSettlement.
         * @member {number} minSettlement
         * @memberof websocket_api.CreateMarket
         * @instance
         */
        CreateMarket.prototype.minSettlement = 0;

        /**
         * CreateMarket maxSettlement.
         * @member {number} maxSettlement
         * @memberof websocket_api.CreateMarket
         * @instance
         */
        CreateMarket.prototype.maxSettlement = 0;

        /**
         * CreateMarket redeemableFor.
         * @member {Array.<number|Long>} redeemableFor
         * @memberof websocket_api.CreateMarket
         * @instance
         */
        CreateMarket.prototype.redeemableFor = $util.emptyArray;

        /**
         * Creates a new CreateMarket instance using the specified properties.
         * @function create
         * @memberof websocket_api.CreateMarket
         * @static
         * @param {websocket_api.ICreateMarket=} [properties] Properties to set
         * @returns {websocket_api.CreateMarket} CreateMarket instance
         */
        CreateMarket.create = function create(properties) {
            return new CreateMarket(properties);
        };

        /**
         * Encodes the specified CreateMarket message. Does not implicitly {@link websocket_api.CreateMarket.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.CreateMarket
         * @static
         * @param {websocket_api.ICreateMarket} message CreateMarket message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateMarket.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.description != null && Object.hasOwnProperty.call(message, "description"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.description);
            if (message.minSettlement != null && Object.hasOwnProperty.call(message, "minSettlement"))
                writer.uint32(/* id 3, wireType 1 =*/25).double(message.minSettlement);
            if (message.maxSettlement != null && Object.hasOwnProperty.call(message, "maxSettlement"))
                writer.uint32(/* id 4, wireType 1 =*/33).double(message.maxSettlement);
            if (message.redeemableFor != null && message.redeemableFor.length) {
                writer.uint32(/* id 5, wireType 2 =*/42).fork();
                for (var i = 0; i < message.redeemableFor.length; ++i)
                    writer.int64(message.redeemableFor[i]);
                writer.ldelim();
            }
            return writer;
        };

        /**
         * Encodes the specified CreateMarket message, length delimited. Does not implicitly {@link websocket_api.CreateMarket.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.CreateMarket
         * @static
         * @param {websocket_api.ICreateMarket} message CreateMarket message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateMarket.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateMarket message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.CreateMarket
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.CreateMarket} CreateMarket
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateMarket.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.CreateMarket();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.name = reader.string();
                        break;
                    }
                case 2: {
                        message.description = reader.string();
                        break;
                    }
                case 3: {
                        message.minSettlement = reader.double();
                        break;
                    }
                case 4: {
                        message.maxSettlement = reader.double();
                        break;
                    }
                case 5: {
                        if (!(message.redeemableFor && message.redeemableFor.length))
                            message.redeemableFor = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.redeemableFor.push(reader.int64());
                        } else
                            message.redeemableFor.push(reader.int64());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CreateMarket message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.CreateMarket
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.CreateMarket} CreateMarket
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateMarket.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateMarket message.
         * @function verify
         * @memberof websocket_api.CreateMarket
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateMarket.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.description != null && message.hasOwnProperty("description"))
                if (!$util.isString(message.description))
                    return "description: string expected";
            if (message.minSettlement != null && message.hasOwnProperty("minSettlement"))
                if (typeof message.minSettlement !== "number")
                    return "minSettlement: number expected";
            if (message.maxSettlement != null && message.hasOwnProperty("maxSettlement"))
                if (typeof message.maxSettlement !== "number")
                    return "maxSettlement: number expected";
            if (message.redeemableFor != null && message.hasOwnProperty("redeemableFor")) {
                if (!Array.isArray(message.redeemableFor))
                    return "redeemableFor: array expected";
                for (var i = 0; i < message.redeemableFor.length; ++i)
                    if (!$util.isInteger(message.redeemableFor[i]) && !(message.redeemableFor[i] && $util.isInteger(message.redeemableFor[i].low) && $util.isInteger(message.redeemableFor[i].high)))
                        return "redeemableFor: integer|Long[] expected";
            }
            return null;
        };

        /**
         * Creates a CreateMarket message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.CreateMarket
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.CreateMarket} CreateMarket
         */
        CreateMarket.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.CreateMarket)
                return object;
            var message = new $root.websocket_api.CreateMarket();
            if (object.name != null)
                message.name = String(object.name);
            if (object.description != null)
                message.description = String(object.description);
            if (object.minSettlement != null)
                message.minSettlement = Number(object.minSettlement);
            if (object.maxSettlement != null)
                message.maxSettlement = Number(object.maxSettlement);
            if (object.redeemableFor) {
                if (!Array.isArray(object.redeemableFor))
                    throw TypeError(".websocket_api.CreateMarket.redeemableFor: array expected");
                message.redeemableFor = [];
                for (var i = 0; i < object.redeemableFor.length; ++i)
                    if ($util.Long)
                        (message.redeemableFor[i] = $util.Long.fromValue(object.redeemableFor[i])).unsigned = false;
                    else if (typeof object.redeemableFor[i] === "string")
                        message.redeemableFor[i] = parseInt(object.redeemableFor[i], 10);
                    else if (typeof object.redeemableFor[i] === "number")
                        message.redeemableFor[i] = object.redeemableFor[i];
                    else if (typeof object.redeemableFor[i] === "object")
                        message.redeemableFor[i] = new $util.LongBits(object.redeemableFor[i].low >>> 0, object.redeemableFor[i].high >>> 0).toNumber();
            }
            return message;
        };

        /**
         * Creates a plain object from a CreateMarket message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.CreateMarket
         * @static
         * @param {websocket_api.CreateMarket} message CreateMarket
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateMarket.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.redeemableFor = [];
            if (options.defaults) {
                object.name = "";
                object.description = "";
                object.minSettlement = 0;
                object.maxSettlement = 0;
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.description != null && message.hasOwnProperty("description"))
                object.description = message.description;
            if (message.minSettlement != null && message.hasOwnProperty("minSettlement"))
                object.minSettlement = options.json && !isFinite(message.minSettlement) ? String(message.minSettlement) : message.minSettlement;
            if (message.maxSettlement != null && message.hasOwnProperty("maxSettlement"))
                object.maxSettlement = options.json && !isFinite(message.maxSettlement) ? String(message.maxSettlement) : message.maxSettlement;
            if (message.redeemableFor && message.redeemableFor.length) {
                object.redeemableFor = [];
                for (var j = 0; j < message.redeemableFor.length; ++j)
                    if (typeof message.redeemableFor[j] === "number")
                        object.redeemableFor[j] = options.longs === String ? String(message.redeemableFor[j]) : message.redeemableFor[j];
                    else
                        object.redeemableFor[j] = options.longs === String ? $util.Long.prototype.toString.call(message.redeemableFor[j]) : options.longs === Number ? new $util.LongBits(message.redeemableFor[j].low >>> 0, message.redeemableFor[j].high >>> 0).toNumber() : message.redeemableFor[j];
            }
            return object;
        };

        /**
         * Converts this CreateMarket to JSON.
         * @function toJSON
         * @memberof websocket_api.CreateMarket
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateMarket.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateMarket
         * @function getTypeUrl
         * @memberof websocket_api.CreateMarket
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateMarket.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.CreateMarket";
        };

        return CreateMarket;
    })();

    websocket_api.SettleMarket = (function() {

        /**
         * Properties of a SettleMarket.
         * @memberof websocket_api
         * @interface ISettleMarket
         * @property {number|Long|null} [marketId] SettleMarket marketId
         * @property {number|null} [settlePrice] SettleMarket settlePrice
         */

        /**
         * Constructs a new SettleMarket.
         * @memberof websocket_api
         * @classdesc Represents a SettleMarket.
         * @implements ISettleMarket
         * @constructor
         * @param {websocket_api.ISettleMarket=} [properties] Properties to set
         */
        function SettleMarket(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SettleMarket marketId.
         * @member {number|Long} marketId
         * @memberof websocket_api.SettleMarket
         * @instance
         */
        SettleMarket.prototype.marketId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * SettleMarket settlePrice.
         * @member {number} settlePrice
         * @memberof websocket_api.SettleMarket
         * @instance
         */
        SettleMarket.prototype.settlePrice = 0;

        /**
         * Creates a new SettleMarket instance using the specified properties.
         * @function create
         * @memberof websocket_api.SettleMarket
         * @static
         * @param {websocket_api.ISettleMarket=} [properties] Properties to set
         * @returns {websocket_api.SettleMarket} SettleMarket instance
         */
        SettleMarket.create = function create(properties) {
            return new SettleMarket(properties);
        };

        /**
         * Encodes the specified SettleMarket message. Does not implicitly {@link websocket_api.SettleMarket.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.SettleMarket
         * @static
         * @param {websocket_api.ISettleMarket} message SettleMarket message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SettleMarket.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.marketId != null && Object.hasOwnProperty.call(message, "marketId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.marketId);
            if (message.settlePrice != null && Object.hasOwnProperty.call(message, "settlePrice"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.settlePrice);
            return writer;
        };

        /**
         * Encodes the specified SettleMarket message, length delimited. Does not implicitly {@link websocket_api.SettleMarket.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.SettleMarket
         * @static
         * @param {websocket_api.ISettleMarket} message SettleMarket message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SettleMarket.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SettleMarket message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.SettleMarket
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.SettleMarket} SettleMarket
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SettleMarket.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.SettleMarket();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.marketId = reader.int64();
                        break;
                    }
                case 2: {
                        message.settlePrice = reader.double();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SettleMarket message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.SettleMarket
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.SettleMarket} SettleMarket
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SettleMarket.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SettleMarket message.
         * @function verify
         * @memberof websocket_api.SettleMarket
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SettleMarket.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (!$util.isInteger(message.marketId) && !(message.marketId && $util.isInteger(message.marketId.low) && $util.isInteger(message.marketId.high)))
                    return "marketId: integer|Long expected";
            if (message.settlePrice != null && message.hasOwnProperty("settlePrice"))
                if (typeof message.settlePrice !== "number")
                    return "settlePrice: number expected";
            return null;
        };

        /**
         * Creates a SettleMarket message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.SettleMarket
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.SettleMarket} SettleMarket
         */
        SettleMarket.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.SettleMarket)
                return object;
            var message = new $root.websocket_api.SettleMarket();
            if (object.marketId != null)
                if ($util.Long)
                    (message.marketId = $util.Long.fromValue(object.marketId)).unsigned = false;
                else if (typeof object.marketId === "string")
                    message.marketId = parseInt(object.marketId, 10);
                else if (typeof object.marketId === "number")
                    message.marketId = object.marketId;
                else if (typeof object.marketId === "object")
                    message.marketId = new $util.LongBits(object.marketId.low >>> 0, object.marketId.high >>> 0).toNumber();
            if (object.settlePrice != null)
                message.settlePrice = Number(object.settlePrice);
            return message;
        };

        /**
         * Creates a plain object from a SettleMarket message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.SettleMarket
         * @static
         * @param {websocket_api.SettleMarket} message SettleMarket
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SettleMarket.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.marketId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.marketId = options.longs === String ? "0" : 0;
                object.settlePrice = 0;
            }
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (typeof message.marketId === "number")
                    object.marketId = options.longs === String ? String(message.marketId) : message.marketId;
                else
                    object.marketId = options.longs === String ? $util.Long.prototype.toString.call(message.marketId) : options.longs === Number ? new $util.LongBits(message.marketId.low >>> 0, message.marketId.high >>> 0).toNumber() : message.marketId;
            if (message.settlePrice != null && message.hasOwnProperty("settlePrice"))
                object.settlePrice = options.json && !isFinite(message.settlePrice) ? String(message.settlePrice) : message.settlePrice;
            return object;
        };

        /**
         * Converts this SettleMarket to JSON.
         * @function toJSON
         * @memberof websocket_api.SettleMarket
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SettleMarket.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for SettleMarket
         * @function getTypeUrl
         * @memberof websocket_api.SettleMarket
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        SettleMarket.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.SettleMarket";
        };

        return SettleMarket;
    })();

    websocket_api.CreateOrder = (function() {

        /**
         * Properties of a CreateOrder.
         * @memberof websocket_api
         * @interface ICreateOrder
         * @property {number|Long|null} [marketId] CreateOrder marketId
         * @property {number|null} [price] CreateOrder price
         * @property {number|null} [size] CreateOrder size
         * @property {websocket_api.Side|null} [side] CreateOrder side
         */

        /**
         * Constructs a new CreateOrder.
         * @memberof websocket_api
         * @classdesc Represents a CreateOrder.
         * @implements ICreateOrder
         * @constructor
         * @param {websocket_api.ICreateOrder=} [properties] Properties to set
         */
        function CreateOrder(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateOrder marketId.
         * @member {number|Long} marketId
         * @memberof websocket_api.CreateOrder
         * @instance
         */
        CreateOrder.prototype.marketId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * CreateOrder price.
         * @member {number} price
         * @memberof websocket_api.CreateOrder
         * @instance
         */
        CreateOrder.prototype.price = 0;

        /**
         * CreateOrder size.
         * @member {number} size
         * @memberof websocket_api.CreateOrder
         * @instance
         */
        CreateOrder.prototype.size = 0;

        /**
         * CreateOrder side.
         * @member {websocket_api.Side} side
         * @memberof websocket_api.CreateOrder
         * @instance
         */
        CreateOrder.prototype.side = 0;

        /**
         * Creates a new CreateOrder instance using the specified properties.
         * @function create
         * @memberof websocket_api.CreateOrder
         * @static
         * @param {websocket_api.ICreateOrder=} [properties] Properties to set
         * @returns {websocket_api.CreateOrder} CreateOrder instance
         */
        CreateOrder.create = function create(properties) {
            return new CreateOrder(properties);
        };

        /**
         * Encodes the specified CreateOrder message. Does not implicitly {@link websocket_api.CreateOrder.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.CreateOrder
         * @static
         * @param {websocket_api.ICreateOrder} message CreateOrder message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateOrder.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.marketId != null && Object.hasOwnProperty.call(message, "marketId"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.marketId);
            if (message.price != null && Object.hasOwnProperty.call(message, "price"))
                writer.uint32(/* id 5, wireType 1 =*/41).double(message.price);
            if (message.size != null && Object.hasOwnProperty.call(message, "size"))
                writer.uint32(/* id 6, wireType 1 =*/49).double(message.size);
            if (message.side != null && Object.hasOwnProperty.call(message, "side"))
                writer.uint32(/* id 7, wireType 0 =*/56).int32(message.side);
            return writer;
        };

        /**
         * Encodes the specified CreateOrder message, length delimited. Does not implicitly {@link websocket_api.CreateOrder.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.CreateOrder
         * @static
         * @param {websocket_api.ICreateOrder} message CreateOrder message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateOrder.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateOrder message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.CreateOrder
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.CreateOrder} CreateOrder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateOrder.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.CreateOrder();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 2: {
                        message.marketId = reader.int64();
                        break;
                    }
                case 5: {
                        message.price = reader.double();
                        break;
                    }
                case 6: {
                        message.size = reader.double();
                        break;
                    }
                case 7: {
                        message.side = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CreateOrder message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.CreateOrder
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.CreateOrder} CreateOrder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateOrder.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateOrder message.
         * @function verify
         * @memberof websocket_api.CreateOrder
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateOrder.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (!$util.isInteger(message.marketId) && !(message.marketId && $util.isInteger(message.marketId.low) && $util.isInteger(message.marketId.high)))
                    return "marketId: integer|Long expected";
            if (message.price != null && message.hasOwnProperty("price"))
                if (typeof message.price !== "number")
                    return "price: number expected";
            if (message.size != null && message.hasOwnProperty("size"))
                if (typeof message.size !== "number")
                    return "size: number expected";
            if (message.side != null && message.hasOwnProperty("side"))
                switch (message.side) {
                default:
                    return "side: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            return null;
        };

        /**
         * Creates a CreateOrder message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.CreateOrder
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.CreateOrder} CreateOrder
         */
        CreateOrder.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.CreateOrder)
                return object;
            var message = new $root.websocket_api.CreateOrder();
            if (object.marketId != null)
                if ($util.Long)
                    (message.marketId = $util.Long.fromValue(object.marketId)).unsigned = false;
                else if (typeof object.marketId === "string")
                    message.marketId = parseInt(object.marketId, 10);
                else if (typeof object.marketId === "number")
                    message.marketId = object.marketId;
                else if (typeof object.marketId === "object")
                    message.marketId = new $util.LongBits(object.marketId.low >>> 0, object.marketId.high >>> 0).toNumber();
            if (object.price != null)
                message.price = Number(object.price);
            if (object.size != null)
                message.size = Number(object.size);
            switch (object.side) {
            default:
                if (typeof object.side === "number") {
                    message.side = object.side;
                    break;
                }
                break;
            case "UNKNOWN":
            case 0:
                message.side = 0;
                break;
            case "BID":
            case 1:
                message.side = 1;
                break;
            case "OFFER":
            case 2:
                message.side = 2;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from a CreateOrder message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.CreateOrder
         * @static
         * @param {websocket_api.CreateOrder} message CreateOrder
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateOrder.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.marketId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.marketId = options.longs === String ? "0" : 0;
                object.price = 0;
                object.size = 0;
                object.side = options.enums === String ? "UNKNOWN" : 0;
            }
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (typeof message.marketId === "number")
                    object.marketId = options.longs === String ? String(message.marketId) : message.marketId;
                else
                    object.marketId = options.longs === String ? $util.Long.prototype.toString.call(message.marketId) : options.longs === Number ? new $util.LongBits(message.marketId.low >>> 0, message.marketId.high >>> 0).toNumber() : message.marketId;
            if (message.price != null && message.hasOwnProperty("price"))
                object.price = options.json && !isFinite(message.price) ? String(message.price) : message.price;
            if (message.size != null && message.hasOwnProperty("size"))
                object.size = options.json && !isFinite(message.size) ? String(message.size) : message.size;
            if (message.side != null && message.hasOwnProperty("side"))
                object.side = options.enums === String ? $root.websocket_api.Side[message.side] === undefined ? message.side : $root.websocket_api.Side[message.side] : message.side;
            return object;
        };

        /**
         * Converts this CreateOrder to JSON.
         * @function toJSON
         * @memberof websocket_api.CreateOrder
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateOrder.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateOrder
         * @function getTypeUrl
         * @memberof websocket_api.CreateOrder
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateOrder.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.CreateOrder";
        };

        return CreateOrder;
    })();

    return websocket_api;
})();

$root.google = (function() {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    var google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        var protobuf = {};

        protobuf.Timestamp = (function() {

            /**
             * Properties of a Timestamp.
             * @memberof google.protobuf
             * @interface ITimestamp
             * @property {number|Long|null} [seconds] Timestamp seconds
             * @property {number|null} [nanos] Timestamp nanos
             */

            /**
             * Constructs a new Timestamp.
             * @memberof google.protobuf
             * @classdesc Represents a Timestamp.
             * @implements ITimestamp
             * @constructor
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             */
            function Timestamp(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Timestamp seconds.
             * @member {number|Long} seconds
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.seconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Timestamp nanos.
             * @member {number} nanos
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.nanos = 0;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             * @returns {google.protobuf.Timestamp} Timestamp instance
             */
            Timestamp.create = function create(properties) {
                return new Timestamp(properties);
            };

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.seconds != null && Object.hasOwnProperty.call(message, "seconds"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.seconds);
                if (message.nanos != null && Object.hasOwnProperty.call(message, "nanos"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.nanos);
                return writer;
            };

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Timestamp();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.seconds = reader.int64();
                            break;
                        }
                    case 2: {
                            message.nanos = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Timestamp message.
             * @function verify
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Timestamp.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (!$util.isInteger(message.seconds) && !(message.seconds && $util.isInteger(message.seconds.low) && $util.isInteger(message.seconds.high)))
                        return "seconds: integer|Long expected";
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    if (!$util.isInteger(message.nanos))
                        return "nanos: integer expected";
                return null;
            };

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Timestamp} Timestamp
             */
            Timestamp.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Timestamp)
                    return object;
                var message = new $root.google.protobuf.Timestamp();
                if (object.seconds != null)
                    if ($util.Long)
                        (message.seconds = $util.Long.fromValue(object.seconds)).unsigned = false;
                    else if (typeof object.seconds === "string")
                        message.seconds = parseInt(object.seconds, 10);
                    else if (typeof object.seconds === "number")
                        message.seconds = object.seconds;
                    else if (typeof object.seconds === "object")
                        message.seconds = new $util.LongBits(object.seconds.low >>> 0, object.seconds.high >>> 0).toNumber();
                if (object.nanos != null)
                    message.nanos = object.nanos | 0;
                return message;
            };

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.Timestamp} message Timestamp
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Timestamp.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.seconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seconds = options.longs === String ? "0" : 0;
                    object.nanos = 0;
                }
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (typeof message.seconds === "number")
                        object.seconds = options.longs === String ? String(message.seconds) : message.seconds;
                    else
                        object.seconds = options.longs === String ? $util.Long.prototype.toString.call(message.seconds) : options.longs === Number ? new $util.LongBits(message.seconds.low >>> 0, message.seconds.high >>> 0).toNumber() : message.seconds;
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    object.nanos = message.nanos;
                return object;
            };

            /**
             * Converts this Timestamp to JSON.
             * @function toJSON
             * @memberof google.protobuf.Timestamp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Timestamp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Timestamp
             * @function getTypeUrl
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Timestamp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Timestamp";
            };

            return Timestamp;
        })();

        return protobuf;
    })();

    return google;
})();

module.exports = $root;
