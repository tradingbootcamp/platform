import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace websocket_api. */
export namespace websocket_api {

    /** Properties of a ServerMessage. */
    interface IServerMessage {

        /** ServerMessage requestId */
        requestId?: (string|null);

        /** ServerMessage portfolioUpdated */
        portfolioUpdated?: (websocket_api.IPortfolio|null);

        /** ServerMessage portfolios */
        portfolios?: (websocket_api.IPortfolios|null);

        /** ServerMessage market */
        market?: (websocket_api.IMarket|null);

        /** ServerMessage marketSettled */
        marketSettled?: (websocket_api.IMarketSettled|null);

        /** ServerMessage orderCreated */
        orderCreated?: (websocket_api.IOrderCreated|null);

        /** ServerMessage ordersCancelled */
        ordersCancelled?: (websocket_api.IOrdersCancelled|null);

        /** ServerMessage transfers */
        transfers?: (websocket_api.ITransfers|null);

        /** ServerMessage transferCreated */
        transferCreated?: (websocket_api.ITransfer|null);

        /** ServerMessage out */
        out?: (websocket_api.IOut|null);

        /** ServerMessage authenticated */
        authenticated?: (websocket_api.IAuthenticated|null);

        /** ServerMessage requestFailed */
        requestFailed?: (websocket_api.IRequestFailed|null);

        /** ServerMessage accountCreated */
        accountCreated?: (websocket_api.IAccount|null);

        /** ServerMessage accounts */
        accounts?: (websocket_api.IAccounts|null);

        /** ServerMessage actingAs */
        actingAs?: (websocket_api.IActingAs|null);

        /** ServerMessage ownershipGiven */
        ownershipGiven?: (websocket_api.IOwnershipGiven|null);

        /** ServerMessage redeemed */
        redeemed?: (websocket_api.IRedeemed|null);

        /** ServerMessage orders */
        orders?: (websocket_api.IOrders|null);

        /** ServerMessage trades */
        trades?: (websocket_api.ITrades|null);
    }

    /** Represents a ServerMessage. */
    class ServerMessage implements IServerMessage {

        /**
         * Constructs a new ServerMessage.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IServerMessage);

        /** ServerMessage requestId. */
        public requestId: string;

        /** ServerMessage portfolioUpdated. */
        public portfolioUpdated?: (websocket_api.IPortfolio|null);

        /** ServerMessage portfolios. */
        public portfolios?: (websocket_api.IPortfolios|null);

        /** ServerMessage market. */
        public market?: (websocket_api.IMarket|null);

        /** ServerMessage marketSettled. */
        public marketSettled?: (websocket_api.IMarketSettled|null);

        /** ServerMessage orderCreated. */
        public orderCreated?: (websocket_api.IOrderCreated|null);

        /** ServerMessage ordersCancelled. */
        public ordersCancelled?: (websocket_api.IOrdersCancelled|null);

        /** ServerMessage transfers. */
        public transfers?: (websocket_api.ITransfers|null);

        /** ServerMessage transferCreated. */
        public transferCreated?: (websocket_api.ITransfer|null);

        /** ServerMessage out. */
        public out?: (websocket_api.IOut|null);

        /** ServerMessage authenticated. */
        public authenticated?: (websocket_api.IAuthenticated|null);

        /** ServerMessage requestFailed. */
        public requestFailed?: (websocket_api.IRequestFailed|null);

        /** ServerMessage accountCreated. */
        public accountCreated?: (websocket_api.IAccount|null);

        /** ServerMessage accounts. */
        public accounts?: (websocket_api.IAccounts|null);

        /** ServerMessage actingAs. */
        public actingAs?: (websocket_api.IActingAs|null);

        /** ServerMessage ownershipGiven. */
        public ownershipGiven?: (websocket_api.IOwnershipGiven|null);

        /** ServerMessage redeemed. */
        public redeemed?: (websocket_api.IRedeemed|null);

        /** ServerMessage orders. */
        public orders?: (websocket_api.IOrders|null);

        /** ServerMessage trades. */
        public trades?: (websocket_api.ITrades|null);

        /** ServerMessage message. */
        public message?: ("portfolioUpdated"|"portfolios"|"market"|"marketSettled"|"orderCreated"|"ordersCancelled"|"transfers"|"transferCreated"|"out"|"authenticated"|"requestFailed"|"accountCreated"|"accounts"|"actingAs"|"ownershipGiven"|"redeemed"|"orders"|"trades");

        /**
         * Creates a new ServerMessage instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ServerMessage instance
         */
        public static create(properties?: websocket_api.IServerMessage): websocket_api.ServerMessage;

        /**
         * Encodes the specified ServerMessage message. Does not implicitly {@link websocket_api.ServerMessage.verify|verify} messages.
         * @param message ServerMessage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IServerMessage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ServerMessage message, length delimited. Does not implicitly {@link websocket_api.ServerMessage.verify|verify} messages.
         * @param message ServerMessage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IServerMessage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ServerMessage message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ServerMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.ServerMessage;

        /**
         * Decodes a ServerMessage message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ServerMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.ServerMessage;

        /**
         * Verifies a ServerMessage message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ServerMessage message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ServerMessage
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.ServerMessage;

        /**
         * Creates a plain object from a ServerMessage message. Also converts values to other types if specified.
         * @param message ServerMessage
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.ServerMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ServerMessage to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ServerMessage
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an Authenticated. */
    interface IAuthenticated {

        /** Authenticated accountId */
        accountId?: (number|Long|null);
    }

    /** Represents an Authenticated. */
    class Authenticated implements IAuthenticated {

        /**
         * Constructs a new Authenticated.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IAuthenticated);

        /** Authenticated accountId. */
        public accountId: (number|Long);

        /**
         * Creates a new Authenticated instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Authenticated instance
         */
        public static create(properties?: websocket_api.IAuthenticated): websocket_api.Authenticated;

        /**
         * Encodes the specified Authenticated message. Does not implicitly {@link websocket_api.Authenticated.verify|verify} messages.
         * @param message Authenticated message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IAuthenticated, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Authenticated message, length delimited. Does not implicitly {@link websocket_api.Authenticated.verify|verify} messages.
         * @param message Authenticated message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IAuthenticated, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Authenticated message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Authenticated
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Authenticated;

        /**
         * Decodes an Authenticated message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Authenticated
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Authenticated;

        /**
         * Verifies an Authenticated message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Authenticated message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Authenticated
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Authenticated;

        /**
         * Creates a plain object from an Authenticated message. Also converts values to other types if specified.
         * @param message Authenticated
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Authenticated, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Authenticated to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Authenticated
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an ActingAs. */
    interface IActingAs {

        /** ActingAs accountId */
        accountId?: (number|Long|null);
    }

    /** Represents an ActingAs. */
    class ActingAs implements IActingAs {

        /**
         * Constructs a new ActingAs.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IActingAs);

        /** ActingAs accountId. */
        public accountId: (number|Long);

        /**
         * Creates a new ActingAs instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ActingAs instance
         */
        public static create(properties?: websocket_api.IActingAs): websocket_api.ActingAs;

        /**
         * Encodes the specified ActingAs message. Does not implicitly {@link websocket_api.ActingAs.verify|verify} messages.
         * @param message ActingAs message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IActingAs, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ActingAs message, length delimited. Does not implicitly {@link websocket_api.ActingAs.verify|verify} messages.
         * @param message ActingAs message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IActingAs, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an ActingAs message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ActingAs
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.ActingAs;

        /**
         * Decodes an ActingAs message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ActingAs
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.ActingAs;

        /**
         * Verifies an ActingAs message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an ActingAs message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ActingAs
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.ActingAs;

        /**
         * Creates a plain object from an ActingAs message. Also converts values to other types if specified.
         * @param message ActingAs
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.ActingAs, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ActingAs to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ActingAs
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Portfolios. */
    interface IPortfolios {

        /** Portfolios portfolios */
        portfolios?: (websocket_api.IPortfolio[]|null);

        /** Portfolios areNewOwnerships */
        areNewOwnerships?: (boolean|null);
    }

    /** Represents a Portfolios. */
    class Portfolios implements IPortfolios {

        /**
         * Constructs a new Portfolios.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IPortfolios);

        /** Portfolios portfolios. */
        public portfolios: websocket_api.IPortfolio[];

        /** Portfolios areNewOwnerships. */
        public areNewOwnerships: boolean;

        /**
         * Creates a new Portfolios instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Portfolios instance
         */
        public static create(properties?: websocket_api.IPortfolios): websocket_api.Portfolios;

        /**
         * Encodes the specified Portfolios message. Does not implicitly {@link websocket_api.Portfolios.verify|verify} messages.
         * @param message Portfolios message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IPortfolios, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Portfolios message, length delimited. Does not implicitly {@link websocket_api.Portfolios.verify|verify} messages.
         * @param message Portfolios message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IPortfolios, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Portfolios message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Portfolios
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Portfolios;

        /**
         * Decodes a Portfolios message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Portfolios
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Portfolios;

        /**
         * Verifies a Portfolios message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Portfolios message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Portfolios
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Portfolios;

        /**
         * Creates a plain object from a Portfolios message. Also converts values to other types if specified.
         * @param message Portfolios
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Portfolios, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Portfolios to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Portfolios
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an OwnershipGiven. */
    interface IOwnershipGiven {
    }

    /** Represents an OwnershipGiven. */
    class OwnershipGiven implements IOwnershipGiven {

        /**
         * Constructs a new OwnershipGiven.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IOwnershipGiven);

        /**
         * Creates a new OwnershipGiven instance using the specified properties.
         * @param [properties] Properties to set
         * @returns OwnershipGiven instance
         */
        public static create(properties?: websocket_api.IOwnershipGiven): websocket_api.OwnershipGiven;

        /**
         * Encodes the specified OwnershipGiven message. Does not implicitly {@link websocket_api.OwnershipGiven.verify|verify} messages.
         * @param message OwnershipGiven message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IOwnershipGiven, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified OwnershipGiven message, length delimited. Does not implicitly {@link websocket_api.OwnershipGiven.verify|verify} messages.
         * @param message OwnershipGiven message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IOwnershipGiven, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an OwnershipGiven message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns OwnershipGiven
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.OwnershipGiven;

        /**
         * Decodes an OwnershipGiven message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns OwnershipGiven
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.OwnershipGiven;

        /**
         * Verifies an OwnershipGiven message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an OwnershipGiven message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns OwnershipGiven
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.OwnershipGiven;

        /**
         * Creates a plain object from an OwnershipGiven message. Also converts values to other types if specified.
         * @param message OwnershipGiven
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.OwnershipGiven, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this OwnershipGiven to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for OwnershipGiven
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Transfers. */
    interface ITransfers {

        /** Transfers transfers */
        transfers?: (websocket_api.ITransfer[]|null);
    }

    /** Represents a Transfers. */
    class Transfers implements ITransfers {

        /**
         * Constructs a new Transfers.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.ITransfers);

        /** Transfers transfers. */
        public transfers: websocket_api.ITransfer[];

        /**
         * Creates a new Transfers instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Transfers instance
         */
        public static create(properties?: websocket_api.ITransfers): websocket_api.Transfers;

        /**
         * Encodes the specified Transfers message. Does not implicitly {@link websocket_api.Transfers.verify|verify} messages.
         * @param message Transfers message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.ITransfers, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Transfers message, length delimited. Does not implicitly {@link websocket_api.Transfers.verify|verify} messages.
         * @param message Transfers message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.ITransfers, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Transfers message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Transfers
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Transfers;

        /**
         * Decodes a Transfers message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Transfers
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Transfers;

        /**
         * Verifies a Transfers message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Transfers message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Transfers
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Transfers;

        /**
         * Creates a plain object from a Transfers message. Also converts values to other types if specified.
         * @param message Transfers
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Transfers, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Transfers to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Transfers
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an Accounts. */
    interface IAccounts {

        /** Accounts accounts */
        accounts?: (websocket_api.IAccount[]|null);
    }

    /** Represents an Accounts. */
    class Accounts implements IAccounts {

        /**
         * Constructs a new Accounts.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IAccounts);

        /** Accounts accounts. */
        public accounts: websocket_api.IAccount[];

        /**
         * Creates a new Accounts instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Accounts instance
         */
        public static create(properties?: websocket_api.IAccounts): websocket_api.Accounts;

        /**
         * Encodes the specified Accounts message. Does not implicitly {@link websocket_api.Accounts.verify|verify} messages.
         * @param message Accounts message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IAccounts, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Accounts message, length delimited. Does not implicitly {@link websocket_api.Accounts.verify|verify} messages.
         * @param message Accounts message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IAccounts, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Accounts message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Accounts
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Accounts;

        /**
         * Decodes an Accounts message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Accounts
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Accounts;

        /**
         * Verifies an Accounts message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Accounts message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Accounts
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Accounts;

        /**
         * Creates a plain object from an Accounts message. Also converts values to other types if specified.
         * @param message Accounts
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Accounts, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Accounts to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Accounts
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Portfolio. */
    interface IPortfolio {

        /** Portfolio accountId */
        accountId?: (number|Long|null);

        /** Portfolio totalBalance */
        totalBalance?: (number|null);

        /** Portfolio availableBalance */
        availableBalance?: (number|null);

        /** Portfolio marketExposures */
        marketExposures?: (websocket_api.Portfolio.IMarketExposure[]|null);

        /** Portfolio ownerCredits */
        ownerCredits?: (websocket_api.Portfolio.IOwnerCredit[]|null);
    }

    /** Represents a Portfolio. */
    class Portfolio implements IPortfolio {

        /**
         * Constructs a new Portfolio.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IPortfolio);

        /** Portfolio accountId. */
        public accountId: (number|Long);

        /** Portfolio totalBalance. */
        public totalBalance: number;

        /** Portfolio availableBalance. */
        public availableBalance: number;

        /** Portfolio marketExposures. */
        public marketExposures: websocket_api.Portfolio.IMarketExposure[];

        /** Portfolio ownerCredits. */
        public ownerCredits: websocket_api.Portfolio.IOwnerCredit[];

        /**
         * Creates a new Portfolio instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Portfolio instance
         */
        public static create(properties?: websocket_api.IPortfolio): websocket_api.Portfolio;

        /**
         * Encodes the specified Portfolio message. Does not implicitly {@link websocket_api.Portfolio.verify|verify} messages.
         * @param message Portfolio message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IPortfolio, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Portfolio message, length delimited. Does not implicitly {@link websocket_api.Portfolio.verify|verify} messages.
         * @param message Portfolio message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IPortfolio, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Portfolio message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Portfolio
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Portfolio;

        /**
         * Decodes a Portfolio message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Portfolio
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Portfolio;

        /**
         * Verifies a Portfolio message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Portfolio message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Portfolio
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Portfolio;

        /**
         * Creates a plain object from a Portfolio message. Also converts values to other types if specified.
         * @param message Portfolio
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Portfolio, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Portfolio to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Portfolio
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace Portfolio {

        /** Properties of a MarketExposure. */
        interface IMarketExposure {

            /** MarketExposure marketId */
            marketId?: (number|Long|null);

            /** MarketExposure position */
            position?: (number|null);

            /** MarketExposure totalBidSize */
            totalBidSize?: (number|null);

            /** MarketExposure totalOfferSize */
            totalOfferSize?: (number|null);

            /** MarketExposure totalBidValue */
            totalBidValue?: (number|null);

            /** MarketExposure totalOfferValue */
            totalOfferValue?: (number|null);
        }

        /** Represents a MarketExposure. */
        class MarketExposure implements IMarketExposure {

            /**
             * Constructs a new MarketExposure.
             * @param [properties] Properties to set
             */
            constructor(properties?: websocket_api.Portfolio.IMarketExposure);

            /** MarketExposure marketId. */
            public marketId: (number|Long);

            /** MarketExposure position. */
            public position: number;

            /** MarketExposure totalBidSize. */
            public totalBidSize: number;

            /** MarketExposure totalOfferSize. */
            public totalOfferSize: number;

            /** MarketExposure totalBidValue. */
            public totalBidValue: number;

            /** MarketExposure totalOfferValue. */
            public totalOfferValue: number;

            /**
             * Creates a new MarketExposure instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MarketExposure instance
             */
            public static create(properties?: websocket_api.Portfolio.IMarketExposure): websocket_api.Portfolio.MarketExposure;

            /**
             * Encodes the specified MarketExposure message. Does not implicitly {@link websocket_api.Portfolio.MarketExposure.verify|verify} messages.
             * @param message MarketExposure message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: websocket_api.Portfolio.IMarketExposure, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MarketExposure message, length delimited. Does not implicitly {@link websocket_api.Portfolio.MarketExposure.verify|verify} messages.
             * @param message MarketExposure message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: websocket_api.Portfolio.IMarketExposure, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MarketExposure message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MarketExposure
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Portfolio.MarketExposure;

            /**
             * Decodes a MarketExposure message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MarketExposure
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Portfolio.MarketExposure;

            /**
             * Verifies a MarketExposure message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MarketExposure message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MarketExposure
             */
            public static fromObject(object: { [k: string]: any }): websocket_api.Portfolio.MarketExposure;

            /**
             * Creates a plain object from a MarketExposure message. Also converts values to other types if specified.
             * @param message MarketExposure
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: websocket_api.Portfolio.MarketExposure, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MarketExposure to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for MarketExposure
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an OwnerCredit. */
        interface IOwnerCredit {

            /** OwnerCredit ownerId */
            ownerId?: (number|Long|null);

            /** OwnerCredit credit */
            credit?: (number|null);
        }

        /** Represents an OwnerCredit. */
        class OwnerCredit implements IOwnerCredit {

            /**
             * Constructs a new OwnerCredit.
             * @param [properties] Properties to set
             */
            constructor(properties?: websocket_api.Portfolio.IOwnerCredit);

            /** OwnerCredit ownerId. */
            public ownerId: (number|Long);

            /** OwnerCredit credit. */
            public credit: number;

            /**
             * Creates a new OwnerCredit instance using the specified properties.
             * @param [properties] Properties to set
             * @returns OwnerCredit instance
             */
            public static create(properties?: websocket_api.Portfolio.IOwnerCredit): websocket_api.Portfolio.OwnerCredit;

            /**
             * Encodes the specified OwnerCredit message. Does not implicitly {@link websocket_api.Portfolio.OwnerCredit.verify|verify} messages.
             * @param message OwnerCredit message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: websocket_api.Portfolio.IOwnerCredit, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified OwnerCredit message, length delimited. Does not implicitly {@link websocket_api.Portfolio.OwnerCredit.verify|verify} messages.
             * @param message OwnerCredit message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: websocket_api.Portfolio.IOwnerCredit, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an OwnerCredit message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns OwnerCredit
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Portfolio.OwnerCredit;

            /**
             * Decodes an OwnerCredit message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns OwnerCredit
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Portfolio.OwnerCredit;

            /**
             * Verifies an OwnerCredit message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an OwnerCredit message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns OwnerCredit
             */
            public static fromObject(object: { [k: string]: any }): websocket_api.Portfolio.OwnerCredit;

            /**
             * Creates a plain object from an OwnerCredit message. Also converts values to other types if specified.
             * @param message OwnerCredit
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: websocket_api.Portfolio.OwnerCredit, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this OwnerCredit to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for OwnerCredit
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Properties of a Market. */
    interface IMarket {

        /** Market id */
        id?: (number|Long|null);

        /** Market name */
        name?: (string|null);

        /** Market description */
        description?: (string|null);

        /** Market ownerId */
        ownerId?: (number|Long|null);

        /** Market transactionId */
        transactionId?: (number|Long|null);

        /** Market transactionTimestamp */
        transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /** Market minSettlement */
        minSettlement?: (number|null);

        /** Market maxSettlement */
        maxSettlement?: (number|null);

        /** Market redeemableFor */
        redeemableFor?: (websocket_api.IRedeemable[]|null);

        /** Market redeemFee */
        redeemFee?: (number|null);

        /** Market open */
        open?: (websocket_api.Market.IOpen|null);

        /** Market closed */
        closed?: (websocket_api.Market.IClosed|null);
    }

    /** Represents a Market. */
    class Market implements IMarket {

        /**
         * Constructs a new Market.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IMarket);

        /** Market id. */
        public id: (number|Long);

        /** Market name. */
        public name: string;

        /** Market description. */
        public description: string;

        /** Market ownerId. */
        public ownerId: (number|Long);

        /** Market transactionId. */
        public transactionId: (number|Long);

        /** Market transactionTimestamp. */
        public transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /** Market minSettlement. */
        public minSettlement: number;

        /** Market maxSettlement. */
        public maxSettlement: number;

        /** Market redeemableFor. */
        public redeemableFor: websocket_api.IRedeemable[];

        /** Market redeemFee. */
        public redeemFee: number;

        /** Market open. */
        public open?: (websocket_api.Market.IOpen|null);

        /** Market closed. */
        public closed?: (websocket_api.Market.IClosed|null);

        /** Market status. */
        public status?: ("open"|"closed");

        /**
         * Creates a new Market instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Market instance
         */
        public static create(properties?: websocket_api.IMarket): websocket_api.Market;

        /**
         * Encodes the specified Market message. Does not implicitly {@link websocket_api.Market.verify|verify} messages.
         * @param message Market message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IMarket, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Market message, length delimited. Does not implicitly {@link websocket_api.Market.verify|verify} messages.
         * @param message Market message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IMarket, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Market message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Market
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Market;

        /**
         * Decodes a Market message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Market
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Market;

        /**
         * Verifies a Market message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Market message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Market
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Market;

        /**
         * Creates a plain object from a Market message. Also converts values to other types if specified.
         * @param message Market
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Market, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Market to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Market
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace Market {

        /** Properties of an Open. */
        interface IOpen {
        }

        /** Represents an Open. */
        class Open implements IOpen {

            /**
             * Constructs a new Open.
             * @param [properties] Properties to set
             */
            constructor(properties?: websocket_api.Market.IOpen);

            /**
             * Creates a new Open instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Open instance
             */
            public static create(properties?: websocket_api.Market.IOpen): websocket_api.Market.Open;

            /**
             * Encodes the specified Open message. Does not implicitly {@link websocket_api.Market.Open.verify|verify} messages.
             * @param message Open message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: websocket_api.Market.IOpen, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Open message, length delimited. Does not implicitly {@link websocket_api.Market.Open.verify|verify} messages.
             * @param message Open message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: websocket_api.Market.IOpen, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Open message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Open
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Market.Open;

            /**
             * Decodes an Open message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Open
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Market.Open;

            /**
             * Verifies an Open message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Open message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Open
             */
            public static fromObject(object: { [k: string]: any }): websocket_api.Market.Open;

            /**
             * Creates a plain object from an Open message. Also converts values to other types if specified.
             * @param message Open
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: websocket_api.Market.Open, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Open to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Open
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Closed. */
        interface IClosed {

            /** Closed settlePrice */
            settlePrice?: (number|null);

            /** Closed transactionId */
            transactionId?: (number|Long|null);

            /** Closed transactionTimestamp */
            transactionTimestamp?: (google.protobuf.ITimestamp|null);
        }

        /** Represents a Closed. */
        class Closed implements IClosed {

            /**
             * Constructs a new Closed.
             * @param [properties] Properties to set
             */
            constructor(properties?: websocket_api.Market.IClosed);

            /** Closed settlePrice. */
            public settlePrice: number;

            /** Closed transactionId. */
            public transactionId: (number|Long);

            /** Closed transactionTimestamp. */
            public transactionTimestamp?: (google.protobuf.ITimestamp|null);

            /**
             * Creates a new Closed instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Closed instance
             */
            public static create(properties?: websocket_api.Market.IClosed): websocket_api.Market.Closed;

            /**
             * Encodes the specified Closed message. Does not implicitly {@link websocket_api.Market.Closed.verify|verify} messages.
             * @param message Closed message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: websocket_api.Market.IClosed, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Closed message, length delimited. Does not implicitly {@link websocket_api.Market.Closed.verify|verify} messages.
             * @param message Closed message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: websocket_api.Market.IClosed, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Closed message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Closed
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Market.Closed;

            /**
             * Decodes a Closed message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Closed
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Market.Closed;

            /**
             * Verifies a Closed message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Closed message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Closed
             */
            public static fromObject(object: { [k: string]: any }): websocket_api.Market.Closed;

            /**
             * Creates a plain object from a Closed message. Also converts values to other types if specified.
             * @param message Closed
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: websocket_api.Market.Closed, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Closed to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Closed
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Properties of a Redeemable. */
    interface IRedeemable {

        /** Redeemable constituentId */
        constituentId?: (number|Long|null);

        /** Redeemable multiplier */
        multiplier?: (number|Long|null);
    }

    /** Represents a Redeemable. */
    class Redeemable implements IRedeemable {

        /**
         * Constructs a new Redeemable.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IRedeemable);

        /** Redeemable constituentId. */
        public constituentId: (number|Long);

        /** Redeemable multiplier. */
        public multiplier: (number|Long);

        /**
         * Creates a new Redeemable instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Redeemable instance
         */
        public static create(properties?: websocket_api.IRedeemable): websocket_api.Redeemable;

        /**
         * Encodes the specified Redeemable message. Does not implicitly {@link websocket_api.Redeemable.verify|verify} messages.
         * @param message Redeemable message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IRedeemable, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Redeemable message, length delimited. Does not implicitly {@link websocket_api.Redeemable.verify|verify} messages.
         * @param message Redeemable message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IRedeemable, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Redeemable message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Redeemable
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Redeemable;

        /**
         * Decodes a Redeemable message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Redeemable
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Redeemable;

        /**
         * Verifies a Redeemable message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Redeemable message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Redeemable
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Redeemable;

        /**
         * Creates a plain object from a Redeemable message. Also converts values to other types if specified.
         * @param message Redeemable
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Redeemable, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Redeemable to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Redeemable
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MarketSettled. */
    interface IMarketSettled {

        /** MarketSettled id */
        id?: (number|Long|null);

        /** MarketSettled settlePrice */
        settlePrice?: (number|null);

        /** MarketSettled transactionId */
        transactionId?: (number|Long|null);

        /** MarketSettled transactionTimestamp */
        transactionTimestamp?: (google.protobuf.ITimestamp|null);
    }

    /** Represents a MarketSettled. */
    class MarketSettled implements IMarketSettled {

        /**
         * Constructs a new MarketSettled.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IMarketSettled);

        /** MarketSettled id. */
        public id: (number|Long);

        /** MarketSettled settlePrice. */
        public settlePrice: number;

        /** MarketSettled transactionId. */
        public transactionId: (number|Long);

        /** MarketSettled transactionTimestamp. */
        public transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /**
         * Creates a new MarketSettled instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MarketSettled instance
         */
        public static create(properties?: websocket_api.IMarketSettled): websocket_api.MarketSettled;

        /**
         * Encodes the specified MarketSettled message. Does not implicitly {@link websocket_api.MarketSettled.verify|verify} messages.
         * @param message MarketSettled message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IMarketSettled, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MarketSettled message, length delimited. Does not implicitly {@link websocket_api.MarketSettled.verify|verify} messages.
         * @param message MarketSettled message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IMarketSettled, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MarketSettled message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MarketSettled
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.MarketSettled;

        /**
         * Decodes a MarketSettled message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MarketSettled
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.MarketSettled;

        /**
         * Verifies a MarketSettled message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MarketSettled message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MarketSettled
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.MarketSettled;

        /**
         * Creates a plain object from a MarketSettled message. Also converts values to other types if specified.
         * @param message MarketSettled
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.MarketSettled, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MarketSettled to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MarketSettled
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an OrdersCancelled. */
    interface IOrdersCancelled {

        /** OrdersCancelled orderIds */
        orderIds?: ((number|Long)[]|null);

        /** OrdersCancelled marketId */
        marketId?: (number|Long|null);

        /** OrdersCancelled transactionId */
        transactionId?: (number|Long|null);

        /** OrdersCancelled transactionTimestamp */
        transactionTimestamp?: (google.protobuf.ITimestamp|null);
    }

    /** Represents an OrdersCancelled. */
    class OrdersCancelled implements IOrdersCancelled {

        /**
         * Constructs a new OrdersCancelled.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IOrdersCancelled);

        /** OrdersCancelled orderIds. */
        public orderIds: (number|Long)[];

        /** OrdersCancelled marketId. */
        public marketId: (number|Long);

        /** OrdersCancelled transactionId. */
        public transactionId: (number|Long);

        /** OrdersCancelled transactionTimestamp. */
        public transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /**
         * Creates a new OrdersCancelled instance using the specified properties.
         * @param [properties] Properties to set
         * @returns OrdersCancelled instance
         */
        public static create(properties?: websocket_api.IOrdersCancelled): websocket_api.OrdersCancelled;

        /**
         * Encodes the specified OrdersCancelled message. Does not implicitly {@link websocket_api.OrdersCancelled.verify|verify} messages.
         * @param message OrdersCancelled message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IOrdersCancelled, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified OrdersCancelled message, length delimited. Does not implicitly {@link websocket_api.OrdersCancelled.verify|verify} messages.
         * @param message OrdersCancelled message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IOrdersCancelled, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an OrdersCancelled message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns OrdersCancelled
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.OrdersCancelled;

        /**
         * Decodes an OrdersCancelled message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns OrdersCancelled
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.OrdersCancelled;

        /**
         * Verifies an OrdersCancelled message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an OrdersCancelled message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns OrdersCancelled
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.OrdersCancelled;

        /**
         * Creates a plain object from an OrdersCancelled message. Also converts values to other types if specified.
         * @param message OrdersCancelled
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.OrdersCancelled, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this OrdersCancelled to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for OrdersCancelled
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an OrderCreated. */
    interface IOrderCreated {

        /** OrderCreated marketId */
        marketId?: (number|Long|null);

        /** OrderCreated accountId */
        accountId?: (number|Long|null);

        /** OrderCreated order */
        order?: (websocket_api.IOrder|null);

        /** OrderCreated fills */
        fills?: (websocket_api.OrderCreated.IOrderFill[]|null);

        /** OrderCreated trades */
        trades?: (websocket_api.ITrade[]|null);

        /** OrderCreated transactionId */
        transactionId?: (number|Long|null);

        /** OrderCreated transactionTimestamp */
        transactionTimestamp?: (google.protobuf.ITimestamp|null);
    }

    /** Represents an OrderCreated. */
    class OrderCreated implements IOrderCreated {

        /**
         * Constructs a new OrderCreated.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IOrderCreated);

        /** OrderCreated marketId. */
        public marketId: (number|Long);

        /** OrderCreated accountId. */
        public accountId: (number|Long);

        /** OrderCreated order. */
        public order?: (websocket_api.IOrder|null);

        /** OrderCreated fills. */
        public fills: websocket_api.OrderCreated.IOrderFill[];

        /** OrderCreated trades. */
        public trades: websocket_api.ITrade[];

        /** OrderCreated transactionId. */
        public transactionId: (number|Long);

        /** OrderCreated transactionTimestamp. */
        public transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /** OrderCreated _order. */
        public _order?: "order";

        /**
         * Creates a new OrderCreated instance using the specified properties.
         * @param [properties] Properties to set
         * @returns OrderCreated instance
         */
        public static create(properties?: websocket_api.IOrderCreated): websocket_api.OrderCreated;

        /**
         * Encodes the specified OrderCreated message. Does not implicitly {@link websocket_api.OrderCreated.verify|verify} messages.
         * @param message OrderCreated message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IOrderCreated, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified OrderCreated message, length delimited. Does not implicitly {@link websocket_api.OrderCreated.verify|verify} messages.
         * @param message OrderCreated message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IOrderCreated, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an OrderCreated message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns OrderCreated
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.OrderCreated;

        /**
         * Decodes an OrderCreated message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns OrderCreated
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.OrderCreated;

        /**
         * Verifies an OrderCreated message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an OrderCreated message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns OrderCreated
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.OrderCreated;

        /**
         * Creates a plain object from an OrderCreated message. Also converts values to other types if specified.
         * @param message OrderCreated
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.OrderCreated, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this OrderCreated to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for OrderCreated
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace OrderCreated {

        /** Properties of an OrderFill. */
        interface IOrderFill {

            /** OrderFill id */
            id?: (number|Long|null);

            /** OrderFill marketId */
            marketId?: (number|Long|null);

            /** OrderFill ownerId */
            ownerId?: (number|Long|null);

            /** OrderFill sizeFilled */
            sizeFilled?: (number|null);

            /** OrderFill sizeRemaining */
            sizeRemaining?: (number|null);

            /** OrderFill price */
            price?: (number|null);

            /** OrderFill side */
            side?: (websocket_api.Side|null);
        }

        /** Represents an OrderFill. */
        class OrderFill implements IOrderFill {

            /**
             * Constructs a new OrderFill.
             * @param [properties] Properties to set
             */
            constructor(properties?: websocket_api.OrderCreated.IOrderFill);

            /** OrderFill id. */
            public id: (number|Long);

            /** OrderFill marketId. */
            public marketId: (number|Long);

            /** OrderFill ownerId. */
            public ownerId: (number|Long);

            /** OrderFill sizeFilled. */
            public sizeFilled: number;

            /** OrderFill sizeRemaining. */
            public sizeRemaining: number;

            /** OrderFill price. */
            public price: number;

            /** OrderFill side. */
            public side: websocket_api.Side;

            /**
             * Creates a new OrderFill instance using the specified properties.
             * @param [properties] Properties to set
             * @returns OrderFill instance
             */
            public static create(properties?: websocket_api.OrderCreated.IOrderFill): websocket_api.OrderCreated.OrderFill;

            /**
             * Encodes the specified OrderFill message. Does not implicitly {@link websocket_api.OrderCreated.OrderFill.verify|verify} messages.
             * @param message OrderFill message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: websocket_api.OrderCreated.IOrderFill, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified OrderFill message, length delimited. Does not implicitly {@link websocket_api.OrderCreated.OrderFill.verify|verify} messages.
             * @param message OrderFill message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: websocket_api.OrderCreated.IOrderFill, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an OrderFill message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns OrderFill
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.OrderCreated.OrderFill;

            /**
             * Decodes an OrderFill message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns OrderFill
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.OrderCreated.OrderFill;

            /**
             * Verifies an OrderFill message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an OrderFill message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns OrderFill
             */
            public static fromObject(object: { [k: string]: any }): websocket_api.OrderCreated.OrderFill;

            /**
             * Creates a plain object from an OrderFill message. Also converts values to other types if specified.
             * @param message OrderFill
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: websocket_api.OrderCreated.OrderFill, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this OrderFill to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for OrderFill
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Properties of an Order. */
    interface IOrder {

        /** Order id */
        id?: (number|Long|null);

        /** Order marketId */
        marketId?: (number|Long|null);

        /** Order ownerId */
        ownerId?: (number|Long|null);

        /** Order transactionId */
        transactionId?: (number|Long|null);

        /** Order transactionTimestamp */
        transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /** Order price */
        price?: (number|null);

        /** Order size */
        size?: (number|null);

        /** Order side */
        side?: (websocket_api.Side|null);

        /** Order sizes */
        sizes?: (websocket_api.ISize[]|null);
    }

    /** Represents an Order. */
    class Order implements IOrder {

        /**
         * Constructs a new Order.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IOrder);

        /** Order id. */
        public id: (number|Long);

        /** Order marketId. */
        public marketId: (number|Long);

        /** Order ownerId. */
        public ownerId: (number|Long);

        /** Order transactionId. */
        public transactionId: (number|Long);

        /** Order transactionTimestamp. */
        public transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /** Order price. */
        public price: number;

        /** Order size. */
        public size: number;

        /** Order side. */
        public side: websocket_api.Side;

        /** Order sizes. */
        public sizes: websocket_api.ISize[];

        /**
         * Creates a new Order instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Order instance
         */
        public static create(properties?: websocket_api.IOrder): websocket_api.Order;

        /**
         * Encodes the specified Order message. Does not implicitly {@link websocket_api.Order.verify|verify} messages.
         * @param message Order message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IOrder, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Order message, length delimited. Does not implicitly {@link websocket_api.Order.verify|verify} messages.
         * @param message Order message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IOrder, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Order message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Order
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Order;

        /**
         * Decodes an Order message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Order
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Order;

        /**
         * Verifies an Order message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Order message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Order
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Order;

        /**
         * Creates a plain object from an Order message. Also converts values to other types if specified.
         * @param message Order
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Order, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Order to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Order
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Size. */
    interface ISize {

        /** Size transactionId */
        transactionId?: (number|Long|null);

        /** Size transactionTimestamp */
        transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /** Size size */
        size?: (number|null);
    }

    /** Represents a Size. */
    class Size implements ISize {

        /**
         * Constructs a new Size.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.ISize);

        /** Size transactionId. */
        public transactionId: (number|Long);

        /** Size transactionTimestamp. */
        public transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /** Size size. */
        public size: number;

        /**
         * Creates a new Size instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Size instance
         */
        public static create(properties?: websocket_api.ISize): websocket_api.Size;

        /**
         * Encodes the specified Size message. Does not implicitly {@link websocket_api.Size.verify|verify} messages.
         * @param message Size message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.ISize, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Size message, length delimited. Does not implicitly {@link websocket_api.Size.verify|verify} messages.
         * @param message Size message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.ISize, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Size message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Size
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Size;

        /**
         * Decodes a Size message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Size
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Size;

        /**
         * Verifies a Size message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Size message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Size
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Size;

        /**
         * Creates a plain object from a Size message. Also converts values to other types if specified.
         * @param message Size
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Size, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Size to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Size
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Side enum. */
    enum Side {
        UNKNOWN = 0,
        BID = 1,
        OFFER = 2
    }

    /** Properties of a Trade. */
    interface ITrade {

        /** Trade id */
        id?: (number|Long|null);

        /** Trade marketId */
        marketId?: (number|Long|null);

        /** Trade transactionId */
        transactionId?: (number|Long|null);

        /** Trade transactionTimestamp */
        transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /** Trade price */
        price?: (number|null);

        /** Trade size */
        size?: (number|null);

        /** Trade buyerId */
        buyerId?: (number|Long|null);

        /** Trade sellerId */
        sellerId?: (number|Long|null);
    }

    /** Represents a Trade. */
    class Trade implements ITrade {

        /**
         * Constructs a new Trade.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.ITrade);

        /** Trade id. */
        public id: (number|Long);

        /** Trade marketId. */
        public marketId: (number|Long);

        /** Trade transactionId. */
        public transactionId: (number|Long);

        /** Trade transactionTimestamp. */
        public transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /** Trade price. */
        public price: number;

        /** Trade size. */
        public size: number;

        /** Trade buyerId. */
        public buyerId: (number|Long);

        /** Trade sellerId. */
        public sellerId: (number|Long);

        /**
         * Creates a new Trade instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Trade instance
         */
        public static create(properties?: websocket_api.ITrade): websocket_api.Trade;

        /**
         * Encodes the specified Trade message. Does not implicitly {@link websocket_api.Trade.verify|verify} messages.
         * @param message Trade message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.ITrade, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Trade message, length delimited. Does not implicitly {@link websocket_api.Trade.verify|verify} messages.
         * @param message Trade message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.ITrade, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Trade message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Trade
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Trade;

        /**
         * Decodes a Trade message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Trade
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Trade;

        /**
         * Verifies a Trade message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Trade message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Trade
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Trade;

        /**
         * Creates a plain object from a Trade message. Also converts values to other types if specified.
         * @param message Trade
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Trade, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Trade to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Trade
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Transfer. */
    interface ITransfer {

        /** Transfer id */
        id?: (number|Long|null);

        /** Transfer initiatorId */
        initiatorId?: (number|Long|null);

        /** Transfer fromAccountId */
        fromAccountId?: (number|Long|null);

        /** Transfer toAccountId */
        toAccountId?: (number|Long|null);

        /** Transfer transactionId */
        transactionId?: (number|Long|null);

        /** Transfer transactionTimestamp */
        transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /** Transfer amount */
        amount?: (number|null);

        /** Transfer note */
        note?: (string|null);
    }

    /** Represents a Transfer. */
    class Transfer implements ITransfer {

        /**
         * Constructs a new Transfer.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.ITransfer);

        /** Transfer id. */
        public id: (number|Long);

        /** Transfer initiatorId. */
        public initiatorId: (number|Long);

        /** Transfer fromAccountId. */
        public fromAccountId: (number|Long);

        /** Transfer toAccountId. */
        public toAccountId: (number|Long);

        /** Transfer transactionId. */
        public transactionId: (number|Long);

        /** Transfer transactionTimestamp. */
        public transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /** Transfer amount. */
        public amount: number;

        /** Transfer note. */
        public note: string;

        /**
         * Creates a new Transfer instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Transfer instance
         */
        public static create(properties?: websocket_api.ITransfer): websocket_api.Transfer;

        /**
         * Encodes the specified Transfer message. Does not implicitly {@link websocket_api.Transfer.verify|verify} messages.
         * @param message Transfer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.ITransfer, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Transfer message, length delimited. Does not implicitly {@link websocket_api.Transfer.verify|verify} messages.
         * @param message Transfer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.ITransfer, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Transfer message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Transfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Transfer;

        /**
         * Decodes a Transfer message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Transfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Transfer;

        /**
         * Verifies a Transfer message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Transfer message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Transfer
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Transfer;

        /**
         * Creates a plain object from a Transfer message. Also converts values to other types if specified.
         * @param message Transfer
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Transfer, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Transfer to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Transfer
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a RequestFailed. */
    interface IRequestFailed {

        /** RequestFailed requestDetails */
        requestDetails?: (websocket_api.RequestFailed.IRequestDetails|null);

        /** RequestFailed errorDetails */
        errorDetails?: (websocket_api.RequestFailed.IErrorDetails|null);
    }

    /** Represents a RequestFailed. */
    class RequestFailed implements IRequestFailed {

        /**
         * Constructs a new RequestFailed.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IRequestFailed);

        /** RequestFailed requestDetails. */
        public requestDetails?: (websocket_api.RequestFailed.IRequestDetails|null);

        /** RequestFailed errorDetails. */
        public errorDetails?: (websocket_api.RequestFailed.IErrorDetails|null);

        /**
         * Creates a new RequestFailed instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RequestFailed instance
         */
        public static create(properties?: websocket_api.IRequestFailed): websocket_api.RequestFailed;

        /**
         * Encodes the specified RequestFailed message. Does not implicitly {@link websocket_api.RequestFailed.verify|verify} messages.
         * @param message RequestFailed message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IRequestFailed, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RequestFailed message, length delimited. Does not implicitly {@link websocket_api.RequestFailed.verify|verify} messages.
         * @param message RequestFailed message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IRequestFailed, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RequestFailed message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RequestFailed
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.RequestFailed;

        /**
         * Decodes a RequestFailed message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RequestFailed
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.RequestFailed;

        /**
         * Verifies a RequestFailed message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RequestFailed message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RequestFailed
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.RequestFailed;

        /**
         * Creates a plain object from a RequestFailed message. Also converts values to other types if specified.
         * @param message RequestFailed
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.RequestFailed, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RequestFailed to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RequestFailed
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace RequestFailed {

        /** Properties of a RequestDetails. */
        interface IRequestDetails {

            /** RequestDetails kind */
            kind?: (string|null);
        }

        /** Represents a RequestDetails. */
        class RequestDetails implements IRequestDetails {

            /**
             * Constructs a new RequestDetails.
             * @param [properties] Properties to set
             */
            constructor(properties?: websocket_api.RequestFailed.IRequestDetails);

            /** RequestDetails kind. */
            public kind: string;

            /**
             * Creates a new RequestDetails instance using the specified properties.
             * @param [properties] Properties to set
             * @returns RequestDetails instance
             */
            public static create(properties?: websocket_api.RequestFailed.IRequestDetails): websocket_api.RequestFailed.RequestDetails;

            /**
             * Encodes the specified RequestDetails message. Does not implicitly {@link websocket_api.RequestFailed.RequestDetails.verify|verify} messages.
             * @param message RequestDetails message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: websocket_api.RequestFailed.IRequestDetails, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified RequestDetails message, length delimited. Does not implicitly {@link websocket_api.RequestFailed.RequestDetails.verify|verify} messages.
             * @param message RequestDetails message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: websocket_api.RequestFailed.IRequestDetails, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a RequestDetails message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns RequestDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.RequestFailed.RequestDetails;

            /**
             * Decodes a RequestDetails message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns RequestDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.RequestFailed.RequestDetails;

            /**
             * Verifies a RequestDetails message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a RequestDetails message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns RequestDetails
             */
            public static fromObject(object: { [k: string]: any }): websocket_api.RequestFailed.RequestDetails;

            /**
             * Creates a plain object from a RequestDetails message. Also converts values to other types if specified.
             * @param message RequestDetails
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: websocket_api.RequestFailed.RequestDetails, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this RequestDetails to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for RequestDetails
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an ErrorDetails. */
        interface IErrorDetails {

            /** ErrorDetails message */
            message?: (string|null);
        }

        /** Represents an ErrorDetails. */
        class ErrorDetails implements IErrorDetails {

            /**
             * Constructs a new ErrorDetails.
             * @param [properties] Properties to set
             */
            constructor(properties?: websocket_api.RequestFailed.IErrorDetails);

            /** ErrorDetails message. */
            public message: string;

            /**
             * Creates a new ErrorDetails instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ErrorDetails instance
             */
            public static create(properties?: websocket_api.RequestFailed.IErrorDetails): websocket_api.RequestFailed.ErrorDetails;

            /**
             * Encodes the specified ErrorDetails message. Does not implicitly {@link websocket_api.RequestFailed.ErrorDetails.verify|verify} messages.
             * @param message ErrorDetails message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: websocket_api.RequestFailed.IErrorDetails, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ErrorDetails message, length delimited. Does not implicitly {@link websocket_api.RequestFailed.ErrorDetails.verify|verify} messages.
             * @param message ErrorDetails message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: websocket_api.RequestFailed.IErrorDetails, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ErrorDetails message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ErrorDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.RequestFailed.ErrorDetails;

            /**
             * Decodes an ErrorDetails message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ErrorDetails
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.RequestFailed.ErrorDetails;

            /**
             * Verifies an ErrorDetails message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an ErrorDetails message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ErrorDetails
             */
            public static fromObject(object: { [k: string]: any }): websocket_api.RequestFailed.ErrorDetails;

            /**
             * Creates a plain object from an ErrorDetails message. Also converts values to other types if specified.
             * @param message ErrorDetails
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: websocket_api.RequestFailed.ErrorDetails, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ErrorDetails to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ErrorDetails
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Properties of an Out. */
    interface IOut {

        /** Out marketId */
        marketId?: (number|Long|null);
    }

    /** Represents an Out. */
    class Out implements IOut {

        /**
         * Constructs a new Out.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IOut);

        /** Out marketId. */
        public marketId: (number|Long);

        /**
         * Creates a new Out instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Out instance
         */
        public static create(properties?: websocket_api.IOut): websocket_api.Out;

        /**
         * Encodes the specified Out message. Does not implicitly {@link websocket_api.Out.verify|verify} messages.
         * @param message Out message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IOut, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Out message, length delimited. Does not implicitly {@link websocket_api.Out.verify|verify} messages.
         * @param message Out message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IOut, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Out message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Out
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Out;

        /**
         * Decodes an Out message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Out
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Out;

        /**
         * Verifies an Out message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Out message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Out
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Out;

        /**
         * Creates a plain object from an Out message. Also converts values to other types if specified.
         * @param message Out
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Out, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Out to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Out
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an Account. */
    interface IAccount {

        /** Account id */
        id?: (number|Long|null);

        /** Account name */
        name?: (string|null);

        /** Account isUser */
        isUser?: (boolean|null);
    }

    /** Represents an Account. */
    class Account implements IAccount {

        /**
         * Constructs a new Account.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IAccount);

        /** Account id. */
        public id: (number|Long);

        /** Account name. */
        public name: string;

        /** Account isUser. */
        public isUser: boolean;

        /**
         * Creates a new Account instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Account instance
         */
        public static create(properties?: websocket_api.IAccount): websocket_api.Account;

        /**
         * Encodes the specified Account message. Does not implicitly {@link websocket_api.Account.verify|verify} messages.
         * @param message Account message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IAccount, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Account message, length delimited. Does not implicitly {@link websocket_api.Account.verify|verify} messages.
         * @param message Account message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IAccount, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Account message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Account
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Account;

        /**
         * Decodes an Account message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Account
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Account;

        /**
         * Verifies an Account message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Account message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Account
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Account;

        /**
         * Creates a plain object from an Account message. Also converts values to other types if specified.
         * @param message Account
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Account, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Account to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Account
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Redeem. */
    interface IRedeem {

        /** Redeem fundId */
        fundId?: (number|Long|null);

        /** Redeem amount */
        amount?: (number|null);
    }

    /** Represents a Redeem. */
    class Redeem implements IRedeem {

        /**
         * Constructs a new Redeem.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IRedeem);

        /** Redeem fundId. */
        public fundId: (number|Long);

        /** Redeem amount. */
        public amount: number;

        /**
         * Creates a new Redeem instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Redeem instance
         */
        public static create(properties?: websocket_api.IRedeem): websocket_api.Redeem;

        /**
         * Encodes the specified Redeem message. Does not implicitly {@link websocket_api.Redeem.verify|verify} messages.
         * @param message Redeem message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IRedeem, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Redeem message, length delimited. Does not implicitly {@link websocket_api.Redeem.verify|verify} messages.
         * @param message Redeem message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IRedeem, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Redeem message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Redeem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Redeem;

        /**
         * Decodes a Redeem message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Redeem
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Redeem;

        /**
         * Verifies a Redeem message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Redeem message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Redeem
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Redeem;

        /**
         * Creates a plain object from a Redeem message. Also converts values to other types if specified.
         * @param message Redeem
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Redeem, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Redeem to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Redeem
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Redeemed. */
    interface IRedeemed {

        /** Redeemed transactionId */
        transactionId?: (number|Long|null);

        /** Redeemed transactionTimestamp */
        transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /** Redeemed accountId */
        accountId?: (number|Long|null);

        /** Redeemed fundId */
        fundId?: (number|Long|null);

        /** Redeemed amount */
        amount?: (number|null);
    }

    /** Represents a Redeemed. */
    class Redeemed implements IRedeemed {

        /**
         * Constructs a new Redeemed.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IRedeemed);

        /** Redeemed transactionId. */
        public transactionId: (number|Long);

        /** Redeemed transactionTimestamp. */
        public transactionTimestamp?: (google.protobuf.ITimestamp|null);

        /** Redeemed accountId. */
        public accountId: (number|Long);

        /** Redeemed fundId. */
        public fundId: (number|Long);

        /** Redeemed amount. */
        public amount: number;

        /**
         * Creates a new Redeemed instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Redeemed instance
         */
        public static create(properties?: websocket_api.IRedeemed): websocket_api.Redeemed;

        /**
         * Encodes the specified Redeemed message. Does not implicitly {@link websocket_api.Redeemed.verify|verify} messages.
         * @param message Redeemed message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IRedeemed, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Redeemed message, length delimited. Does not implicitly {@link websocket_api.Redeemed.verify|verify} messages.
         * @param message Redeemed message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IRedeemed, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Redeemed message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Redeemed
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Redeemed;

        /**
         * Decodes a Redeemed message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Redeemed
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Redeemed;

        /**
         * Verifies a Redeemed message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Redeemed message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Redeemed
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Redeemed;

        /**
         * Creates a plain object from a Redeemed message. Also converts values to other types if specified.
         * @param message Redeemed
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Redeemed, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Redeemed to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Redeemed
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an Orders. */
    interface IOrders {

        /** Orders marketId */
        marketId?: (number|Long|null);

        /** Orders orders */
        orders?: (websocket_api.IOrder[]|null);

        /** Orders hasFullHistory */
        hasFullHistory?: (boolean|null);
    }

    /** Represents an Orders. */
    class Orders implements IOrders {

        /**
         * Constructs a new Orders.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IOrders);

        /** Orders marketId. */
        public marketId: (number|Long);

        /** Orders orders. */
        public orders: websocket_api.IOrder[];

        /** Orders hasFullHistory. */
        public hasFullHistory: boolean;

        /**
         * Creates a new Orders instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Orders instance
         */
        public static create(properties?: websocket_api.IOrders): websocket_api.Orders;

        /**
         * Encodes the specified Orders message. Does not implicitly {@link websocket_api.Orders.verify|verify} messages.
         * @param message Orders message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IOrders, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Orders message, length delimited. Does not implicitly {@link websocket_api.Orders.verify|verify} messages.
         * @param message Orders message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IOrders, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Orders message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Orders
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Orders;

        /**
         * Decodes an Orders message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Orders
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Orders;

        /**
         * Verifies an Orders message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Orders message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Orders
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Orders;

        /**
         * Creates a plain object from an Orders message. Also converts values to other types if specified.
         * @param message Orders
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Orders, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Orders to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Orders
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Trades. */
    interface ITrades {

        /** Trades marketId */
        marketId?: (number|Long|null);

        /** Trades trades */
        trades?: (websocket_api.ITrade[]|null);

        /** Trades hasFullHistory */
        hasFullHistory?: (boolean|null);
    }

    /** Represents a Trades. */
    class Trades implements ITrades {

        /**
         * Constructs a new Trades.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.ITrades);

        /** Trades marketId. */
        public marketId: (number|Long);

        /** Trades trades. */
        public trades: websocket_api.ITrade[];

        /** Trades hasFullHistory. */
        public hasFullHistory: boolean;

        /**
         * Creates a new Trades instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Trades instance
         */
        public static create(properties?: websocket_api.ITrades): websocket_api.Trades;

        /**
         * Encodes the specified Trades message. Does not implicitly {@link websocket_api.Trades.verify|verify} messages.
         * @param message Trades message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.ITrades, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Trades message, length delimited. Does not implicitly {@link websocket_api.Trades.verify|verify} messages.
         * @param message Trades message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.ITrades, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Trades message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Trades
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Trades;

        /**
         * Decodes a Trades message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Trades
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Trades;

        /**
         * Verifies a Trades message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Trades message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Trades
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Trades;

        /**
         * Creates a plain object from a Trades message. Also converts values to other types if specified.
         * @param message Trades
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Trades, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Trades to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Trades
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ClientMessage. */
    interface IClientMessage {

        /** ClientMessage requestId */
        requestId?: (string|null);

        /** ClientMessage createMarket */
        createMarket?: (websocket_api.ICreateMarket|null);

        /** ClientMessage settleMarket */
        settleMarket?: (websocket_api.ISettleMarket|null);

        /** ClientMessage createOrder */
        createOrder?: (websocket_api.ICreateOrder|null);

        /** ClientMessage cancelOrder */
        cancelOrder?: (websocket_api.ICancelOrder|null);

        /** ClientMessage out */
        out?: (websocket_api.IOut|null);

        /** ClientMessage makeTransfer */
        makeTransfer?: (websocket_api.IMakeTransfer|null);

        /** ClientMessage authenticate */
        authenticate?: (websocket_api.IAuthenticate|null);

        /** ClientMessage actAs */
        actAs?: (websocket_api.IActAs|null);

        /** ClientMessage createAccount */
        createAccount?: (websocket_api.ICreateAccount|null);

        /** ClientMessage shareOwnership */
        shareOwnership?: (websocket_api.IShareOwnership|null);

        /** ClientMessage getFullOrderHistory */
        getFullOrderHistory?: (websocket_api.IGetFullOrderHistory|null);

        /** ClientMessage getFullTradeHistory */
        getFullTradeHistory?: (websocket_api.IGetFullTradeHistory|null);

        /** ClientMessage redeem */
        redeem?: (websocket_api.IRedeem|null);
    }

    /** Represents a ClientMessage. */
    class ClientMessage implements IClientMessage {

        /**
         * Constructs a new ClientMessage.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IClientMessage);

        /** ClientMessage requestId. */
        public requestId: string;

        /** ClientMessage createMarket. */
        public createMarket?: (websocket_api.ICreateMarket|null);

        /** ClientMessage settleMarket. */
        public settleMarket?: (websocket_api.ISettleMarket|null);

        /** ClientMessage createOrder. */
        public createOrder?: (websocket_api.ICreateOrder|null);

        /** ClientMessage cancelOrder. */
        public cancelOrder?: (websocket_api.ICancelOrder|null);

        /** ClientMessage out. */
        public out?: (websocket_api.IOut|null);

        /** ClientMessage makeTransfer. */
        public makeTransfer?: (websocket_api.IMakeTransfer|null);

        /** ClientMessage authenticate. */
        public authenticate?: (websocket_api.IAuthenticate|null);

        /** ClientMessage actAs. */
        public actAs?: (websocket_api.IActAs|null);

        /** ClientMessage createAccount. */
        public createAccount?: (websocket_api.ICreateAccount|null);

        /** ClientMessage shareOwnership. */
        public shareOwnership?: (websocket_api.IShareOwnership|null);

        /** ClientMessage getFullOrderHistory. */
        public getFullOrderHistory?: (websocket_api.IGetFullOrderHistory|null);

        /** ClientMessage getFullTradeHistory. */
        public getFullTradeHistory?: (websocket_api.IGetFullTradeHistory|null);

        /** ClientMessage redeem. */
        public redeem?: (websocket_api.IRedeem|null);

        /** ClientMessage message. */
        public message?: ("createMarket"|"settleMarket"|"createOrder"|"cancelOrder"|"out"|"makeTransfer"|"authenticate"|"actAs"|"createAccount"|"shareOwnership"|"getFullOrderHistory"|"getFullTradeHistory"|"redeem");

        /**
         * Creates a new ClientMessage instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ClientMessage instance
         */
        public static create(properties?: websocket_api.IClientMessage): websocket_api.ClientMessage;

        /**
         * Encodes the specified ClientMessage message. Does not implicitly {@link websocket_api.ClientMessage.verify|verify} messages.
         * @param message ClientMessage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IClientMessage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ClientMessage message, length delimited. Does not implicitly {@link websocket_api.ClientMessage.verify|verify} messages.
         * @param message ClientMessage message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IClientMessage, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ClientMessage message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ClientMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.ClientMessage;

        /**
         * Decodes a ClientMessage message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ClientMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.ClientMessage;

        /**
         * Verifies a ClientMessage message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ClientMessage message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ClientMessage
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.ClientMessage;

        /**
         * Creates a plain object from a ClientMessage message. Also converts values to other types if specified.
         * @param message ClientMessage
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.ClientMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ClientMessage to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ClientMessage
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a GetFullOrderHistory. */
    interface IGetFullOrderHistory {

        /** GetFullOrderHistory marketId */
        marketId?: (number|Long|null);
    }

    /** Represents a GetFullOrderHistory. */
    class GetFullOrderHistory implements IGetFullOrderHistory {

        /**
         * Constructs a new GetFullOrderHistory.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IGetFullOrderHistory);

        /** GetFullOrderHistory marketId. */
        public marketId: (number|Long);

        /**
         * Creates a new GetFullOrderHistory instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetFullOrderHistory instance
         */
        public static create(properties?: websocket_api.IGetFullOrderHistory): websocket_api.GetFullOrderHistory;

        /**
         * Encodes the specified GetFullOrderHistory message. Does not implicitly {@link websocket_api.GetFullOrderHistory.verify|verify} messages.
         * @param message GetFullOrderHistory message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IGetFullOrderHistory, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetFullOrderHistory message, length delimited. Does not implicitly {@link websocket_api.GetFullOrderHistory.verify|verify} messages.
         * @param message GetFullOrderHistory message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IGetFullOrderHistory, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetFullOrderHistory message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetFullOrderHistory
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.GetFullOrderHistory;

        /**
         * Decodes a GetFullOrderHistory message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetFullOrderHistory
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.GetFullOrderHistory;

        /**
         * Verifies a GetFullOrderHistory message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetFullOrderHistory message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetFullOrderHistory
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.GetFullOrderHistory;

        /**
         * Creates a plain object from a GetFullOrderHistory message. Also converts values to other types if specified.
         * @param message GetFullOrderHistory
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.GetFullOrderHistory, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetFullOrderHistory to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetFullOrderHistory
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a GetFullTradeHistory. */
    interface IGetFullTradeHistory {

        /** GetFullTradeHistory marketId */
        marketId?: (number|Long|null);
    }

    /** Represents a GetFullTradeHistory. */
    class GetFullTradeHistory implements IGetFullTradeHistory {

        /**
         * Constructs a new GetFullTradeHistory.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IGetFullTradeHistory);

        /** GetFullTradeHistory marketId. */
        public marketId: (number|Long);

        /**
         * Creates a new GetFullTradeHistory instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetFullTradeHistory instance
         */
        public static create(properties?: websocket_api.IGetFullTradeHistory): websocket_api.GetFullTradeHistory;

        /**
         * Encodes the specified GetFullTradeHistory message. Does not implicitly {@link websocket_api.GetFullTradeHistory.verify|verify} messages.
         * @param message GetFullTradeHistory message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IGetFullTradeHistory, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetFullTradeHistory message, length delimited. Does not implicitly {@link websocket_api.GetFullTradeHistory.verify|verify} messages.
         * @param message GetFullTradeHistory message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IGetFullTradeHistory, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetFullTradeHistory message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetFullTradeHistory
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.GetFullTradeHistory;

        /**
         * Decodes a GetFullTradeHistory message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetFullTradeHistory
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.GetFullTradeHistory;

        /**
         * Verifies a GetFullTradeHistory message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetFullTradeHistory message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetFullTradeHistory
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.GetFullTradeHistory;

        /**
         * Creates a plain object from a GetFullTradeHistory message. Also converts values to other types if specified.
         * @param message GetFullTradeHistory
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.GetFullTradeHistory, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetFullTradeHistory to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for GetFullTradeHistory
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CancelOrder. */
    interface ICancelOrder {

        /** CancelOrder id */
        id?: (number|Long|null);
    }

    /** Represents a CancelOrder. */
    class CancelOrder implements ICancelOrder {

        /**
         * Constructs a new CancelOrder.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.ICancelOrder);

        /** CancelOrder id. */
        public id: (number|Long);

        /**
         * Creates a new CancelOrder instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CancelOrder instance
         */
        public static create(properties?: websocket_api.ICancelOrder): websocket_api.CancelOrder;

        /**
         * Encodes the specified CancelOrder message. Does not implicitly {@link websocket_api.CancelOrder.verify|verify} messages.
         * @param message CancelOrder message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.ICancelOrder, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CancelOrder message, length delimited. Does not implicitly {@link websocket_api.CancelOrder.verify|verify} messages.
         * @param message CancelOrder message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.ICancelOrder, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CancelOrder message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CancelOrder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.CancelOrder;

        /**
         * Decodes a CancelOrder message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CancelOrder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.CancelOrder;

        /**
         * Verifies a CancelOrder message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CancelOrder message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CancelOrder
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.CancelOrder;

        /**
         * Creates a plain object from a CancelOrder message. Also converts values to other types if specified.
         * @param message CancelOrder
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.CancelOrder, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CancelOrder to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CancelOrder
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an Authenticate. */
    interface IAuthenticate {

        /** Authenticate jwt */
        jwt?: (string|null);

        /** Authenticate idJwt */
        idJwt?: (string|null);

        /** Authenticate actAs */
        actAs?: (number|Long|null);
    }

    /** Represents an Authenticate. */
    class Authenticate implements IAuthenticate {

        /**
         * Constructs a new Authenticate.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IAuthenticate);

        /** Authenticate jwt. */
        public jwt: string;

        /** Authenticate idJwt. */
        public idJwt: string;

        /** Authenticate actAs. */
        public actAs: (number|Long);

        /**
         * Creates a new Authenticate instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Authenticate instance
         */
        public static create(properties?: websocket_api.IAuthenticate): websocket_api.Authenticate;

        /**
         * Encodes the specified Authenticate message. Does not implicitly {@link websocket_api.Authenticate.verify|verify} messages.
         * @param message Authenticate message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IAuthenticate, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Authenticate message, length delimited. Does not implicitly {@link websocket_api.Authenticate.verify|verify} messages.
         * @param message Authenticate message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IAuthenticate, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Authenticate message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Authenticate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.Authenticate;

        /**
         * Decodes an Authenticate message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Authenticate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.Authenticate;

        /**
         * Verifies an Authenticate message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Authenticate message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Authenticate
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.Authenticate;

        /**
         * Creates a plain object from an Authenticate message. Also converts values to other types if specified.
         * @param message Authenticate
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.Authenticate, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Authenticate to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Authenticate
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an ActAs. */
    interface IActAs {

        /** ActAs accountId */
        accountId?: (number|Long|null);
    }

    /** Represents an ActAs. */
    class ActAs implements IActAs {

        /**
         * Constructs a new ActAs.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IActAs);

        /** ActAs accountId. */
        public accountId: (number|Long);

        /**
         * Creates a new ActAs instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ActAs instance
         */
        public static create(properties?: websocket_api.IActAs): websocket_api.ActAs;

        /**
         * Encodes the specified ActAs message. Does not implicitly {@link websocket_api.ActAs.verify|verify} messages.
         * @param message ActAs message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IActAs, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ActAs message, length delimited. Does not implicitly {@link websocket_api.ActAs.verify|verify} messages.
         * @param message ActAs message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IActAs, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an ActAs message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ActAs
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.ActAs;

        /**
         * Decodes an ActAs message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ActAs
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.ActAs;

        /**
         * Verifies an ActAs message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an ActAs message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ActAs
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.ActAs;

        /**
         * Creates a plain object from an ActAs message. Also converts values to other types if specified.
         * @param message ActAs
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.ActAs, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ActAs to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ActAs
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CreateAccount. */
    interface ICreateAccount {

        /** CreateAccount ownerId */
        ownerId?: (number|Long|null);

        /** CreateAccount name */
        name?: (string|null);
    }

    /** Represents a CreateAccount. */
    class CreateAccount implements ICreateAccount {

        /**
         * Constructs a new CreateAccount.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.ICreateAccount);

        /** CreateAccount ownerId. */
        public ownerId: (number|Long);

        /** CreateAccount name. */
        public name: string;

        /**
         * Creates a new CreateAccount instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateAccount instance
         */
        public static create(properties?: websocket_api.ICreateAccount): websocket_api.CreateAccount;

        /**
         * Encodes the specified CreateAccount message. Does not implicitly {@link websocket_api.CreateAccount.verify|verify} messages.
         * @param message CreateAccount message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.ICreateAccount, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateAccount message, length delimited. Does not implicitly {@link websocket_api.CreateAccount.verify|verify} messages.
         * @param message CreateAccount message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.ICreateAccount, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateAccount message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateAccount
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.CreateAccount;

        /**
         * Decodes a CreateAccount message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateAccount
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.CreateAccount;

        /**
         * Verifies a CreateAccount message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateAccount message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateAccount
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.CreateAccount;

        /**
         * Creates a plain object from a CreateAccount message. Also converts values to other types if specified.
         * @param message CreateAccount
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.CreateAccount, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateAccount to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateAccount
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ShareOwnership. */
    interface IShareOwnership {

        /** ShareOwnership ofAccountId */
        ofAccountId?: (number|Long|null);

        /** ShareOwnership toAccountId */
        toAccountId?: (number|Long|null);
    }

    /** Represents a ShareOwnership. */
    class ShareOwnership implements IShareOwnership {

        /**
         * Constructs a new ShareOwnership.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IShareOwnership);

        /** ShareOwnership ofAccountId. */
        public ofAccountId: (number|Long);

        /** ShareOwnership toAccountId. */
        public toAccountId: (number|Long);

        /**
         * Creates a new ShareOwnership instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ShareOwnership instance
         */
        public static create(properties?: websocket_api.IShareOwnership): websocket_api.ShareOwnership;

        /**
         * Encodes the specified ShareOwnership message. Does not implicitly {@link websocket_api.ShareOwnership.verify|verify} messages.
         * @param message ShareOwnership message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IShareOwnership, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ShareOwnership message, length delimited. Does not implicitly {@link websocket_api.ShareOwnership.verify|verify} messages.
         * @param message ShareOwnership message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IShareOwnership, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ShareOwnership message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ShareOwnership
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.ShareOwnership;

        /**
         * Decodes a ShareOwnership message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ShareOwnership
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.ShareOwnership;

        /**
         * Verifies a ShareOwnership message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ShareOwnership message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ShareOwnership
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.ShareOwnership;

        /**
         * Creates a plain object from a ShareOwnership message. Also converts values to other types if specified.
         * @param message ShareOwnership
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.ShareOwnership, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ShareOwnership to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ShareOwnership
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a MakeTransfer. */
    interface IMakeTransfer {

        /** MakeTransfer fromAccountId */
        fromAccountId?: (number|Long|null);

        /** MakeTransfer toAccountId */
        toAccountId?: (number|Long|null);

        /** MakeTransfer amount */
        amount?: (number|null);

        /** MakeTransfer note */
        note?: (string|null);
    }

    /** Represents a MakeTransfer. */
    class MakeTransfer implements IMakeTransfer {

        /**
         * Constructs a new MakeTransfer.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.IMakeTransfer);

        /** MakeTransfer fromAccountId. */
        public fromAccountId: (number|Long);

        /** MakeTransfer toAccountId. */
        public toAccountId: (number|Long);

        /** MakeTransfer amount. */
        public amount: number;

        /** MakeTransfer note. */
        public note: string;

        /**
         * Creates a new MakeTransfer instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MakeTransfer instance
         */
        public static create(properties?: websocket_api.IMakeTransfer): websocket_api.MakeTransfer;

        /**
         * Encodes the specified MakeTransfer message. Does not implicitly {@link websocket_api.MakeTransfer.verify|verify} messages.
         * @param message MakeTransfer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.IMakeTransfer, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MakeTransfer message, length delimited. Does not implicitly {@link websocket_api.MakeTransfer.verify|verify} messages.
         * @param message MakeTransfer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.IMakeTransfer, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MakeTransfer message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MakeTransfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.MakeTransfer;

        /**
         * Decodes a MakeTransfer message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MakeTransfer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.MakeTransfer;

        /**
         * Verifies a MakeTransfer message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MakeTransfer message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MakeTransfer
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.MakeTransfer;

        /**
         * Creates a plain object from a MakeTransfer message. Also converts values to other types if specified.
         * @param message MakeTransfer
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.MakeTransfer, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MakeTransfer to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for MakeTransfer
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CreateMarket. */
    interface ICreateMarket {

        /** CreateMarket name */
        name?: (string|null);

        /** CreateMarket description */
        description?: (string|null);

        /** CreateMarket minSettlement */
        minSettlement?: (number|null);

        /** CreateMarket maxSettlement */
        maxSettlement?: (number|null);

        /** CreateMarket redeemableFor */
        redeemableFor?: (websocket_api.IRedeemable[]|null);

        /** CreateMarket redeemFee */
        redeemFee?: (number|null);
    }

    /** Represents a CreateMarket. */
    class CreateMarket implements ICreateMarket {

        /**
         * Constructs a new CreateMarket.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.ICreateMarket);

        /** CreateMarket name. */
        public name: string;

        /** CreateMarket description. */
        public description: string;

        /** CreateMarket minSettlement. */
        public minSettlement: number;

        /** CreateMarket maxSettlement. */
        public maxSettlement: number;

        /** CreateMarket redeemableFor. */
        public redeemableFor: websocket_api.IRedeemable[];

        /** CreateMarket redeemFee. */
        public redeemFee: number;

        /**
         * Creates a new CreateMarket instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateMarket instance
         */
        public static create(properties?: websocket_api.ICreateMarket): websocket_api.CreateMarket;

        /**
         * Encodes the specified CreateMarket message. Does not implicitly {@link websocket_api.CreateMarket.verify|verify} messages.
         * @param message CreateMarket message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.ICreateMarket, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateMarket message, length delimited. Does not implicitly {@link websocket_api.CreateMarket.verify|verify} messages.
         * @param message CreateMarket message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.ICreateMarket, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateMarket message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateMarket
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.CreateMarket;

        /**
         * Decodes a CreateMarket message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateMarket
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.CreateMarket;

        /**
         * Verifies a CreateMarket message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateMarket message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateMarket
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.CreateMarket;

        /**
         * Creates a plain object from a CreateMarket message. Also converts values to other types if specified.
         * @param message CreateMarket
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.CreateMarket, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateMarket to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateMarket
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a SettleMarket. */
    interface ISettleMarket {

        /** SettleMarket marketId */
        marketId?: (number|Long|null);

        /** SettleMarket settlePrice */
        settlePrice?: (number|null);
    }

    /** Represents a SettleMarket. */
    class SettleMarket implements ISettleMarket {

        /**
         * Constructs a new SettleMarket.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.ISettleMarket);

        /** SettleMarket marketId. */
        public marketId: (number|Long);

        /** SettleMarket settlePrice. */
        public settlePrice: number;

        /**
         * Creates a new SettleMarket instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SettleMarket instance
         */
        public static create(properties?: websocket_api.ISettleMarket): websocket_api.SettleMarket;

        /**
         * Encodes the specified SettleMarket message. Does not implicitly {@link websocket_api.SettleMarket.verify|verify} messages.
         * @param message SettleMarket message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.ISettleMarket, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SettleMarket message, length delimited. Does not implicitly {@link websocket_api.SettleMarket.verify|verify} messages.
         * @param message SettleMarket message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.ISettleMarket, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SettleMarket message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SettleMarket
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.SettleMarket;

        /**
         * Decodes a SettleMarket message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SettleMarket
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.SettleMarket;

        /**
         * Verifies a SettleMarket message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SettleMarket message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SettleMarket
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.SettleMarket;

        /**
         * Creates a plain object from a SettleMarket message. Also converts values to other types if specified.
         * @param message SettleMarket
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.SettleMarket, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SettleMarket to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for SettleMarket
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CreateOrder. */
    interface ICreateOrder {

        /** CreateOrder marketId */
        marketId?: (number|Long|null);

        /** CreateOrder price */
        price?: (number|null);

        /** CreateOrder size */
        size?: (number|null);

        /** CreateOrder side */
        side?: (websocket_api.Side|null);
    }

    /** Represents a CreateOrder. */
    class CreateOrder implements ICreateOrder {

        /**
         * Constructs a new CreateOrder.
         * @param [properties] Properties to set
         */
        constructor(properties?: websocket_api.ICreateOrder);

        /** CreateOrder marketId. */
        public marketId: (number|Long);

        /** CreateOrder price. */
        public price: number;

        /** CreateOrder size. */
        public size: number;

        /** CreateOrder side. */
        public side: websocket_api.Side;

        /**
         * Creates a new CreateOrder instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateOrder instance
         */
        public static create(properties?: websocket_api.ICreateOrder): websocket_api.CreateOrder;

        /**
         * Encodes the specified CreateOrder message. Does not implicitly {@link websocket_api.CreateOrder.verify|verify} messages.
         * @param message CreateOrder message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: websocket_api.ICreateOrder, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateOrder message, length delimited. Does not implicitly {@link websocket_api.CreateOrder.verify|verify} messages.
         * @param message CreateOrder message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: websocket_api.ICreateOrder, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateOrder message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateOrder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): websocket_api.CreateOrder;

        /**
         * Decodes a CreateOrder message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateOrder
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): websocket_api.CreateOrder;

        /**
         * Verifies a CreateOrder message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateOrder message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateOrder
         */
        public static fromObject(object: { [k: string]: any }): websocket_api.CreateOrder;

        /**
         * Creates a plain object from a CreateOrder message. Also converts values to other types if specified.
         * @param message CreateOrder
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: websocket_api.CreateOrder, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateOrder to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateOrder
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of a Timestamp. */
        interface ITimestamp {

            /** Timestamp seconds */
            seconds?: (number|Long|null);

            /** Timestamp nanos */
            nanos?: (number|null);
        }

        /** Represents a Timestamp. */
        class Timestamp implements ITimestamp {

            /**
             * Constructs a new Timestamp.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.ITimestamp);

            /** Timestamp seconds. */
            public seconds: (number|Long);

            /** Timestamp nanos. */
            public nanos: number;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Timestamp instance
             */
            public static create(properties?: google.protobuf.ITimestamp): google.protobuf.Timestamp;

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Timestamp;

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Timestamp;

            /**
             * Verifies a Timestamp message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Timestamp
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Timestamp;

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @param message Timestamp
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Timestamp to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Timestamp
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
