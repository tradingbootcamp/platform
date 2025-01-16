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
         * @property {websocket_api.IPortfolio|null} [portfolio] ServerMessage portfolio
         * @property {websocket_api.IMarket|null} [market] ServerMessage market
         * @property {websocket_api.IMarketSettled|null} [marketSettled] ServerMessage marketSettled
         * @property {websocket_api.IOrderCreated|null} [orderCreated] ServerMessage orderCreated
         * @property {websocket_api.IOrdersCancelled|null} [ordersCancelled] ServerMessage ordersCancelled
         * @property {websocket_api.IPayments|null} [payments] ServerMessage payments
         * @property {websocket_api.IPayment|null} [paymentCreated] ServerMessage paymentCreated
         * @property {websocket_api.IOut|null} [out] ServerMessage out
         * @property {websocket_api.IAuthenticated|null} [authenticated] ServerMessage authenticated
         * @property {websocket_api.IRequestFailed|null} [requestFailed] ServerMessage requestFailed
         * @property {websocket_api.IUser|null} [userCreated] ServerMessage userCreated
         * @property {websocket_api.IUsers|null} [users] ServerMessage users
         * @property {websocket_api.IActingAs|null} [actingAs] ServerMessage actingAs
         * @property {websocket_api.IOwnership|null} [ownershipReceived] ServerMessage ownershipReceived
         * @property {websocket_api.IOwnerships|null} [ownerships] ServerMessage ownerships
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
         * ServerMessage portfolio.
         * @member {websocket_api.IPortfolio|null|undefined} portfolio
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.portfolio = null;

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
         * ServerMessage payments.
         * @member {websocket_api.IPayments|null|undefined} payments
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.payments = null;

        /**
         * ServerMessage paymentCreated.
         * @member {websocket_api.IPayment|null|undefined} paymentCreated
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.paymentCreated = null;

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
         * ServerMessage userCreated.
         * @member {websocket_api.IUser|null|undefined} userCreated
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.userCreated = null;

        /**
         * ServerMessage users.
         * @member {websocket_api.IUsers|null|undefined} users
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.users = null;

        /**
         * ServerMessage actingAs.
         * @member {websocket_api.IActingAs|null|undefined} actingAs
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.actingAs = null;

        /**
         * ServerMessage ownershipReceived.
         * @member {websocket_api.IOwnership|null|undefined} ownershipReceived
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.ownershipReceived = null;

        /**
         * ServerMessage ownerships.
         * @member {websocket_api.IOwnerships|null|undefined} ownerships
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        ServerMessage.prototype.ownerships = null;

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
         * @member {"portfolio"|"market"|"marketSettled"|"orderCreated"|"ordersCancelled"|"payments"|"paymentCreated"|"out"|"authenticated"|"requestFailed"|"userCreated"|"users"|"actingAs"|"ownershipReceived"|"ownerships"|"ownershipGiven"|"redeemed"|"orders"|"trades"|"transactions"|undefined} message
         * @memberof websocket_api.ServerMessage
         * @instance
         */
        Object.defineProperty(ServerMessage.prototype, "message", {
            get: $util.oneOfGetter($oneOfFields = ["portfolio", "market", "marketSettled", "orderCreated", "ordersCancelled", "payments", "paymentCreated", "out", "authenticated", "requestFailed", "userCreated", "users", "actingAs", "ownershipReceived", "ownerships", "ownershipGiven", "redeemed", "orders", "trades", "transactions"]),
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
            if (message.portfolio != null && Object.hasOwnProperty.call(message, "portfolio"))
                $root.websocket_api.Portfolio.encode(message.portfolio, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.market != null && Object.hasOwnProperty.call(message, "market"))
                $root.websocket_api.Market.encode(message.market, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.marketSettled != null && Object.hasOwnProperty.call(message, "marketSettled"))
                $root.websocket_api.MarketSettled.encode(message.marketSettled, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.orderCreated != null && Object.hasOwnProperty.call(message, "orderCreated"))
                $root.websocket_api.OrderCreated.encode(message.orderCreated, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.ordersCancelled != null && Object.hasOwnProperty.call(message, "ordersCancelled"))
                $root.websocket_api.OrdersCancelled.encode(message.ordersCancelled, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.payments != null && Object.hasOwnProperty.call(message, "payments"))
                $root.websocket_api.Payments.encode(message.payments, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.paymentCreated != null && Object.hasOwnProperty.call(message, "paymentCreated"))
                $root.websocket_api.Payment.encode(message.paymentCreated, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.out != null && Object.hasOwnProperty.call(message, "out"))
                $root.websocket_api.Out.encode(message.out, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.authenticated != null && Object.hasOwnProperty.call(message, "authenticated"))
                $root.websocket_api.Authenticated.encode(message.authenticated, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            if (message.requestFailed != null && Object.hasOwnProperty.call(message, "requestFailed"))
                $root.websocket_api.RequestFailed.encode(message.requestFailed, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
            if (message.userCreated != null && Object.hasOwnProperty.call(message, "userCreated"))
                $root.websocket_api.User.encode(message.userCreated, writer.uint32(/* id 12, wireType 2 =*/98).fork()).ldelim();
            if (message.users != null && Object.hasOwnProperty.call(message, "users"))
                $root.websocket_api.Users.encode(message.users, writer.uint32(/* id 13, wireType 2 =*/106).fork()).ldelim();
            if (message.actingAs != null && Object.hasOwnProperty.call(message, "actingAs"))
                $root.websocket_api.ActingAs.encode(message.actingAs, writer.uint32(/* id 14, wireType 2 =*/114).fork()).ldelim();
            if (message.ownershipReceived != null && Object.hasOwnProperty.call(message, "ownershipReceived"))
                $root.websocket_api.Ownership.encode(message.ownershipReceived, writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
            if (message.ownerships != null && Object.hasOwnProperty.call(message, "ownerships"))
                $root.websocket_api.Ownerships.encode(message.ownerships, writer.uint32(/* id 16, wireType 2 =*/130).fork()).ldelim();
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
                        message.portfolio = $root.websocket_api.Portfolio.decode(reader, reader.uint32());
                        break;
                    }
                case 2: {
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
                        message.payments = $root.websocket_api.Payments.decode(reader, reader.uint32());
                        break;
                    }
                case 8: {
                        message.paymentCreated = $root.websocket_api.Payment.decode(reader, reader.uint32());
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
                        message.userCreated = $root.websocket_api.User.decode(reader, reader.uint32());
                        break;
                    }
                case 13: {
                        message.users = $root.websocket_api.Users.decode(reader, reader.uint32());
                        break;
                    }
                case 14: {
                        message.actingAs = $root.websocket_api.ActingAs.decode(reader, reader.uint32());
                        break;
                    }
                case 15: {
                        message.ownershipReceived = $root.websocket_api.Ownership.decode(reader, reader.uint32());
                        break;
                    }
                case 16: {
                        message.ownerships = $root.websocket_api.Ownerships.decode(reader, reader.uint32());
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
            if (message.portfolio != null && message.hasOwnProperty("portfolio")) {
                properties.message = 1;
                {
                    var error = $root.websocket_api.Portfolio.verify(message.portfolio);
                    if (error)
                        return "portfolio." + error;
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
            if (message.payments != null && message.hasOwnProperty("payments")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Payments.verify(message.payments);
                    if (error)
                        return "payments." + error;
                }
            }
            if (message.paymentCreated != null && message.hasOwnProperty("paymentCreated")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Payment.verify(message.paymentCreated);
                    if (error)
                        return "paymentCreated." + error;
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
            if (message.userCreated != null && message.hasOwnProperty("userCreated")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.User.verify(message.userCreated);
                    if (error)
                        return "userCreated." + error;
                }
            }
            if (message.users != null && message.hasOwnProperty("users")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Users.verify(message.users);
                    if (error)
                        return "users." + error;
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
            if (message.ownershipReceived != null && message.hasOwnProperty("ownershipReceived")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Ownership.verify(message.ownershipReceived);
                    if (error)
                        return "ownershipReceived." + error;
                }
            }
            if (message.ownerships != null && message.hasOwnProperty("ownerships")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.Ownerships.verify(message.ownerships);
                    if (error)
                        return "ownerships." + error;
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
            if (object.portfolio != null) {
                if (typeof object.portfolio !== "object")
                    throw TypeError(".websocket_api.ServerMessage.portfolio: object expected");
                message.portfolio = $root.websocket_api.Portfolio.fromObject(object.portfolio);
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
            if (object.payments != null) {
                if (typeof object.payments !== "object")
                    throw TypeError(".websocket_api.ServerMessage.payments: object expected");
                message.payments = $root.websocket_api.Payments.fromObject(object.payments);
            }
            if (object.paymentCreated != null) {
                if (typeof object.paymentCreated !== "object")
                    throw TypeError(".websocket_api.ServerMessage.paymentCreated: object expected");
                message.paymentCreated = $root.websocket_api.Payment.fromObject(object.paymentCreated);
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
            if (object.userCreated != null) {
                if (typeof object.userCreated !== "object")
                    throw TypeError(".websocket_api.ServerMessage.userCreated: object expected");
                message.userCreated = $root.websocket_api.User.fromObject(object.userCreated);
            }
            if (object.users != null) {
                if (typeof object.users !== "object")
                    throw TypeError(".websocket_api.ServerMessage.users: object expected");
                message.users = $root.websocket_api.Users.fromObject(object.users);
            }
            if (object.actingAs != null) {
                if (typeof object.actingAs !== "object")
                    throw TypeError(".websocket_api.ServerMessage.actingAs: object expected");
                message.actingAs = $root.websocket_api.ActingAs.fromObject(object.actingAs);
            }
            if (object.ownershipReceived != null) {
                if (typeof object.ownershipReceived !== "object")
                    throw TypeError(".websocket_api.ServerMessage.ownershipReceived: object expected");
                message.ownershipReceived = $root.websocket_api.Ownership.fromObject(object.ownershipReceived);
            }
            if (object.ownerships != null) {
                if (typeof object.ownerships !== "object")
                    throw TypeError(".websocket_api.ServerMessage.ownerships: object expected");
                message.ownerships = $root.websocket_api.Ownerships.fromObject(object.ownerships);
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
            if (message.portfolio != null && message.hasOwnProperty("portfolio")) {
                object.portfolio = $root.websocket_api.Portfolio.toObject(message.portfolio, options);
                if (options.oneofs)
                    object.message = "portfolio";
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
            if (message.payments != null && message.hasOwnProperty("payments")) {
                object.payments = $root.websocket_api.Payments.toObject(message.payments, options);
                if (options.oneofs)
                    object.message = "payments";
            }
            if (message.paymentCreated != null && message.hasOwnProperty("paymentCreated")) {
                object.paymentCreated = $root.websocket_api.Payment.toObject(message.paymentCreated, options);
                if (options.oneofs)
                    object.message = "paymentCreated";
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
            if (message.userCreated != null && message.hasOwnProperty("userCreated")) {
                object.userCreated = $root.websocket_api.User.toObject(message.userCreated, options);
                if (options.oneofs)
                    object.message = "userCreated";
            }
            if (message.users != null && message.hasOwnProperty("users")) {
                object.users = $root.websocket_api.Users.toObject(message.users, options);
                if (options.oneofs)
                    object.message = "users";
            }
            if (message.actingAs != null && message.hasOwnProperty("actingAs")) {
                object.actingAs = $root.websocket_api.ActingAs.toObject(message.actingAs, options);
                if (options.oneofs)
                    object.message = "actingAs";
            }
            if (message.ownershipReceived != null && message.hasOwnProperty("ownershipReceived")) {
                object.ownershipReceived = $root.websocket_api.Ownership.toObject(message.ownershipReceived, options);
                if (options.oneofs)
                    object.message = "ownershipReceived";
            }
            if (message.ownerships != null && message.hasOwnProperty("ownerships")) {
                object.ownerships = $root.websocket_api.Ownerships.toObject(message.ownerships, options);
                if (options.oneofs)
                    object.message = "ownerships";
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
         * @property {number|Long|null} [userId] Authenticated userId
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
         * Authenticated userId.
         * @member {number|Long} userId
         * @memberof websocket_api.Authenticated
         * @instance
         */
        Authenticated.prototype.userId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

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
            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.userId);
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
                        message.userId = reader.int64();
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
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (!$util.isInteger(message.userId) && !(message.userId && $util.isInteger(message.userId.low) && $util.isInteger(message.userId.high)))
                    return "userId: integer|Long expected";
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
            if (object.userId != null)
                if ($util.Long)
                    (message.userId = $util.Long.fromValue(object.userId)).unsigned = false;
                else if (typeof object.userId === "string")
                    message.userId = parseInt(object.userId, 10);
                else if (typeof object.userId === "number")
                    message.userId = object.userId;
                else if (typeof object.userId === "object")
                    message.userId = new $util.LongBits(object.userId.low >>> 0, object.userId.high >>> 0).toNumber();
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
                    object.userId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.userId = options.longs === String ? "0" : 0;
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (typeof message.userId === "number")
                    object.userId = options.longs === String ? String(message.userId) : message.userId;
                else
                    object.userId = options.longs === String ? $util.Long.prototype.toString.call(message.userId) : options.longs === Number ? new $util.LongBits(message.userId.low >>> 0, message.userId.high >>> 0).toNumber() : message.userId;
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
         * @property {number|Long|null} [userId] ActingAs userId
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
         * ActingAs userId.
         * @member {number|Long} userId
         * @memberof websocket_api.ActingAs
         * @instance
         */
        ActingAs.prototype.userId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

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
            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.userId);
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
                case 2: {
                        message.userId = reader.int64();
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
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (!$util.isInteger(message.userId) && !(message.userId && $util.isInteger(message.userId.low) && $util.isInteger(message.userId.high)))
                    return "userId: integer|Long expected";
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
            if (object.userId != null)
                if ($util.Long)
                    (message.userId = $util.Long.fromValue(object.userId)).unsigned = false;
                else if (typeof object.userId === "string")
                    message.userId = parseInt(object.userId, 10);
                else if (typeof object.userId === "number")
                    message.userId = object.userId;
                else if (typeof object.userId === "object")
                    message.userId = new $util.LongBits(object.userId.low >>> 0, object.userId.high >>> 0).toNumber();
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
                    object.userId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.userId = options.longs === String ? "0" : 0;
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (typeof message.userId === "number")
                    object.userId = options.longs === String ? String(message.userId) : message.userId;
                else
                    object.userId = options.longs === String ? $util.Long.prototype.toString.call(message.userId) : options.longs === Number ? new $util.LongBits(message.userId.low >>> 0, message.userId.high >>> 0).toNumber() : message.userId;
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

    websocket_api.Ownership = (function() {

        /**
         * Properties of an Ownership.
         * @memberof websocket_api
         * @interface IOwnership
         * @property {number|Long|null} [ofBotId] Ownership ofBotId
         */

        /**
         * Constructs a new Ownership.
         * @memberof websocket_api
         * @classdesc Represents an Ownership.
         * @implements IOwnership
         * @constructor
         * @param {websocket_api.IOwnership=} [properties] Properties to set
         */
        function Ownership(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Ownership ofBotId.
         * @member {number|Long} ofBotId
         * @memberof websocket_api.Ownership
         * @instance
         */
        Ownership.prototype.ofBotId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new Ownership instance using the specified properties.
         * @function create
         * @memberof websocket_api.Ownership
         * @static
         * @param {websocket_api.IOwnership=} [properties] Properties to set
         * @returns {websocket_api.Ownership} Ownership instance
         */
        Ownership.create = function create(properties) {
            return new Ownership(properties);
        };

        /**
         * Encodes the specified Ownership message. Does not implicitly {@link websocket_api.Ownership.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Ownership
         * @static
         * @param {websocket_api.IOwnership} message Ownership message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Ownership.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ofBotId != null && Object.hasOwnProperty.call(message, "ofBotId"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.ofBotId);
            return writer;
        };

        /**
         * Encodes the specified Ownership message, length delimited. Does not implicitly {@link websocket_api.Ownership.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Ownership
         * @static
         * @param {websocket_api.IOwnership} message Ownership message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Ownership.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Ownership message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Ownership
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Ownership} Ownership
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Ownership.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Ownership();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 2: {
                        message.ofBotId = reader.int64();
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
         * Decodes an Ownership message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Ownership
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Ownership} Ownership
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Ownership.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Ownership message.
         * @function verify
         * @memberof websocket_api.Ownership
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Ownership.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.ofBotId != null && message.hasOwnProperty("ofBotId"))
                if (!$util.isInteger(message.ofBotId) && !(message.ofBotId && $util.isInteger(message.ofBotId.low) && $util.isInteger(message.ofBotId.high)))
                    return "ofBotId: integer|Long expected";
            return null;
        };

        /**
         * Creates an Ownership message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Ownership
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Ownership} Ownership
         */
        Ownership.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Ownership)
                return object;
            var message = new $root.websocket_api.Ownership();
            if (object.ofBotId != null)
                if ($util.Long)
                    (message.ofBotId = $util.Long.fromValue(object.ofBotId)).unsigned = false;
                else if (typeof object.ofBotId === "string")
                    message.ofBotId = parseInt(object.ofBotId, 10);
                else if (typeof object.ofBotId === "number")
                    message.ofBotId = object.ofBotId;
                else if (typeof object.ofBotId === "object")
                    message.ofBotId = new $util.LongBits(object.ofBotId.low >>> 0, object.ofBotId.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from an Ownership message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Ownership
         * @static
         * @param {websocket_api.Ownership} message Ownership
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Ownership.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.ofBotId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.ofBotId = options.longs === String ? "0" : 0;
            if (message.ofBotId != null && message.hasOwnProperty("ofBotId"))
                if (typeof message.ofBotId === "number")
                    object.ofBotId = options.longs === String ? String(message.ofBotId) : message.ofBotId;
                else
                    object.ofBotId = options.longs === String ? $util.Long.prototype.toString.call(message.ofBotId) : options.longs === Number ? new $util.LongBits(message.ofBotId.low >>> 0, message.ofBotId.high >>> 0).toNumber() : message.ofBotId;
            return object;
        };

        /**
         * Converts this Ownership to JSON.
         * @function toJSON
         * @memberof websocket_api.Ownership
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Ownership.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Ownership
         * @function getTypeUrl
         * @memberof websocket_api.Ownership
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Ownership.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Ownership";
        };

        return Ownership;
    })();

    websocket_api.Ownerships = (function() {

        /**
         * Properties of an Ownerships.
         * @memberof websocket_api
         * @interface IOwnerships
         * @property {Array.<websocket_api.IOwnership>|null} [ownerships] Ownerships ownerships
         */

        /**
         * Constructs a new Ownerships.
         * @memberof websocket_api
         * @classdesc Represents an Ownerships.
         * @implements IOwnerships
         * @constructor
         * @param {websocket_api.IOwnerships=} [properties] Properties to set
         */
        function Ownerships(properties) {
            this.ownerships = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Ownerships ownerships.
         * @member {Array.<websocket_api.IOwnership>} ownerships
         * @memberof websocket_api.Ownerships
         * @instance
         */
        Ownerships.prototype.ownerships = $util.emptyArray;

        /**
         * Creates a new Ownerships instance using the specified properties.
         * @function create
         * @memberof websocket_api.Ownerships
         * @static
         * @param {websocket_api.IOwnerships=} [properties] Properties to set
         * @returns {websocket_api.Ownerships} Ownerships instance
         */
        Ownerships.create = function create(properties) {
            return new Ownerships(properties);
        };

        /**
         * Encodes the specified Ownerships message. Does not implicitly {@link websocket_api.Ownerships.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Ownerships
         * @static
         * @param {websocket_api.IOwnerships} message Ownerships message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Ownerships.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ownerships != null && message.ownerships.length)
                for (var i = 0; i < message.ownerships.length; ++i)
                    $root.websocket_api.Ownership.encode(message.ownerships[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Ownerships message, length delimited. Does not implicitly {@link websocket_api.Ownerships.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Ownerships
         * @static
         * @param {websocket_api.IOwnerships} message Ownerships message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Ownerships.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Ownerships message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Ownerships
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Ownerships} Ownerships
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Ownerships.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Ownerships();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.ownerships && message.ownerships.length))
                            message.ownerships = [];
                        message.ownerships.push($root.websocket_api.Ownership.decode(reader, reader.uint32()));
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
         * Decodes an Ownerships message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Ownerships
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Ownerships} Ownerships
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Ownerships.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Ownerships message.
         * @function verify
         * @memberof websocket_api.Ownerships
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Ownerships.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.ownerships != null && message.hasOwnProperty("ownerships")) {
                if (!Array.isArray(message.ownerships))
                    return "ownerships: array expected";
                for (var i = 0; i < message.ownerships.length; ++i) {
                    var error = $root.websocket_api.Ownership.verify(message.ownerships[i]);
                    if (error)
                        return "ownerships." + error;
                }
            }
            return null;
        };

        /**
         * Creates an Ownerships message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Ownerships
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Ownerships} Ownerships
         */
        Ownerships.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Ownerships)
                return object;
            var message = new $root.websocket_api.Ownerships();
            if (object.ownerships) {
                if (!Array.isArray(object.ownerships))
                    throw TypeError(".websocket_api.Ownerships.ownerships: array expected");
                message.ownerships = [];
                for (var i = 0; i < object.ownerships.length; ++i) {
                    if (typeof object.ownerships[i] !== "object")
                        throw TypeError(".websocket_api.Ownerships.ownerships: object expected");
                    message.ownerships[i] = $root.websocket_api.Ownership.fromObject(object.ownerships[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an Ownerships message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Ownerships
         * @static
         * @param {websocket_api.Ownerships} message Ownerships
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Ownerships.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.ownerships = [];
            if (message.ownerships && message.ownerships.length) {
                object.ownerships = [];
                for (var j = 0; j < message.ownerships.length; ++j)
                    object.ownerships[j] = $root.websocket_api.Ownership.toObject(message.ownerships[j], options);
            }
            return object;
        };

        /**
         * Converts this Ownerships to JSON.
         * @function toJSON
         * @memberof websocket_api.Ownerships
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Ownerships.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Ownerships
         * @function getTypeUrl
         * @memberof websocket_api.Ownerships
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Ownerships.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Ownerships";
        };

        return Ownerships;
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

    websocket_api.Portfolio = (function() {

        /**
         * Properties of a Portfolio.
         * @memberof websocket_api
         * @interface IPortfolio
         * @property {number|null} [totalBalance] Portfolio totalBalance
         * @property {number|null} [availableBalance] Portfolio availableBalance
         * @property {Array.<websocket_api.Portfolio.IMarketExposure>|null} [marketExposures] Portfolio marketExposures
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
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

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
            if (message.totalBalance != null && Object.hasOwnProperty.call(message, "totalBalance"))
                writer.uint32(/* id 1, wireType 1 =*/9).double(message.totalBalance);
            if (message.availableBalance != null && Object.hasOwnProperty.call(message, "availableBalance"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.availableBalance);
            if (message.marketExposures != null && message.marketExposures.length)
                for (var i = 0; i < message.marketExposures.length; ++i)
                    $root.websocket_api.Portfolio.MarketExposure.encode(message.marketExposures[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
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
                        message.totalBalance = reader.double();
                        break;
                    }
                case 2: {
                        message.availableBalance = reader.double();
                        break;
                    }
                case 3: {
                        if (!(message.marketExposures && message.marketExposures.length))
                            message.marketExposures = [];
                        message.marketExposures.push($root.websocket_api.Portfolio.MarketExposure.decode(reader, reader.uint32()));
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
            if (options.arrays || options.defaults)
                object.marketExposures = [];
            if (options.defaults) {
                object.totalBalance = 0;
                object.availableBalance = 0;
            }
            if (message.totalBalance != null && message.hasOwnProperty("totalBalance"))
                object.totalBalance = options.json && !isFinite(message.totalBalance) ? String(message.totalBalance) : message.totalBalance;
            if (message.availableBalance != null && message.hasOwnProperty("availableBalance"))
                object.availableBalance = options.json && !isFinite(message.availableBalance) ? String(message.availableBalance) : message.availableBalance;
            if (message.marketExposures && message.marketExposures.length) {
                object.marketExposures = [];
                for (var j = 0; j < message.marketExposures.length; ++j)
                    object.marketExposures[j] = $root.websocket_api.Portfolio.MarketExposure.toObject(message.marketExposures[j], options);
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
         * @property {number|Long|null} [userId] OrderCreated userId
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
         * OrderCreated userId.
         * @member {number|Long} userId
         * @memberof websocket_api.OrderCreated
         * @instance
         */
        OrderCreated.prototype.userId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

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
            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                writer.uint32(/* id 7, wireType 0 =*/56).int64(message.userId);
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
                case 7: {
                        message.userId = reader.int64();
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
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (!$util.isInteger(message.userId) && !(message.userId && $util.isInteger(message.userId.low) && $util.isInteger(message.userId.high)))
                    return "userId: integer|Long expected";
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
            if (object.userId != null)
                if ($util.Long)
                    (message.userId = $util.Long.fromValue(object.userId)).unsigned = false;
                else if (typeof object.userId === "string")
                    message.userId = parseInt(object.userId, 10);
                else if (typeof object.userId === "number")
                    message.userId = object.userId;
                else if (typeof object.userId === "object")
                    message.userId = new $util.LongBits(object.userId.low >>> 0, object.userId.high >>> 0).toNumber();
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
                object.transaction = null;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.userId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.userId = options.longs === String ? "0" : 0;
            }
            if (message.marketId != null && message.hasOwnProperty("marketId"))
                if (typeof message.marketId === "number")
                    object.marketId = options.longs === String ? String(message.marketId) : message.marketId;
                else
                    object.marketId = options.longs === String ? $util.Long.prototype.toString.call(message.marketId) : options.longs === Number ? new $util.LongBits(message.marketId.low >>> 0, message.marketId.high >>> 0).toNumber() : message.marketId;
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
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (typeof message.userId === "number")
                    object.userId = options.longs === String ? String(message.userId) : message.userId;
                else
                    object.userId = options.longs === String ? $util.Long.prototype.toString.call(message.userId) : options.longs === Number ? new $util.LongBits(message.userId.low >>> 0, message.userId.high >>> 0).toNumber() : message.userId;
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

    websocket_api.Payment = (function() {

        /**
         * Properties of a Payment.
         * @memberof websocket_api
         * @interface IPayment
         * @property {number|Long|null} [id] Payment id
         * @property {number|Long|null} [payerId] Payment payerId
         * @property {number|Long|null} [recipientId] Payment recipientId
         * @property {websocket_api.ITransaction|null} [transaction] Payment transaction
         * @property {number|null} [amount] Payment amount
         * @property {string|null} [note] Payment note
         */

        /**
         * Constructs a new Payment.
         * @memberof websocket_api
         * @classdesc Represents a Payment.
         * @implements IPayment
         * @constructor
         * @param {websocket_api.IPayment=} [properties] Properties to set
         */
        function Payment(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Payment id.
         * @member {number|Long} id
         * @memberof websocket_api.Payment
         * @instance
         */
        Payment.prototype.id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Payment payerId.
         * @member {number|Long} payerId
         * @memberof websocket_api.Payment
         * @instance
         */
        Payment.prototype.payerId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Payment recipientId.
         * @member {number|Long} recipientId
         * @memberof websocket_api.Payment
         * @instance
         */
        Payment.prototype.recipientId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Payment transaction.
         * @member {websocket_api.ITransaction|null|undefined} transaction
         * @memberof websocket_api.Payment
         * @instance
         */
        Payment.prototype.transaction = null;

        /**
         * Payment amount.
         * @member {number} amount
         * @memberof websocket_api.Payment
         * @instance
         */
        Payment.prototype.amount = 0;

        /**
         * Payment note.
         * @member {string} note
         * @memberof websocket_api.Payment
         * @instance
         */
        Payment.prototype.note = "";

        /**
         * Creates a new Payment instance using the specified properties.
         * @function create
         * @memberof websocket_api.Payment
         * @static
         * @param {websocket_api.IPayment=} [properties] Properties to set
         * @returns {websocket_api.Payment} Payment instance
         */
        Payment.create = function create(properties) {
            return new Payment(properties);
        };

        /**
         * Encodes the specified Payment message. Does not implicitly {@link websocket_api.Payment.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Payment
         * @static
         * @param {websocket_api.IPayment} message Payment message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Payment.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.id);
            if (message.transaction != null && Object.hasOwnProperty.call(message, "transaction"))
                $root.websocket_api.Transaction.encode(message.transaction, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 5, wireType 1 =*/41).double(message.amount);
            if (message.note != null && Object.hasOwnProperty.call(message, "note"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.note);
            if (message.payerId != null && Object.hasOwnProperty.call(message, "payerId"))
                writer.uint32(/* id 7, wireType 0 =*/56).int64(message.payerId);
            if (message.recipientId != null && Object.hasOwnProperty.call(message, "recipientId"))
                writer.uint32(/* id 8, wireType 0 =*/64).int64(message.recipientId);
            return writer;
        };

        /**
         * Encodes the specified Payment message, length delimited. Does not implicitly {@link websocket_api.Payment.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Payment
         * @static
         * @param {websocket_api.IPayment} message Payment message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Payment.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Payment message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Payment
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Payment} Payment
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Payment.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Payment();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.int64();
                        break;
                    }
                case 7: {
                        message.payerId = reader.int64();
                        break;
                    }
                case 8: {
                        message.recipientId = reader.int64();
                        break;
                    }
                case 4: {
                        message.transaction = $root.websocket_api.Transaction.decode(reader, reader.uint32());
                        break;
                    }
                case 5: {
                        message.amount = reader.double();
                        break;
                    }
                case 6: {
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
         * Decodes a Payment message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Payment
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Payment} Payment
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Payment.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Payment message.
         * @function verify
         * @memberof websocket_api.Payment
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Payment.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.payerId != null && message.hasOwnProperty("payerId"))
                if (!$util.isInteger(message.payerId) && !(message.payerId && $util.isInteger(message.payerId.low) && $util.isInteger(message.payerId.high)))
                    return "payerId: integer|Long expected";
            if (message.recipientId != null && message.hasOwnProperty("recipientId"))
                if (!$util.isInteger(message.recipientId) && !(message.recipientId && $util.isInteger(message.recipientId.low) && $util.isInteger(message.recipientId.high)))
                    return "recipientId: integer|Long expected";
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
         * Creates a Payment message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Payment
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Payment} Payment
         */
        Payment.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Payment)
                return object;
            var message = new $root.websocket_api.Payment();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = false;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
            if (object.payerId != null)
                if ($util.Long)
                    (message.payerId = $util.Long.fromValue(object.payerId)).unsigned = false;
                else if (typeof object.payerId === "string")
                    message.payerId = parseInt(object.payerId, 10);
                else if (typeof object.payerId === "number")
                    message.payerId = object.payerId;
                else if (typeof object.payerId === "object")
                    message.payerId = new $util.LongBits(object.payerId.low >>> 0, object.payerId.high >>> 0).toNumber();
            if (object.recipientId != null)
                if ($util.Long)
                    (message.recipientId = $util.Long.fromValue(object.recipientId)).unsigned = false;
                else if (typeof object.recipientId === "string")
                    message.recipientId = parseInt(object.recipientId, 10);
                else if (typeof object.recipientId === "number")
                    message.recipientId = object.recipientId;
                else if (typeof object.recipientId === "object")
                    message.recipientId = new $util.LongBits(object.recipientId.low >>> 0, object.recipientId.high >>> 0).toNumber();
            if (object.transaction != null) {
                if (typeof object.transaction !== "object")
                    throw TypeError(".websocket_api.Payment.transaction: object expected");
                message.transaction = $root.websocket_api.Transaction.fromObject(object.transaction);
            }
            if (object.amount != null)
                message.amount = Number(object.amount);
            if (object.note != null)
                message.note = String(object.note);
            return message;
        };

        /**
         * Creates a plain object from a Payment message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Payment
         * @static
         * @param {websocket_api.Payment} message Payment
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Payment.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                object.transaction = null;
                object.amount = 0;
                object.note = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.payerId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.payerId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.recipientId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.recipientId = options.longs === String ? "0" : 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
            if (message.transaction != null && message.hasOwnProperty("transaction"))
                object.transaction = $root.websocket_api.Transaction.toObject(message.transaction, options);
            if (message.amount != null && message.hasOwnProperty("amount"))
                object.amount = options.json && !isFinite(message.amount) ? String(message.amount) : message.amount;
            if (message.note != null && message.hasOwnProperty("note"))
                object.note = message.note;
            if (message.payerId != null && message.hasOwnProperty("payerId"))
                if (typeof message.payerId === "number")
                    object.payerId = options.longs === String ? String(message.payerId) : message.payerId;
                else
                    object.payerId = options.longs === String ? $util.Long.prototype.toString.call(message.payerId) : options.longs === Number ? new $util.LongBits(message.payerId.low >>> 0, message.payerId.high >>> 0).toNumber() : message.payerId;
            if (message.recipientId != null && message.hasOwnProperty("recipientId"))
                if (typeof message.recipientId === "number")
                    object.recipientId = options.longs === String ? String(message.recipientId) : message.recipientId;
                else
                    object.recipientId = options.longs === String ? $util.Long.prototype.toString.call(message.recipientId) : options.longs === Number ? new $util.LongBits(message.recipientId.low >>> 0, message.recipientId.high >>> 0).toNumber() : message.recipientId;
            return object;
        };

        /**
         * Converts this Payment to JSON.
         * @function toJSON
         * @memberof websocket_api.Payment
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Payment.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Payment
         * @function getTypeUrl
         * @memberof websocket_api.Payment
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Payment.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Payment";
        };

        return Payment;
    })();

    websocket_api.Payments = (function() {

        /**
         * Properties of a Payments.
         * @memberof websocket_api
         * @interface IPayments
         * @property {Array.<websocket_api.IPayment>|null} [payments] Payments payments
         */

        /**
         * Constructs a new Payments.
         * @memberof websocket_api
         * @classdesc Represents a Payments.
         * @implements IPayments
         * @constructor
         * @param {websocket_api.IPayments=} [properties] Properties to set
         */
        function Payments(properties) {
            this.payments = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Payments payments.
         * @member {Array.<websocket_api.IPayment>} payments
         * @memberof websocket_api.Payments
         * @instance
         */
        Payments.prototype.payments = $util.emptyArray;

        /**
         * Creates a new Payments instance using the specified properties.
         * @function create
         * @memberof websocket_api.Payments
         * @static
         * @param {websocket_api.IPayments=} [properties] Properties to set
         * @returns {websocket_api.Payments} Payments instance
         */
        Payments.create = function create(properties) {
            return new Payments(properties);
        };

        /**
         * Encodes the specified Payments message. Does not implicitly {@link websocket_api.Payments.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Payments
         * @static
         * @param {websocket_api.IPayments} message Payments message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Payments.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.payments != null && message.payments.length)
                for (var i = 0; i < message.payments.length; ++i)
                    $root.websocket_api.Payment.encode(message.payments[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Payments message, length delimited. Does not implicitly {@link websocket_api.Payments.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Payments
         * @static
         * @param {websocket_api.IPayments} message Payments message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Payments.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Payments message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Payments
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Payments} Payments
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Payments.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Payments();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.payments && message.payments.length))
                            message.payments = [];
                        message.payments.push($root.websocket_api.Payment.decode(reader, reader.uint32()));
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
         * Decodes a Payments message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Payments
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Payments} Payments
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Payments.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Payments message.
         * @function verify
         * @memberof websocket_api.Payments
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Payments.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.payments != null && message.hasOwnProperty("payments")) {
                if (!Array.isArray(message.payments))
                    return "payments: array expected";
                for (var i = 0; i < message.payments.length; ++i) {
                    var error = $root.websocket_api.Payment.verify(message.payments[i]);
                    if (error)
                        return "payments." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Payments message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Payments
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Payments} Payments
         */
        Payments.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Payments)
                return object;
            var message = new $root.websocket_api.Payments();
            if (object.payments) {
                if (!Array.isArray(object.payments))
                    throw TypeError(".websocket_api.Payments.payments: array expected");
                message.payments = [];
                for (var i = 0; i < object.payments.length; ++i) {
                    if (typeof object.payments[i] !== "object")
                        throw TypeError(".websocket_api.Payments.payments: object expected");
                    message.payments[i] = $root.websocket_api.Payment.fromObject(object.payments[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a Payments message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Payments
         * @static
         * @param {websocket_api.Payments} message Payments
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Payments.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.payments = [];
            if (message.payments && message.payments.length) {
                object.payments = [];
                for (var j = 0; j < message.payments.length; ++j)
                    object.payments[j] = $root.websocket_api.Payment.toObject(message.payments[j], options);
            }
            return object;
        };

        /**
         * Converts this Payments to JSON.
         * @function toJSON
         * @memberof websocket_api.Payments
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Payments.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Payments
         * @function getTypeUrl
         * @memberof websocket_api.Payments
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Payments.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Payments";
        };

        return Payments;
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

    websocket_api.User = (function() {

        /**
         * Properties of a User.
         * @memberof websocket_api
         * @interface IUser
         * @property {number|Long|null} [id] User id
         * @property {string|null} [name] User name
         * @property {boolean|null} [isBot] User isBot
         */

        /**
         * Constructs a new User.
         * @memberof websocket_api
         * @classdesc Represents a User.
         * @implements IUser
         * @constructor
         * @param {websocket_api.IUser=} [properties] Properties to set
         */
        function User(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * User id.
         * @member {number|Long} id
         * @memberof websocket_api.User
         * @instance
         */
        User.prototype.id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * User name.
         * @member {string} name
         * @memberof websocket_api.User
         * @instance
         */
        User.prototype.name = "";

        /**
         * User isBot.
         * @member {boolean} isBot
         * @memberof websocket_api.User
         * @instance
         */
        User.prototype.isBot = false;

        /**
         * Creates a new User instance using the specified properties.
         * @function create
         * @memberof websocket_api.User
         * @static
         * @param {websocket_api.IUser=} [properties] Properties to set
         * @returns {websocket_api.User} User instance
         */
        User.create = function create(properties) {
            return new User(properties);
        };

        /**
         * Encodes the specified User message. Does not implicitly {@link websocket_api.User.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.User
         * @static
         * @param {websocket_api.IUser} message User message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        User.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
            if (message.isBot != null && Object.hasOwnProperty.call(message, "isBot"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.isBot);
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 4, wireType 0 =*/32).int64(message.id);
            return writer;
        };

        /**
         * Encodes the specified User message, length delimited. Does not implicitly {@link websocket_api.User.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.User
         * @static
         * @param {websocket_api.IUser} message User message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        User.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a User message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.User
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.User} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        User.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.User();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 4: {
                        message.id = reader.int64();
                        break;
                    }
                case 2: {
                        message.name = reader.string();
                        break;
                    }
                case 3: {
                        message.isBot = reader.bool();
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
         * Decodes a User message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.User
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.User} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        User.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a User message.
         * @function verify
         * @memberof websocket_api.User
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        User.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.isBot != null && message.hasOwnProperty("isBot"))
                if (typeof message.isBot !== "boolean")
                    return "isBot: boolean expected";
            return null;
        };

        /**
         * Creates a User message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.User
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.User} User
         */
        User.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.User)
                return object;
            var message = new $root.websocket_api.User();
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
            if (object.isBot != null)
                message.isBot = Boolean(object.isBot);
            return message;
        };

        /**
         * Creates a plain object from a User message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.User
         * @static
         * @param {websocket_api.User} message User
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        User.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.name = "";
                object.isBot = false;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.isBot != null && message.hasOwnProperty("isBot"))
                object.isBot = message.isBot;
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
            return object;
        };

        /**
         * Converts this User to JSON.
         * @function toJSON
         * @memberof websocket_api.User
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        User.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for User
         * @function getTypeUrl
         * @memberof websocket_api.User
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        User.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.User";
        };

        return User;
    })();

    websocket_api.Users = (function() {

        /**
         * Properties of a Users.
         * @memberof websocket_api
         * @interface IUsers
         * @property {Array.<websocket_api.IUser>|null} [users] Users users
         */

        /**
         * Constructs a new Users.
         * @memberof websocket_api
         * @classdesc Represents a Users.
         * @implements IUsers
         * @constructor
         * @param {websocket_api.IUsers=} [properties] Properties to set
         */
        function Users(properties) {
            this.users = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Users users.
         * @member {Array.<websocket_api.IUser>} users
         * @memberof websocket_api.Users
         * @instance
         */
        Users.prototype.users = $util.emptyArray;

        /**
         * Creates a new Users instance using the specified properties.
         * @function create
         * @memberof websocket_api.Users
         * @static
         * @param {websocket_api.IUsers=} [properties] Properties to set
         * @returns {websocket_api.Users} Users instance
         */
        Users.create = function create(properties) {
            return new Users(properties);
        };

        /**
         * Encodes the specified Users message. Does not implicitly {@link websocket_api.Users.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.Users
         * @static
         * @param {websocket_api.IUsers} message Users message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Users.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.users != null && message.users.length)
                for (var i = 0; i < message.users.length; ++i)
                    $root.websocket_api.User.encode(message.users[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Users message, length delimited. Does not implicitly {@link websocket_api.Users.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.Users
         * @static
         * @param {websocket_api.IUsers} message Users message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Users.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Users message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.Users
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.Users} Users
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Users.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.Users();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.users && message.users.length))
                            message.users = [];
                        message.users.push($root.websocket_api.User.decode(reader, reader.uint32()));
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
         * Decodes a Users message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.Users
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.Users} Users
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Users.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Users message.
         * @function verify
         * @memberof websocket_api.Users
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Users.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.users != null && message.hasOwnProperty("users")) {
                if (!Array.isArray(message.users))
                    return "users: array expected";
                for (var i = 0; i < message.users.length; ++i) {
                    var error = $root.websocket_api.User.verify(message.users[i]);
                    if (error)
                        return "users." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Users message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.Users
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.Users} Users
         */
        Users.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.Users)
                return object;
            var message = new $root.websocket_api.Users();
            if (object.users) {
                if (!Array.isArray(object.users))
                    throw TypeError(".websocket_api.Users.users: array expected");
                message.users = [];
                for (var i = 0; i < object.users.length; ++i) {
                    if (typeof object.users[i] !== "object")
                        throw TypeError(".websocket_api.Users.users: object expected");
                    message.users[i] = $root.websocket_api.User.fromObject(object.users[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a Users message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.Users
         * @static
         * @param {websocket_api.Users} message Users
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Users.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.users = [];
            if (message.users && message.users.length) {
                object.users = [];
                for (var j = 0; j < message.users.length; ++j)
                    object.users[j] = $root.websocket_api.User.toObject(message.users[j], options);
            }
            return object;
        };

        /**
         * Converts this Users to JSON.
         * @function toJSON
         * @memberof websocket_api.Users
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Users.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Users
         * @function getTypeUrl
         * @memberof websocket_api.Users
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Users.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.Users";
        };

        return Users;
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
         * @property {number|Long|null} [userId] Redeemed userId
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
         * Redeemed userId.
         * @member {number|Long} userId
         * @memberof websocket_api.Redeemed
         * @instance
         */
        Redeemed.prototype.userId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

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
            if (message.fundId != null && Object.hasOwnProperty.call(message, "fundId"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.fundId);
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 4, wireType 1 =*/33).double(message.amount);
            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                writer.uint32(/* id 5, wireType 0 =*/40).int64(message.userId);
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
                case 5: {
                        message.userId = reader.int64();
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
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (!$util.isInteger(message.userId) && !(message.userId && $util.isInteger(message.userId.low) && $util.isInteger(message.userId.high)))
                    return "userId: integer|Long expected";
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
            if (object.userId != null)
                if ($util.Long)
                    (message.userId = $util.Long.fromValue(object.userId)).unsigned = false;
                else if (typeof object.userId === "string")
                    message.userId = parseInt(object.userId, 10);
                else if (typeof object.userId === "number")
                    message.userId = object.userId;
                else if (typeof object.userId === "object")
                    message.userId = new $util.LongBits(object.userId.low >>> 0, object.userId.high >>> 0).toNumber();
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
                    object.fundId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.fundId = options.longs === String ? "0" : 0;
                object.amount = 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.userId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.userId = options.longs === String ? "0" : 0;
            }
            if (message.transaction != null && message.hasOwnProperty("transaction"))
                object.transaction = $root.websocket_api.Transaction.toObject(message.transaction, options);
            if (message.fundId != null && message.hasOwnProperty("fundId"))
                if (typeof message.fundId === "number")
                    object.fundId = options.longs === String ? String(message.fundId) : message.fundId;
                else
                    object.fundId = options.longs === String ? $util.Long.prototype.toString.call(message.fundId) : options.longs === Number ? new $util.LongBits(message.fundId.low >>> 0, message.fundId.high >>> 0).toNumber() : message.fundId;
            if (message.amount != null && message.hasOwnProperty("amount"))
                object.amount = options.json && !isFinite(message.amount) ? String(message.amount) : message.amount;
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (typeof message.userId === "number")
                    object.userId = options.longs === String ? String(message.userId) : message.userId;
                else
                    object.userId = options.longs === String ? $util.Long.prototype.toString.call(message.userId) : options.longs === Number ? new $util.LongBits(message.userId.low >>> 0, message.userId.high >>> 0).toNumber() : message.userId;
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
         * @property {websocket_api.IMakePayment|null} [makePayment] ClientMessage makePayment
         * @property {websocket_api.IAuthenticate|null} [authenticate] ClientMessage authenticate
         * @property {websocket_api.IActAs|null} [actAs] ClientMessage actAs
         * @property {websocket_api.ICreateBot|null} [createBot] ClientMessage createBot
         * @property {websocket_api.IGiveOwnership|null} [giveOwnership] ClientMessage giveOwnership
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
         * ClientMessage makePayment.
         * @member {websocket_api.IMakePayment|null|undefined} makePayment
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.makePayment = null;

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
         * ClientMessage createBot.
         * @member {websocket_api.ICreateBot|null|undefined} createBot
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.createBot = null;

        /**
         * ClientMessage giveOwnership.
         * @member {websocket_api.IGiveOwnership|null|undefined} giveOwnership
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        ClientMessage.prototype.giveOwnership = null;

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
         * @member {"createMarket"|"settleMarket"|"createOrder"|"cancelOrder"|"out"|"makePayment"|"authenticate"|"actAs"|"createBot"|"giveOwnership"|"getFullOrderHistory"|"getFullTradeHistory"|"redeem"|undefined} message
         * @memberof websocket_api.ClientMessage
         * @instance
         */
        Object.defineProperty(ClientMessage.prototype, "message", {
            get: $util.oneOfGetter($oneOfFields = ["createMarket", "settleMarket", "createOrder", "cancelOrder", "out", "makePayment", "authenticate", "actAs", "createBot", "giveOwnership", "getFullOrderHistory", "getFullTradeHistory", "redeem"]),
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
            if (message.makePayment != null && Object.hasOwnProperty.call(message, "makePayment"))
                $root.websocket_api.MakePayment.encode(message.makePayment, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.authenticate != null && Object.hasOwnProperty.call(message, "authenticate"))
                $root.websocket_api.Authenticate.encode(message.authenticate, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.actAs != null && Object.hasOwnProperty.call(message, "actAs"))
                $root.websocket_api.ActAs.encode(message.actAs, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.createBot != null && Object.hasOwnProperty.call(message, "createBot"))
                $root.websocket_api.CreateBot.encode(message.createBot, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.giveOwnership != null && Object.hasOwnProperty.call(message, "giveOwnership"))
                $root.websocket_api.GiveOwnership.encode(message.giveOwnership, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
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
                        message.makePayment = $root.websocket_api.MakePayment.decode(reader, reader.uint32());
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
                        message.createBot = $root.websocket_api.CreateBot.decode(reader, reader.uint32());
                        break;
                    }
                case 10: {
                        message.giveOwnership = $root.websocket_api.GiveOwnership.decode(reader, reader.uint32());
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
            if (message.makePayment != null && message.hasOwnProperty("makePayment")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.MakePayment.verify(message.makePayment);
                    if (error)
                        return "makePayment." + error;
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
            if (message.createBot != null && message.hasOwnProperty("createBot")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.CreateBot.verify(message.createBot);
                    if (error)
                        return "createBot." + error;
                }
            }
            if (message.giveOwnership != null && message.hasOwnProperty("giveOwnership")) {
                if (properties.message === 1)
                    return "message: multiple values";
                properties.message = 1;
                {
                    var error = $root.websocket_api.GiveOwnership.verify(message.giveOwnership);
                    if (error)
                        return "giveOwnership." + error;
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
            if (object.makePayment != null) {
                if (typeof object.makePayment !== "object")
                    throw TypeError(".websocket_api.ClientMessage.makePayment: object expected");
                message.makePayment = $root.websocket_api.MakePayment.fromObject(object.makePayment);
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
            if (object.createBot != null) {
                if (typeof object.createBot !== "object")
                    throw TypeError(".websocket_api.ClientMessage.createBot: object expected");
                message.createBot = $root.websocket_api.CreateBot.fromObject(object.createBot);
            }
            if (object.giveOwnership != null) {
                if (typeof object.giveOwnership !== "object")
                    throw TypeError(".websocket_api.ClientMessage.giveOwnership: object expected");
                message.giveOwnership = $root.websocket_api.GiveOwnership.fromObject(object.giveOwnership);
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
            if (message.makePayment != null && message.hasOwnProperty("makePayment")) {
                object.makePayment = $root.websocket_api.MakePayment.toObject(message.makePayment, options);
                if (options.oneofs)
                    object.message = "makePayment";
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
            if (message.createBot != null && message.hasOwnProperty("createBot")) {
                object.createBot = $root.websocket_api.CreateBot.toObject(message.createBot, options);
                if (options.oneofs)
                    object.message = "createBot";
            }
            if (message.giveOwnership != null && message.hasOwnProperty("giveOwnership")) {
                object.giveOwnership = $root.websocket_api.GiveOwnership.toObject(message.giveOwnership, options);
                if (options.oneofs)
                    object.message = "giveOwnership";
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
         * @property {number|Long|null} [userId] ActAs userId
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
         * ActAs userId.
         * @member {number|Long} userId
         * @memberof websocket_api.ActAs
         * @instance
         */
        ActAs.prototype.userId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

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
            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.userId);
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
                case 2: {
                        message.userId = reader.int64();
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
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (!$util.isInteger(message.userId) && !(message.userId && $util.isInteger(message.userId.low) && $util.isInteger(message.userId.high)))
                    return "userId: integer|Long expected";
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
            if (object.userId != null)
                if ($util.Long)
                    (message.userId = $util.Long.fromValue(object.userId)).unsigned = false;
                else if (typeof object.userId === "string")
                    message.userId = parseInt(object.userId, 10);
                else if (typeof object.userId === "number")
                    message.userId = object.userId;
                else if (typeof object.userId === "object")
                    message.userId = new $util.LongBits(object.userId.low >>> 0, object.userId.high >>> 0).toNumber();
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
                    object.userId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.userId = options.longs === String ? "0" : 0;
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (typeof message.userId === "number")
                    object.userId = options.longs === String ? String(message.userId) : message.userId;
                else
                    object.userId = options.longs === String ? $util.Long.prototype.toString.call(message.userId) : options.longs === Number ? new $util.LongBits(message.userId.low >>> 0, message.userId.high >>> 0).toNumber() : message.userId;
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

    websocket_api.CreateBot = (function() {

        /**
         * Properties of a CreateBot.
         * @memberof websocket_api
         * @interface ICreateBot
         * @property {string|null} [name] CreateBot name
         */

        /**
         * Constructs a new CreateBot.
         * @memberof websocket_api
         * @classdesc Represents a CreateBot.
         * @implements ICreateBot
         * @constructor
         * @param {websocket_api.ICreateBot=} [properties] Properties to set
         */
        function CreateBot(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateBot name.
         * @member {string} name
         * @memberof websocket_api.CreateBot
         * @instance
         */
        CreateBot.prototype.name = "";

        /**
         * Creates a new CreateBot instance using the specified properties.
         * @function create
         * @memberof websocket_api.CreateBot
         * @static
         * @param {websocket_api.ICreateBot=} [properties] Properties to set
         * @returns {websocket_api.CreateBot} CreateBot instance
         */
        CreateBot.create = function create(properties) {
            return new CreateBot(properties);
        };

        /**
         * Encodes the specified CreateBot message. Does not implicitly {@link websocket_api.CreateBot.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.CreateBot
         * @static
         * @param {websocket_api.ICreateBot} message CreateBot message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateBot.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            return writer;
        };

        /**
         * Encodes the specified CreateBot message, length delimited. Does not implicitly {@link websocket_api.CreateBot.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.CreateBot
         * @static
         * @param {websocket_api.ICreateBot} message CreateBot message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateBot.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateBot message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.CreateBot
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.CreateBot} CreateBot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateBot.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.CreateBot();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
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
         * Decodes a CreateBot message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.CreateBot
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.CreateBot} CreateBot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateBot.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateBot message.
         * @function verify
         * @memberof websocket_api.CreateBot
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateBot.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            return null;
        };

        /**
         * Creates a CreateBot message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.CreateBot
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.CreateBot} CreateBot
         */
        CreateBot.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.CreateBot)
                return object;
            var message = new $root.websocket_api.CreateBot();
            if (object.name != null)
                message.name = String(object.name);
            return message;
        };

        /**
         * Creates a plain object from a CreateBot message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.CreateBot
         * @static
         * @param {websocket_api.CreateBot} message CreateBot
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateBot.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.name = "";
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            return object;
        };

        /**
         * Converts this CreateBot to JSON.
         * @function toJSON
         * @memberof websocket_api.CreateBot
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateBot.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateBot
         * @function getTypeUrl
         * @memberof websocket_api.CreateBot
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateBot.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.CreateBot";
        };

        return CreateBot;
    })();

    websocket_api.GiveOwnership = (function() {

        /**
         * Properties of a GiveOwnership.
         * @memberof websocket_api
         * @interface IGiveOwnership
         * @property {number|Long|null} [ofBotId] GiveOwnership ofBotId
         * @property {number|Long|null} [toUserId] GiveOwnership toUserId
         */

        /**
         * Constructs a new GiveOwnership.
         * @memberof websocket_api
         * @classdesc Represents a GiveOwnership.
         * @implements IGiveOwnership
         * @constructor
         * @param {websocket_api.IGiveOwnership=} [properties] Properties to set
         */
        function GiveOwnership(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GiveOwnership ofBotId.
         * @member {number|Long} ofBotId
         * @memberof websocket_api.GiveOwnership
         * @instance
         */
        GiveOwnership.prototype.ofBotId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * GiveOwnership toUserId.
         * @member {number|Long} toUserId
         * @memberof websocket_api.GiveOwnership
         * @instance
         */
        GiveOwnership.prototype.toUserId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new GiveOwnership instance using the specified properties.
         * @function create
         * @memberof websocket_api.GiveOwnership
         * @static
         * @param {websocket_api.IGiveOwnership=} [properties] Properties to set
         * @returns {websocket_api.GiveOwnership} GiveOwnership instance
         */
        GiveOwnership.create = function create(properties) {
            return new GiveOwnership(properties);
        };

        /**
         * Encodes the specified GiveOwnership message. Does not implicitly {@link websocket_api.GiveOwnership.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.GiveOwnership
         * @static
         * @param {websocket_api.IGiveOwnership} message GiveOwnership message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GiveOwnership.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ofBotId != null && Object.hasOwnProperty.call(message, "ofBotId"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.ofBotId);
            if (message.toUserId != null && Object.hasOwnProperty.call(message, "toUserId"))
                writer.uint32(/* id 4, wireType 0 =*/32).int64(message.toUserId);
            return writer;
        };

        /**
         * Encodes the specified GiveOwnership message, length delimited. Does not implicitly {@link websocket_api.GiveOwnership.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.GiveOwnership
         * @static
         * @param {websocket_api.IGiveOwnership} message GiveOwnership message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GiveOwnership.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GiveOwnership message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.GiveOwnership
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.GiveOwnership} GiveOwnership
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GiveOwnership.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.GiveOwnership();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 3: {
                        message.ofBotId = reader.int64();
                        break;
                    }
                case 4: {
                        message.toUserId = reader.int64();
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
         * Decodes a GiveOwnership message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.GiveOwnership
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.GiveOwnership} GiveOwnership
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GiveOwnership.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GiveOwnership message.
         * @function verify
         * @memberof websocket_api.GiveOwnership
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GiveOwnership.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.ofBotId != null && message.hasOwnProperty("ofBotId"))
                if (!$util.isInteger(message.ofBotId) && !(message.ofBotId && $util.isInteger(message.ofBotId.low) && $util.isInteger(message.ofBotId.high)))
                    return "ofBotId: integer|Long expected";
            if (message.toUserId != null && message.hasOwnProperty("toUserId"))
                if (!$util.isInteger(message.toUserId) && !(message.toUserId && $util.isInteger(message.toUserId.low) && $util.isInteger(message.toUserId.high)))
                    return "toUserId: integer|Long expected";
            return null;
        };

        /**
         * Creates a GiveOwnership message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.GiveOwnership
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.GiveOwnership} GiveOwnership
         */
        GiveOwnership.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.GiveOwnership)
                return object;
            var message = new $root.websocket_api.GiveOwnership();
            if (object.ofBotId != null)
                if ($util.Long)
                    (message.ofBotId = $util.Long.fromValue(object.ofBotId)).unsigned = false;
                else if (typeof object.ofBotId === "string")
                    message.ofBotId = parseInt(object.ofBotId, 10);
                else if (typeof object.ofBotId === "number")
                    message.ofBotId = object.ofBotId;
                else if (typeof object.ofBotId === "object")
                    message.ofBotId = new $util.LongBits(object.ofBotId.low >>> 0, object.ofBotId.high >>> 0).toNumber();
            if (object.toUserId != null)
                if ($util.Long)
                    (message.toUserId = $util.Long.fromValue(object.toUserId)).unsigned = false;
                else if (typeof object.toUserId === "string")
                    message.toUserId = parseInt(object.toUserId, 10);
                else if (typeof object.toUserId === "number")
                    message.toUserId = object.toUserId;
                else if (typeof object.toUserId === "object")
                    message.toUserId = new $util.LongBits(object.toUserId.low >>> 0, object.toUserId.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a GiveOwnership message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.GiveOwnership
         * @static
         * @param {websocket_api.GiveOwnership} message GiveOwnership
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GiveOwnership.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.ofBotId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.ofBotId = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.toUserId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.toUserId = options.longs === String ? "0" : 0;
            }
            if (message.ofBotId != null && message.hasOwnProperty("ofBotId"))
                if (typeof message.ofBotId === "number")
                    object.ofBotId = options.longs === String ? String(message.ofBotId) : message.ofBotId;
                else
                    object.ofBotId = options.longs === String ? $util.Long.prototype.toString.call(message.ofBotId) : options.longs === Number ? new $util.LongBits(message.ofBotId.low >>> 0, message.ofBotId.high >>> 0).toNumber() : message.ofBotId;
            if (message.toUserId != null && message.hasOwnProperty("toUserId"))
                if (typeof message.toUserId === "number")
                    object.toUserId = options.longs === String ? String(message.toUserId) : message.toUserId;
                else
                    object.toUserId = options.longs === String ? $util.Long.prototype.toString.call(message.toUserId) : options.longs === Number ? new $util.LongBits(message.toUserId.low >>> 0, message.toUserId.high >>> 0).toNumber() : message.toUserId;
            return object;
        };

        /**
         * Converts this GiveOwnership to JSON.
         * @function toJSON
         * @memberof websocket_api.GiveOwnership
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GiveOwnership.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for GiveOwnership
         * @function getTypeUrl
         * @memberof websocket_api.GiveOwnership
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        GiveOwnership.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.GiveOwnership";
        };

        return GiveOwnership;
    })();

    websocket_api.MakePayment = (function() {

        /**
         * Properties of a MakePayment.
         * @memberof websocket_api
         * @interface IMakePayment
         * @property {number|Long|null} [recipientId] MakePayment recipientId
         * @property {number|null} [amount] MakePayment amount
         * @property {string|null} [note] MakePayment note
         */

        /**
         * Constructs a new MakePayment.
         * @memberof websocket_api
         * @classdesc Represents a MakePayment.
         * @implements IMakePayment
         * @constructor
         * @param {websocket_api.IMakePayment=} [properties] Properties to set
         */
        function MakePayment(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MakePayment recipientId.
         * @member {number|Long} recipientId
         * @memberof websocket_api.MakePayment
         * @instance
         */
        MakePayment.prototype.recipientId = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * MakePayment amount.
         * @member {number} amount
         * @memberof websocket_api.MakePayment
         * @instance
         */
        MakePayment.prototype.amount = 0;

        /**
         * MakePayment note.
         * @member {string} note
         * @memberof websocket_api.MakePayment
         * @instance
         */
        MakePayment.prototype.note = "";

        /**
         * Creates a new MakePayment instance using the specified properties.
         * @function create
         * @memberof websocket_api.MakePayment
         * @static
         * @param {websocket_api.IMakePayment=} [properties] Properties to set
         * @returns {websocket_api.MakePayment} MakePayment instance
         */
        MakePayment.create = function create(properties) {
            return new MakePayment(properties);
        };

        /**
         * Encodes the specified MakePayment message. Does not implicitly {@link websocket_api.MakePayment.verify|verify} messages.
         * @function encode
         * @memberof websocket_api.MakePayment
         * @static
         * @param {websocket_api.IMakePayment} message MakePayment message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MakePayment.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.amount);
            if (message.note != null && Object.hasOwnProperty.call(message, "note"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.note);
            if (message.recipientId != null && Object.hasOwnProperty.call(message, "recipientId"))
                writer.uint32(/* id 4, wireType 0 =*/32).int64(message.recipientId);
            return writer;
        };

        /**
         * Encodes the specified MakePayment message, length delimited. Does not implicitly {@link websocket_api.MakePayment.verify|verify} messages.
         * @function encodeDelimited
         * @memberof websocket_api.MakePayment
         * @static
         * @param {websocket_api.IMakePayment} message MakePayment message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MakePayment.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MakePayment message from the specified reader or buffer.
         * @function decode
         * @memberof websocket_api.MakePayment
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {websocket_api.MakePayment} MakePayment
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MakePayment.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.websocket_api.MakePayment();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 4: {
                        message.recipientId = reader.int64();
                        break;
                    }
                case 2: {
                        message.amount = reader.double();
                        break;
                    }
                case 3: {
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
         * Decodes a MakePayment message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof websocket_api.MakePayment
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {websocket_api.MakePayment} MakePayment
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MakePayment.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MakePayment message.
         * @function verify
         * @memberof websocket_api.MakePayment
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MakePayment.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.recipientId != null && message.hasOwnProperty("recipientId"))
                if (!$util.isInteger(message.recipientId) && !(message.recipientId && $util.isInteger(message.recipientId.low) && $util.isInteger(message.recipientId.high)))
                    return "recipientId: integer|Long expected";
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (typeof message.amount !== "number")
                    return "amount: number expected";
            if (message.note != null && message.hasOwnProperty("note"))
                if (!$util.isString(message.note))
                    return "note: string expected";
            return null;
        };

        /**
         * Creates a MakePayment message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof websocket_api.MakePayment
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {websocket_api.MakePayment} MakePayment
         */
        MakePayment.fromObject = function fromObject(object) {
            if (object instanceof $root.websocket_api.MakePayment)
                return object;
            var message = new $root.websocket_api.MakePayment();
            if (object.recipientId != null)
                if ($util.Long)
                    (message.recipientId = $util.Long.fromValue(object.recipientId)).unsigned = false;
                else if (typeof object.recipientId === "string")
                    message.recipientId = parseInt(object.recipientId, 10);
                else if (typeof object.recipientId === "number")
                    message.recipientId = object.recipientId;
                else if (typeof object.recipientId === "object")
                    message.recipientId = new $util.LongBits(object.recipientId.low >>> 0, object.recipientId.high >>> 0).toNumber();
            if (object.amount != null)
                message.amount = Number(object.amount);
            if (object.note != null)
                message.note = String(object.note);
            return message;
        };

        /**
         * Creates a plain object from a MakePayment message. Also converts values to other types if specified.
         * @function toObject
         * @memberof websocket_api.MakePayment
         * @static
         * @param {websocket_api.MakePayment} message MakePayment
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MakePayment.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.amount = 0;
                object.note = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.recipientId = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.recipientId = options.longs === String ? "0" : 0;
            }
            if (message.amount != null && message.hasOwnProperty("amount"))
                object.amount = options.json && !isFinite(message.amount) ? String(message.amount) : message.amount;
            if (message.note != null && message.hasOwnProperty("note"))
                object.note = message.note;
            if (message.recipientId != null && message.hasOwnProperty("recipientId"))
                if (typeof message.recipientId === "number")
                    object.recipientId = options.longs === String ? String(message.recipientId) : message.recipientId;
                else
                    object.recipientId = options.longs === String ? $util.Long.prototype.toString.call(message.recipientId) : options.longs === Number ? new $util.LongBits(message.recipientId.low >>> 0, message.recipientId.high >>> 0).toNumber() : message.recipientId;
            return object;
        };

        /**
         * Converts this MakePayment to JSON.
         * @function toJSON
         * @memberof websocket_api.MakePayment
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MakePayment.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MakePayment
         * @function getTypeUrl
         * @memberof websocket_api.MakePayment
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MakePayment.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/websocket_api.MakePayment";
        };

        return MakePayment;
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
